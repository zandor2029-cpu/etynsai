import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Video, Clapperboard, Play, Zap, AlertCircle, Check, Settings, Wand2, Upload, X, Clock, LayoutGrid, List, Info, Sparkles, ChevronDown, Film } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import VideoResolutionSelect, { VIDEO_CREDIT_COSTS } from "@/components/VideoResolutionSelect";
import PromptAssistant from "@/components/PromptAssistant";
import WatermelonLoader from "@/components/WatermelonLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsWithAmount, canAffordAmount, refundCreditsWithAmount } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { uploadFileForGeneration } from "@/hooks/useFileUpload";
import { generateVideo } from "@/hooks/useGeneration";
import { saveRender } from "@/hooks/useRenders";
import { usePromptAssistant } from "@/hooks/usePromptAssistant";

const SUB_TABS = ["Criar Vídeo", "Motion Control"];

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
  const [activeSubTab, setActiveSubTab] = useState("Motion Control");
  const [activeTab, setActiveTab] = useState("Histórico");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        const saveResult = await saveRender({ type: 'video', url: result.videoUrl, prompt: currentPrompt || 'Vídeo gerado com IA', model: 'wan-2.2-i2v-fast' });
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
    <div className="flex flex-col h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">

      {/* SUB TABS */}
      <div className="flex items-center px-3 md:px-5 h-10 md:h-11 border-b border-border flex-shrink-0">
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`h-full px-3 md:px-4 text-xs md:text-[13px] border-b-2 transition-all ${
              activeSubTab === tab
                ? "text-foreground font-semibold border-watermelon-green"
                : "text-muted-foreground font-normal border-transparent hover:text-foreground/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT - stacked on mobile, 3-panel on desktop */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT PANEL - Controls */}
        <div className="lg:w-[280px] bg-card lg:border-r border-b lg:border-b-0 border-border flex flex-col overflow-hidden flex-shrink-0 max-h-[50vh] lg:max-h-none">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {/* Tutorial card - hidden on mobile for space */}
            <div className="hidden md:block rounded-xl overflow-hidden border border-border bg-muted">
              <div className="flex items-stretch h-[88px]">
                <div className="flex-1 p-3 flex flex-col justify-center">
                  <div className="text-watermelon-green font-extrabold text-[13px] tracking-wide mb-1">MOTION CONTROL</div>
                  <div className="text-muted-foreground text-[10.5px] leading-snug">Transforme imagens em vídeos com movimentos realistas</div>
                </div>
                <div className="w-[88px] bg-muted relative overflow-hidden">
                  <div className="absolute top-1.5 right-1.5 bg-background/70 border border-border rounded px-1.5 py-0.5 text-[10px] text-muted-foreground flex items-center gap-1 backdrop-blur-sm">
                    <Play className="w-[9px] h-[9px]" />
                    Como funciona
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                    <Film className="w-9 h-9 text-muted-foreground/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: compact row layout for upload + settings */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {/* Upload area */}
              <div className="bg-muted border border-dashed border-border rounded-xl p-3 sm:flex-1 lg:flex-none">
                <div className="flex gap-2.5">
                  {!characterPreview ? (
                    <label className="flex-1 bg-background rounded-lg border border-dashed border-border flex flex-col items-center justify-center h-20 md:h-24 cursor-pointer hover:border-watermelon-green/40 transition-colors group">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center mb-1.5 group-hover:bg-watermelon-green/10 transition-colors">
                        <Upload className="w-3 h-3 text-muted-foreground group-hover:text-watermelon-green transition-colors" />
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center leading-snug">Adicionar imagem<br/>para animar</div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex-1 bg-background rounded-lg overflow-hidden relative h-20 md:h-24">
                      <img src={characterPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={handleClearImage}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/80 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Model + Quality side-by-side on mobile */}
              <div className="flex flex-row sm:flex-col lg:flex-col gap-2 sm:flex-1 lg:flex-none">
                {/* Model selector */}
                <div className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 md:py-2.5 cursor-pointer flex justify-between items-center hover:border-border/80 transition-colors">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Modelo</div>
                    <div className="text-[11px] md:text-[12.5px] text-foreground flex items-center gap-1.5">
                      Nano Banana Motion
                      <Info className="w-[13px] h-[13px] text-muted-foreground hidden sm:inline" />
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </div>

                {/* Quality / Resolution */}
                <div className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 md:py-2.5">
                  <div className="text-[10px] text-muted-foreground mb-1.5 md:mb-2">Qualidade</div>
                  <div className="flex gap-1.5">
                    {(["480p", "720p"] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex-1 py-1 md:py-1.5 rounded-md text-[11px] md:text-[12px] font-medium transition-all ${
                          resolution === res
                            ? "bg-watermelon-green text-watermelon-green-foreground shadow-sm"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {res}
                        <span className="ml-1 text-[9px] md:text-[10px] opacity-70">({VIDEO_CREDIT_COSTS[res]}cr)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt / Instructions */}
            <div className="bg-muted border border-border rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clapperboard className="w-3 h-3" />
                  Descrição do Movimento
                </div>
                <button
                  onClick={handleEnhancePrompt}
                  disabled={instructions.trim().length < 3 || promptAssistant.isLoading}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-watermelon-green/10 border border-watermelon-green/30 text-watermelon-green hover:border-watermelon-green/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Wand2 className="w-2.5 h-2.5" />
                  IA
                </button>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => {
                  setInstructions(e.target.value);
                  if (showAssistant) { setShowAssistant(false); promptAssistant.clear(); }
                }}
                placeholder="Ex: andar para frente, acenar, dançar..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-watermelon-green/40 transition-colors"
                rows={2}
              />
              {showAssistant && (
                <div className="mt-2">
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
          </div>

          {/* Generate button */}
          <div className="p-3 border-t border-border flex-shrink-0">
            <button
              onClick={handleGenerate}
              disabled={!canGenerateVideo || isGenerating}
              className="w-full bg-watermelon-green hover:bg-watermelon-green-light disabled:opacity-40 disabled:cursor-not-allowed border-none rounded-xl py-3 md:py-3.5 text-xs md:text-sm font-bold text-background cursor-pointer flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-watermelon-green/20"
            >
              {isGenerating ? (
                <>Gerando...</>
              ) : (
                <>
                  Gerar Vídeo
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] md:text-[12px] opacity-80">{creditCost}</span>
                </>
              )}
            </button>
            {!canGenerateVideo && !isGenerating && (
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                📎 Faça upload de uma imagem para começar
              </p>
            )}
            {!user && canGenerateVideo && (
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                🔐 Faça login para gerar vídeos
              </p>
            )}
          </div>
        </div>

        {/* CENTER - Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[200px]">

          {/* Center tabs */}
          <div className="flex items-center px-3 md:px-4 h-10 md:h-11 border-b border-border flex-shrink-0 justify-between">
            <div className="flex gap-1">
              {["Histórico", "Galeria"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-2 md:px-3 py-1 text-xs md:text-[13px] rounded-md transition-colors ${
                    activeTab === tab ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "Histórico" ? <Clock className="w-[13px] h-[13px]" /> : <LayoutGrid className="w-[13px] h-[13px]" />}
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              {/* Mobile: show info badges inline */}
              <div className="flex lg:hidden items-center gap-1.5 mr-2">
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{resolution}</span>
                <span className="text-[10px] text-watermelon-green bg-watermelon-green/10 px-1.5 py-0.5 rounded">{creditCost}cr</span>
              </div>
              <button
                onClick={() => setViewMode("grid")}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="w-[11px] h-[11px]" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
              >
                <List className="w-[11px] h-[11px]" />
              </button>
            </div>
          </div>

          {/* Video preview area */}
          <div className="flex-1 flex items-center justify-center bg-background relative p-4">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-4 md:gap-6"
                >
                  <WatermelonLoader text="Gerando seu vídeo… 🎥" />
                  <div className="w-48 md:w-64">
                    <div className="flex justify-between text-[11px] font-semibold mb-2">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="text-watermelon-green">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-watermelon-green to-watermelon-pink rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground mt-2">{progressText}</p>
                  </div>
                </motion.div>
              ) : generationError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-3 md:gap-4 p-4 md:p-8"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground text-sm md:text-base mb-1">Erro na geração</h3>
                    <p className="text-xs md:text-[13px] text-muted-foreground max-w-sm">{generationError}</p>
                  </div>
                  <button
                    onClick={() => setGenerationError(null)}
                    className="px-4 py-2 rounded-lg bg-muted border border-border text-xs md:text-[13px] text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </motion.div>
              ) : generatedVideo ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative max-w-[400px] lg:max-w-[560px] w-full max-h-full rounded-lg overflow-hidden bg-card"
                  style={{ aspectRatio: "9/16" }}
                >
                  <video
                    src={generatedVideo}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {isSaved && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 bg-watermelon-green/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] text-watermelon-green font-medium"
                      >
                        <Check className="w-3 h-3" />
                        Salvo
                      </motion.div>
                    )}
                  </div>
                  {/* Mobile: download button overlay */}
                  <div className="absolute bottom-3 right-3 lg:hidden flex gap-2">
                    <a
                      href={generatedVideo}
                      download="video.mp4"
                      className="bg-background/80 backdrop-blur-sm rounded-full p-2 text-foreground"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-3 md:gap-4 text-muted-foreground"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-muted flex items-center justify-center">
                    <Video className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-[14px] font-medium text-foreground/60">Nenhum vídeo gerado</p>
                    <p className="text-[11px] md:text-[12px] text-muted-foreground mt-1">Faça upload de uma imagem e clique em Gerar</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL - Details (hidden on mobile) */}
        <div className="hidden lg:flex w-[220px] bg-card border-l border-border flex-col flex-shrink-0">
          {/* Action buttons */}
          <div className="flex gap-1.5 p-2.5 border-b border-border">
            <a
              href={generatedVideo || "#"}
              download={generatedVideo ? "video.mp4" : undefined}
              className={`flex-1 bg-muted border border-border rounded-md py-1.5 text-[11.5px] flex items-center justify-center gap-1 transition-colors ${
                generatedVideo ? "text-foreground hover:bg-muted/80 cursor-pointer" : "text-muted-foreground/40 pointer-events-none"
              }`}
            >
              <Download className="w-3 h-3" />
              Baixar
            </a>
            <button
              onClick={() => { setGeneratedVideo(null); setGenerationError(null); }}
              className="flex-1 bg-muted border border-border text-muted-foreground rounded-md py-1.5 text-[11.5px] flex items-center justify-center gap-1 hover:bg-muted/80 transition-colors"
            >
              <Video className="w-3 h-3" />
              Novo
            </button>
          </div>

          {/* Prompt display */}
          <div className="p-2.5 border-b border-border">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {currentPrompt || instructions || (
                <span className="italic text-muted-foreground/50">Nenhuma descrição de movimento definida</span>
              )}
            </p>
          </div>

          {/* Reference thumbnails */}
          {characterPreview && (
            <div className="p-2.5 border-b border-border">
              <div className="text-[10px] text-muted-foreground mb-2">Imagem de referência</div>
              <div className="flex gap-2">
                <div className="w-[70px] h-[52px] rounded-md overflow-hidden border border-border">
                  <img src={characterPreview} alt="Referência" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Quality badge */}
          <div className="p-2.5">
            <div className="inline-flex items-center gap-1 bg-muted border border-border rounded px-2 py-1 text-[11px] text-muted-foreground">
              <Sparkles className="w-[11px] h-[11px]" />
              {resolution}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 bg-watermelon-green/10 border border-watermelon-green/20 rounded px-2 py-1 text-[11px] text-watermelon-green">
              <Zap className="w-[11px] h-[11px]" />
              {creditCost} créditos
            </div>
          </div>
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
