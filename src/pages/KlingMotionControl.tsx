import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Video, Zap, AlertCircle, Check, Wand2, Upload, X, Sparkles, Film, SlidersHorizontal, RotateCcw, Image as ImageIcon } from "lucide-react";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import { VIDEO_CREDIT_COSTS } from "@/components/VideoResolutionSelect";
import PromptAssistant from "@/components/PromptAssistant";
import WatermelonLoader from "@/components/WatermelonLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsWithAmount, canAffordAmount, refundCreditsWithAmount } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { uploadFileForGeneration } from "@/hooks/useFileUpload";
import { generateVideo } from "@/hooks/useGeneration";
import { saveRender } from "@/hooks/useRenders";
import { usePromptAssistant } from "@/hooks/usePromptAssistant";

const KlingMotionControl = () => {
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [resolution, setResolution] = useState<"480p" | "720p">("720p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [creditsDeducted, setCreditsDeducted] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const creditCost = VIDEO_CREDIT_COSTS[resolution];
  const currentCredits = profile?.credits ?? 0;
  const canGenerateVideo = characterImage !== null;

  const promptAssistant = usePromptAssistant();

  const handleFileSelect = useCallback((file: File | null) => {
    setCharacterImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCharacterPreview(url);
    } else {
      setCharacterPreview(null);
    }
  }, []);

  const handleClearImage = useCallback(() => {
    setCharacterImage(null);
    setCharacterPreview(null);
  }, []);

  const handleEnhancePrompt = useCallback(() => {
    if (instructions.trim().length >= 3) {
      setShowAssistant(true);
      promptAssistant.enhance(instructions, 'video');
    }
  }, [instructions, promptAssistant]);

  const handleApplyEnhanced = useCallback((enhanced: string) => {
    setInstructions(enhanced);
    setShowAssistant(false);
    promptAssistant.clear();
    toast({ title: "Prompt aplicado!", description: "A descrição aprimorada foi aplicada." });
  }, [promptAssistant, toast]);

  const handleApplySuggestion = useCallback((suggestion: string) => {
    setInstructions(prev => `${prev.trim()}, ${suggestion}`);
    toast({ title: "Sugestão adicionada!", description: suggestion });
  }, [toast]);

  const handleCloseAssistant = useCallback(() => {
    setShowAssistant(false);
    promptAssistant.clear();
  }, [promptAssistant]);

  const handleGenerate = async () => {
    if (!canGenerateVideo || !characterImage) return;
    if (!user) { setShowAuthModal(true); return; }
    if (!canAffordAmount(currentCredits, creditCost)) { setShowNoCreditsModal(true); return; }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setGenerationError(null);
    setProgress(0);
    setProgressText("Preparando arquivos...");
    setIsSaved(false);
    setCurrentPrompt(instructions.trim());
    setCreditsDeducted(false);

    let creditsWereDeducted = false;

    try {
      setProgress(10);
      setProgressText("Fazendo upload da imagem...");
      const imageUpload = await uploadFileForGeneration(characterImage, user.id);
      if (!imageUpload.success || !imageUpload.url) throw new Error(imageUpload.error || 'Falha ao fazer upload da imagem');

      setProgress(25);
      setProgressText("Processando créditos...");
      const creditResult = await useCreditsWithAmount(creditCost, 'video', `Geração de vídeo ${resolution}`);
      if (!creditResult.success) throw new Error(creditResult.message);
      creditsWereDeducted = true;
      setCreditsDeducted(true);
      await refreshProfile();

      setProgress(35);
      setProgressText("Iniciando geração com IA...");

      let currentProgress = 35;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 3, 90);
        setProgress(currentProgress);
        if (currentProgress < 50) setProgressText("Analisando imagem...");
        else if (currentProgress < 65) setProgressText("Gerando movimentos...");
        else if (currentProgress < 80) setProgressText("Renderizando frames...");
        else setProgressText("Finalizando vídeo...");
      }, 4000);

      const result = await generateVideo({
        characterImageUrl: imageUpload.url,
        prompt: instructions.trim() || undefined,
        duration: 5,
        resolution,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setIsGenerating(false);

      if (result.success && result.videoUrl) {
        setGeneratedVideo(result.videoUrl);
        const saveResult = await saveRender({ type: 'video', url: result.videoUrl, prompt: currentPrompt || 'Vídeo gerado com IA', model: 'kling-v2.1' });
        if (saveResult.success) setIsSaved(true);
        toast({ title: 'Vídeo gerado e salvo! 🎬', description: `Foram utilizados ${creditCost} créditos. Saldo: ${creditResult.newBalance}` });
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


  return (
    <div className="relative flex flex-col h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/10 blur-[140px]" />
      </div>

      {/* HEADER STRIP */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 md:px-8 h-14 border-b border-border/50 backdrop-blur-md bg-background/60 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center shadow-lg shadow-primary/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-primary/40 blur-md -z-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-[15px] font-bold tracking-tight truncate">Control Motion</h1>
            <p className="text-[10.5px] md:text-[11px] text-muted-foreground truncate">Powered by Kling 2.1 · Image-to-Video AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border/50">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium">{resolution}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <Zap className="w-3 h-3 text-etyns-cyan" />
            <span className="text-[11px] font-medium text-etyns-cyan">{creditCost}cr</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-muted transition-all text-[11.5px] font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar</span>
          </button>
        </div>
      </div>

      {/* CENTRAL STAGE */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden p-4 md:p-8">
        <div className="w-full max-w-[720px] flex flex-col items-center gap-6">

          {/* Preview area */}
          <div className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/60 shadow-2xl shadow-black/20">
            {/* Subtle inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6"
                >
                  <WatermelonLoader text="Gerando seu vídeo…" />
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-[11px] font-semibold mb-2">
                      <span className="text-muted-foreground">{progressText}</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-etyns-cyan rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : generationError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-sm mb-1">Erro na geração</h3>
                    <p className="text-[12px] text-muted-foreground max-w-sm">{generationError}</p>
                  </div>
                  <button
                    onClick={() => setGenerationError(null)}
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 border border-border text-[12px] font-medium transition-colors"
                  >
                    Tentar novamente
                  </button>
                </motion.div>
              ) : generatedVideo ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <video
                    src={generatedVideo}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                    loop
                  />
                  {isSaved && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] text-primary-foreground font-semibold shadow-lg"
                    >
                      <Check className="w-3 h-3" />
                      Salvo no histórico
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  {characterPreview ? (
                    <div className="relative">
                      <img src={characterPreview} alt="Imagem" className="max-h-[55%] max-w-[80%] rounded-lg shadow-xl object-contain" style={{ maxHeight: '260px' }} />
                      <button
                        onClick={handleClearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive hover:border-destructive hover:text-white transition-all shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center">
                      <Video className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="text-center max-w-sm">
                    <p className="text-[13px] font-semibold text-foreground/80">
                      {characterPreview ? "Imagem pronta para animar" : "Nenhuma imagem carregada"}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground mt-1">
                      {characterPreview ? "Adicione uma descrição abaixo e clique em Gerar" : "Faça upload de uma imagem para começar"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COMMAND BAR */}
          <div className="w-full">
            <div className="relative bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl p-2 shadow-xl shadow-black/10">
              <div className="flex items-end gap-2">
                {/* Upload button */}
                <label className={`relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  characterPreview ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted"
                }`}>
                  {characterPreview ? (
                    <img src={characterPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  />
                </label>

                {/* Prompt textarea */}
                <div className="flex-1 relative">
                  <textarea
                    value={instructions}
                    onChange={(e) => {
                      setInstructions(e.target.value);
                      if (showAssistant) { setShowAssistant(false); promptAssistant.clear(); }
                    }}
                    placeholder="Descreva o movimento… (ex: andar, acenar, dançar)"
                    rows={1}
                    className="w-full bg-transparent border-0 px-3 py-3.5 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none resize-none max-h-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (canGenerateVideo && !isGenerating) handleGenerate();
                      }
                    }}
                  />
                </div>

                {/* IA enhance */}
                <button
                  onClick={handleEnhancePrompt}
                  disabled={instructions.trim().length < 3 || promptAssistant.isLoading}
                  title="Melhorar prompt com IA"
                  className="shrink-0 w-10 h-10 rounded-xl bg-muted hover:bg-muted/70 border border-border text-foreground/70 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </button>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerateVideo || isGenerating}
                  className="shrink-0 h-12 md:h-14 px-4 md:px-6 rounded-xl bg-gradient-to-r from-primary to-etyns-cyan disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[12.5px] md:text-[13px] flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isGenerating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span className="hidden sm:inline">Gerando</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Gerar</span>
                      <span className="text-[10.5px] opacity-80 font-semibold">{creditCost}cr</span>
                    </>
                  )}
                </button>
              </div>

              {showAssistant && (
                <div className="mt-2 px-1">
                  <PromptAssistant
                    suggestions={promptAssistant.suggestions}
                    isLoading={promptAssistant.isLoading}
                    onApplyEnhanced={handleApplyEnhanced}
                    onApplySuggestion={handleApplySuggestion}
                    onClose={handleCloseAssistant}
                  />
                </div>
              )}
            </div>

            {/* Action row when result */}
            {generatedVideo && !isGenerating && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <a
                  href={generatedVideo}
                  download="video.mp4"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-card border border-border hover:border-primary/40 text-[12px] font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar vídeo
                </a>
                <button
                  onClick={() => { setGeneratedVideo(null); setGenerationError(null); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-card border border-border hover:border-primary/40 text-[12px] font-medium transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Novo vídeo
                </button>
              </div>
            )}

            {!user && canGenerateVideo && (
              <p className="text-center text-[11px] text-muted-foreground mt-3">
                🔐 Faça login para gerar vídeos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SETTINGS SHEET */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[360px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">Configurações</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Image upload */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Imagem de referência
                  </label>
                  {characterPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border h-40">
                      <img src={characterPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-white hover:border-destructive flex items-center justify-center transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer transition-all gap-2">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">Clique para selecionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>

                {/* Resolution */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Qualidade
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["480p", "720p"] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`relative px-3 py-3 rounded-xl border text-[12.5px] font-semibold transition-all ${
                          resolution === res
                            ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <div>{res}</div>
                        <div className="text-[10px] opacity-70 font-medium mt-0.5">{VIDEO_CREDIT_COSTS[res]} créditos</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model info */}
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-etyns-cyan flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-[12px] font-bold">Kling 2.1</div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Modelo premium de Image-to-Video. Gera até 5s de vídeo realista a partir da sua imagem.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-border flex-shrink-0">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[13px] transition-all"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
