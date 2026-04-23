import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Video, Zap, AlertCircle, Check, Upload, X, Sparkles,
  Film, RotateCcw, Image as ImageIcon, User, ChevronRight, Play,
} from "lucide-react";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import WatermelonLoader from "@/components/WatermelonLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsWithAmount, canAffordAmount, refundCreditsWithAmount } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { uploadFileForGeneration } from "@/hooks/useFileUpload";
import { faceSwapVideo } from "@/hooks/useGeneration";
import { saveRender } from "@/hooks/useRenders";

// Custo fixo de créditos para face swap em vídeo
export const FACE_SWAP_CREDIT_COST = 15;

const KlingMotionControl = () => {
  // Imagem do personagem (rosto a inserir)
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);

  // Vídeo de referência (alvo onde o rosto será trocado)
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
  const [referenceVideoPreview, setReferenceVideoPreview] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const characterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const creditCost = FACE_SWAP_CREDIT_COST;
  const currentCredits = profile?.credits ?? 0;
  const canGenerate = characterImage !== null && referenceVideo !== null;

  const handleCharacterSelect = useCallback((file: File | null) => {
    if (file && !file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Envie uma imagem (JPG, PNG, WEBP).", variant: "destructive" });
      return;
    }
    setCharacterImage(file);
    if (characterPreview) URL.revokeObjectURL(characterPreview);
    setCharacterPreview(file ? URL.createObjectURL(file) : null);
  }, [characterPreview, toast]);

  const handleVideoSelect = useCallback((file: File | null) => {
    if (file && !file.type.startsWith("video/")) {
      toast({ title: "Arquivo inválido", description: "Envie um vídeo (MP4, MOV, WEBM).", variant: "destructive" });
      return;
    }
    if (file && file.size > 50 * 1024 * 1024) {
      toast({ title: "Vídeo muito grande", description: "O vídeo deve ter no máximo 50MB.", variant: "destructive" });
      return;
    }
    setReferenceVideo(file);
    if (referenceVideoPreview) URL.revokeObjectURL(referenceVideoPreview);
    setReferenceVideoPreview(file ? URL.createObjectURL(file) : null);
  }, [referenceVideoPreview, toast]);

  const handleClearCharacter = useCallback(() => {
    if (characterPreview) URL.revokeObjectURL(characterPreview);
    setCharacterImage(null);
    setCharacterPreview(null);
  }, [characterPreview]);

  const handleClearVideo = useCallback(() => {
    if (referenceVideoPreview) URL.revokeObjectURL(referenceVideoPreview);
    setReferenceVideo(null);
    setReferenceVideoPreview(null);
  }, [referenceVideoPreview]);

  const handleGenerate = async () => {
    if (!canGenerate || !characterImage || !referenceVideo) return;
    if (!user) { setShowAuthModal(true); return; }
    if (!canAffordAmount(currentCredits, creditCost)) { setShowNoCreditsModal(true); return; }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setGenerationError(null);
    setProgress(0);
    setProgressText("Preparando arquivos...");
    setIsSaved(false);

    let creditsWereDeducted = false;

    try {
      setProgress(8);
      setProgressText("Enviando imagem do personagem...");
      const imageUpload = await uploadFileForGeneration(characterImage, user.id);
      if (!imageUpload.success || !imageUpload.url) {
        throw new Error(imageUpload.error || 'Falha ao enviar a imagem');
      }

      setProgress(20);
      setProgressText("Enviando vídeo de referência...");
      const videoUpload = await uploadFileForGeneration(referenceVideo, user.id);
      if (!videoUpload.success || !videoUpload.url) {
        throw new Error(videoUpload.error || 'Falha ao enviar o vídeo');
      }

      setProgress(30);
      setProgressText("Processando créditos...");
      const creditResult = await useCreditsWithAmount(creditCost, 'video', `Face swap em vídeo`);
      if (!creditResult.success) throw new Error(creditResult.message);
      creditsWereDeducted = true;
      await refreshProfile();

      setProgress(40);
      setProgressText("Iniciando troca de rosto com IA...");

      let currentProgress = 40;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 2, 92);
        setProgress(currentProgress);
        if (currentProgress < 55) setProgressText("Detectando rostos...");
        else if (currentProgress < 70) setProgressText("Mapeando expressões...");
        else if (currentProgress < 85) setProgressText("Renderizando vídeo final...");
        else setProgressText("Finalizando...");
      }, 4000);

      const result = await faceSwapVideo({
        characterImageUrl: imageUpload.url,
        targetVideoUrl: videoUpload.url,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setIsGenerating(false);

      if (result.success && result.videoUrl) {
        setGeneratedVideo(result.videoUrl);
        const saveResult = await saveRender({
          type: 'video',
          url: result.videoUrl,
          prompt: 'Face swap em vídeo',
          model: 'roop_face_swap',
        });
        if (saveResult.success) setIsSaved(true);
        toast({
          title: 'Vídeo gerado! 🎬',
          description: `Foram utilizados ${creditCost} créditos. Saldo: ${creditResult.newBalance}`,
        });
      } else {
        throw new Error(result.error || 'Erro ao gerar vídeo');
      }
    } catch (error) {
      setIsGenerating(false);
      setProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setGenerationError(errorMessage);

      if (creditsWereDeducted) {
        try {
          const refundResult = await refundCreditsWithAmount(creditCost, `Reembolso: ${errorMessage}`);
          if (refundResult.success) {
            await refreshProfile();
            toast({ title: 'Créditos reembolsados', description: `Seus ${creditCost} créditos foram devolvidos.` });
          } else {
            toast({ title: 'Erro na geração', description: `${errorMessage}. Não foi possível reembolsar. Contate o suporte.`, variant: 'destructive' });
            return;
          }
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }
      }
      toast({ title: 'Erro na geração', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setGeneratedVideo(null);
    setGenerationError(null);
    handleClearCharacter();
    handleClearVideo();
  };

  return (
    <div className="relative flex flex-col min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/8 blur-[160px]" />
      </div>

      {/* Two-column layout: sidebar + main */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 md:p-6 lg:p-8 min-h-0">

        {/* === SIDEBAR (Higgsfield-style left panel) === */}
        <aside className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 flex flex-col gap-2.5">
            {/* Tool hero banner — Higgsfield style */}
            <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card/95 shadow-xl shadow-primary/10 aspect-[16/7]">
              {/* Gradient backdrop simulating the Higgsfield hero collage */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-etyns-cyan/30 to-primary/40" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.5),transparent_60%),radial-gradient(circle_at_70%_70%,hsl(var(--etyns-cyan)/0.5),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Title */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h1 className="text-[18px] font-black tracking-tight uppercase text-etyns-cyan drop-shadow-[0_0_12px_hsl(var(--etyns-cyan)/0.6)] leading-tight">
                  Motion Control
                </h1>
                <p className="text-[11px] text-white/85 leading-tight mt-0.5 font-medium">
                  Controle o movimento com vídeos de referência
                </p>
              </div>

              {/* "How it works" pill */}
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white hover:bg-black/80 transition-colors"
              >
                <Play className="w-2.5 h-2.5" />
                Como funciona
              </button>
            </div>

            {/* Two compact upload slots — Higgsfield style */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Slot 1 — Reference video */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className={`relative w-full aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 overflow-hidden transition-all group ${
                    referenceVideoPreview
                      ? "border-primary/60 bg-card/95"
                      : "border-border/40 bg-card/95 hover:border-primary/50 hover:bg-card"
                  }`}
                >
                  {referenceVideoPreview ? (
                    <>
                      <video
                        src={referenceVideoPreview}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted loop autoPlay playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); handleClearVideo(); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleClearVideo(); }
                          }}
                          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 hover:bg-destructive flex items-center justify-center text-white transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <Video className="w-4 h-4 text-foreground/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center px-2">
                        <p className="text-[11.5px] font-bold text-foreground leading-tight">Adicionar vídeo</p>
                        <p className="text-[9.5px] text-muted-foreground leading-tight mt-1">Cópia do movimento<br/>3-30 segundos</p>
                      </div>
                    </>
                  )}
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoSelect(e.target.files?.[0] || null)}
                />
              </div>

              {/* Slot 2 — Character image */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => characterInputRef.current?.click()}
                  className={`relative w-full aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 overflow-hidden transition-all group ${
                    characterPreview
                      ? "border-etyns-cyan/60 bg-card/95"
                      : "border-border/40 bg-card/95 hover:border-etyns-cyan/50 hover:bg-card"
                  }`}
                >
                  {characterPreview ? (
                    <>
                      <img
                        src={characterPreview}
                        alt="Personagem"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); handleClearCharacter(); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleClearCharacter(); }
                          }}
                          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 hover:bg-destructive flex items-center justify-center text-white transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-etyns-cyan/15 transition-colors">
                        <User className="w-4 h-4 text-foreground/60 group-hover:text-etyns-cyan transition-colors" />
                      </div>
                      <div className="text-center px-2">
                        <p className="text-[11.5px] font-bold text-foreground leading-tight">Adicionar personagem</p>
                        <p className="text-[9.5px] text-muted-foreground leading-tight mt-1">Imagem com<br/>rosto e corpo</p>
                      </div>
                    </>
                  )}
                </button>
                <input
                  ref={characterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCharacterSelect(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Spec rows — Higgsfield style */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border/40 bg-card/95">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Modelo</span>
                  <span className="text-[13px] font-bold mt-0.5">Kling Motion 3.0</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border/40 bg-card/95">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Qualidade</span>
                  <span className="text-[13px] font-bold mt-0.5">Full HD · 1080p</span>
                </div>
              </div>
            </div>

            {/* Error inline */}
            {generationError && !isGenerating && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-[11.5px] text-destructive font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-snug">{generationError}</span>
              </div>
            )}

            {/* Generate button — Higgsfield neon yellow style */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-1 rounded-2xl bg-etyns-cyan disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-background font-bold text-[14px] shadow-[0_0_30px_hsl(var(--etyns-cyan)/0.4)] hover:shadow-[0_0_40px_hsl(var(--etyns-cyan)/0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span>Gerar</span>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[13px] font-bold">{creditCost}</span>
            </button>

            {!canGenerate && !isGenerating && (
              <p className="text-[11px] text-muted-foreground text-center -mt-1">
                {!referenceVideo && !characterImage
                  ? "Adicione um vídeo e uma imagem para começar"
                  : !referenceVideo
                  ? "Falta o vídeo de referência"
                  : "Falta a imagem do personagem"}
              </p>
            )}
            {canGenerate && !user && !isGenerating && (
              <p className="text-[11px] text-muted-foreground text-center -mt-1">🔐 Faça login para gerar vídeos</p>
            )}
          </div>
        </aside>

        {/* === MAIN PANEL (right side hero / preview / result) === */}
        <main className="flex-1 min-w-0 min-h-[60vh] lg:min-h-0">
          <div className="relative w-full h-full rounded-3xl overflow-hidden border border-border/60 bg-card/30 backdrop-blur-sm">

            <AnimatePresence mode="wait">
              {/* RESULT */}
              {generatedVideo && !isGenerating ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-10 gap-5"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mb-3">
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Pronto</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Seu face swap está pronto</h2>
                  </div>

                  <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-black border border-border/60 shadow-2xl shadow-primary/20">
                    <video src={generatedVideo} className="w-full h-auto" controls autoPlay loop playsInline />
                    {isSaved && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] text-primary-foreground font-semibold shadow-lg">
                        <Check className="w-3 h-3" />
                        Salvo no histórico
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <a
                      href={generatedVideo}
                      download="face-swap.mp4"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-[13px] font-semibold transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Baixar vídeo
                    </a>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-etyns-cyan text-white font-semibold text-[13px] shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Novo vídeo
                    </button>
                  </div>
                </motion.div>
              ) : isGenerating ? (
                /* GENERATING */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-10 gap-8"
                >
                  <WatermelonLoader text="Trocando o rosto…" />
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-[12px] font-semibold mb-2">
                      <span className="text-muted-foreground">{progressText}</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-etyns-cyan rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground mt-3">
                      Isso pode levar até 2 minutos. Não feche a aba.
                    </p>
                  </div>
                </motion.div>
              ) : (referenceVideoPreview || characterPreview) ? (
                /* PREVIEW (when at least one input is uploaded) */
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-10 gap-6"
                >
                  <div className="text-center max-w-lg">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Pré-visualização</h2>
                    <p className="text-[12.5px] text-muted-foreground">
                      O rosto da imagem será aplicado ao vídeo, preservando movimento e iluminação.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Video preview */}
                    <div className="relative">
                      <div className="w-40 h-52 md:w-48 md:h-64 rounded-2xl overflow-hidden border-2 border-primary/40 bg-black shadow-xl shadow-primary/20">
                        {referenceVideoPreview ? (
                          <video src={referenceVideoPreview} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/30">
                            <Video className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider">Movimento</div>
                    </div>

                    {/* Plus icon */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center shadow-lg shadow-primary/40">
                        <span className="text-white text-lg font-bold leading-none">+</span>
                      </div>
                    </div>

                    {/* Character preview */}
                    <div className="relative">
                      <div className="w-40 h-52 md:w-48 md:h-64 rounded-2xl overflow-hidden border-2 border-etyns-cyan/40 bg-black shadow-xl shadow-etyns-cyan/20">
                        {characterPreview ? (
                          <img src={characterPreview} alt="Personagem" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/30">
                            <User className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 left-2 px-2 py-0.5 rounded-full bg-etyns-cyan text-background text-[9px] font-bold uppercase tracking-wider">Rosto</div>
                    </div>
                  </div>

                  {!canGenerate && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/60 border border-border text-[11.5px] text-muted-foreground">
                      <Upload className="w-3.5 h-3.5" />
                      {!referenceVideo ? "Adicione o vídeo de movimento" : "Adicione o personagem"}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* HERO (empty state) */
                <motion.div
                  key="hero"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-10 text-center"
                >
                  {/* Decorative big text */}
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary">Face Swap em Vídeo</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-4">
                      Recrie qualquer{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10 px-2 bg-gradient-to-r from-primary to-etyns-cyan bg-clip-text text-transparent">movimento</span>
                        <span className="absolute inset-0 bg-primary/20 blur-xl -z-10" />
                      </span>
                      <br />
                      com seu personagem
                    </h1>
                    <p className="text-[13px] md:text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
                      Envie um vídeo de referência e a foto de um personagem.
                      A IA insere o rosto preservando movimento, iluminação e expressões.
                    </p>
                  </div>

                  {/* Mini preview chips */}
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden border border-border/60 bg-muted/30 rotate-[-6deg] shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-etyns-cyan/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden border border-border/60 bg-muted/30 z-10 shadow-2xl scale-110">
                      <div className="absolute inset-0 bg-gradient-to-br from-etyns-cyan/40 to-primary/40 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden border border-border/60 bg-muted/30 rotate-[6deg] shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-etyns-cyan/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Step hint */}
                  <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/60 text-[12px] font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Comece adicionando o vídeo e o personagem ao lado
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        type="video"
        creditsNeeded={creditCost}
        currentCredits={currentCredits}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default KlingMotionControl;