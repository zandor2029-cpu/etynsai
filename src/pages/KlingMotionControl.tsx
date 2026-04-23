import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Video, Zap, AlertCircle, Check, Upload, X, Sparkles, Film, RotateCcw, Image as ImageIcon, User, ArrowRight } from "lucide-react";
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
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 md:px-8 h-16 border-b border-border/50 backdrop-blur-md bg-background/60 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center shadow-lg shadow-primary/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-primary/40 blur-md -z-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold tracking-tight truncate">Control Motion</h1>
            <p className="text-[11px] text-muted-foreground truncate">Troque o rosto de qualquer vídeo com IA</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/50">
            <Zap className="w-3.5 h-3.5 text-etyns-cyan" />
            <span className="text-[12px] font-semibold text-etyns-cyan">{creditCost} créditos</span>
            <span className="text-[10px] text-muted-foreground">/ vídeo</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">

          {/* Result mode */}
          <AnimatePresence mode="wait">
            {generatedVideo && !isGenerating ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-3">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-primary">Vídeo pronto</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Seu face swap foi concluído</h2>
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

                <div className="flex items-center gap-2">
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
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-8"
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
            ) : (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Title */}
                <div className="text-center mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
                    Coloque qualquer rosto em qualquer vídeo
                  </h2>
                  <p className="text-[13px] md:text-sm text-muted-foreground max-w-xl mx-auto">
                    Envie um vídeo de referência e a foto do personagem que você quer animar.
                    A IA fará a substituição preservando o movimento original.
                  </p>
                </div>

                {/* Two big slots */}
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch mb-6">
                  {/* Slot 1 — Reference video */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[10.5px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Etapa 1 · Vídeo
                    </div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className={`relative w-full aspect-[4/5] md:aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 overflow-hidden transition-all ${
                        referenceVideoPreview
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/70"
                      }`}
                    >
                      {referenceVideoPreview ? (
                        <>
                          <video
                            src={referenceVideoPreview}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-white">Vídeo carregado</p>
                              <p className="text-[10px] text-white/70 truncate max-w-[180px]">{referenceVideo?.name}</p>
                            </div>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); handleClearVideo(); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  handleClearVideo();
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:bg-destructive flex items-center justify-center text-white transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-etyns-cyan/20 flex items-center justify-center mb-1">
                            <Video className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-center px-6">
                            <p className="text-[14px] font-bold text-foreground mb-1">Vídeo de referência</p>
                            <p className="text-[11.5px] text-muted-foreground leading-snug">
                              O movimento e cenário virão deste vídeo
                            </p>
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-[11px] font-semibold text-foreground">
                            <Upload className="w-3.5 h-3.5" />
                            Selecionar vídeo
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">MP4, MOV, WEBM · até 50MB</p>
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

                  {/* Arrow connector */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center shadow-lg shadow-primary/40">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-primary/40 blur-md -z-10 animate-pulse" />
                    </div>
                  </div>
                  <div className="md:hidden flex items-center justify-center -my-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center rotate-90 shadow-lg shadow-primary/40">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Slot 2 — Character image */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[10.5px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-etyns-cyan" />
                      Etapa 2 · Personagem
                    </div>
                    <button
                      type="button"
                      onClick={() => characterInputRef.current?.click()}
                      className={`relative w-full aspect-[4/5] md:aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 overflow-hidden transition-all ${
                        characterPreview
                          ? "border-etyns-cyan/50 bg-etyns-cyan/5"
                          : "border-border bg-card/40 hover:border-etyns-cyan/50 hover:bg-card/70"
                      }`}
                    >
                      {characterPreview ? (
                        <>
                          <img
                            src={characterPreview}
                            alt="Personagem"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-white">Personagem carregado</p>
                              <p className="text-[10px] text-white/70 truncate max-w-[180px]">{characterImage?.name}</p>
                            </div>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); handleClearCharacter(); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  handleClearCharacter();
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:bg-destructive flex items-center justify-center text-white transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-etyns-cyan/20 to-primary/20 flex items-center justify-center mb-1">
                            <User className="w-6 h-6 text-etyns-cyan" />
                          </div>
                          <div className="text-center px-6">
                            <p className="text-[14px] font-bold text-foreground mb-1">Imagem do personagem</p>
                            <p className="text-[11.5px] text-muted-foreground leading-snug">
                              O rosto desta foto será inserido no vídeo
                            </p>
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-[11px] font-semibold text-foreground">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Selecionar imagem
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP · rosto bem visível</p>
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

                {/* Generate / Error bar */}
                <div className="flex flex-col items-center gap-3">
                  {generationError && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-[12px] text-destructive font-medium max-w-md">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{generationError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-etyns-cyan disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-bold text-[14px] shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar vídeo</span>
                    <span className="text-[11px] font-semibold opacity-80 ml-1">{creditCost} créditos</span>
                  </button>

                  {!canGenerate && (
                    <p className="text-[11.5px] text-muted-foreground">
                      {!referenceVideo && !characterImage
                        ? "Envie um vídeo de referência e uma imagem do personagem"
                        : !referenceVideo
                        ? "Falta o vídeo de referência"
                        : "Falta a imagem do personagem"}
                    </p>
                  )}
                  {canGenerate && !user && (
                    <p className="text-[11.5px] text-muted-foreground">🔐 Faça login para gerar vídeos</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
