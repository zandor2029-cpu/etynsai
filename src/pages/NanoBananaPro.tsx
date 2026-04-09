import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, RefreshCw, Zap, Wand2, AlertCircle, Check, ZoomIn, FolderOpen, Users, ChevronLeft, ChevronRight, Image as ImageIcon, Star, Copy, X } from "lucide-react";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import AspectRatioSelect from "@/components/AspectRatioSelect";
import ImageStyleSelect, { type ImageStyle } from "@/components/ImageStyleSelect";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import ReferenceImageUpload from "@/components/ReferenceImageUpload";
import PromptAssistant from "@/components/PromptAssistant";
import { PromptWarning } from "@/components/PromptWarning";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsForGeneration, getCreditCost, canAfford, refundCredits, checkUnlimitedImages } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { generateImage, upscaleImage } from "@/hooks/useGeneration";
import { saveRender, fetchUserRenders, type Render } from "@/hooks/useRenders";
import { usePromptValidation } from "@/hooks/usePromptValidation";
import { usePromptAssistant } from "@/hooks/usePromptAssistant";

// Gallery image card component
function GalleryCard({ render, onSelect }: { render: Render; onSelect: (render: Render) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(render)}
      className="relative rounded-lg overflow-hidden cursor-pointer bg-card border border-border/50 aspect-[3/4]"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {render.type === 'image' ? (
        <img src={render.url} alt={render.prompt || ''} className="w-full h-full object-cover" />
      ) : (
        <video src={render.url} className="w-full h-full object-cover" muted />
      )}

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary/20 border border-primary/30 text-primary-foreground hover:bg-primary/30 transition-colors">
              Ver
            </button>
            <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary/20 border border-secondary/30 text-secondary-foreground hover:bg-secondary/30 transition-colors">
              Usar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Placeholder card for empty gallery
function PlaceholderCard({ index }: { index: number }) {
  const gradients = [
    "from-card to-muted",
    "from-muted to-card",
    "from-card via-muted to-card",
  ];
  return (
    <div
      className={`relative rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradients[index % 3]} border border-border/30 flex items-center justify-center`}
      style={{ height: 240, width: 240 * 0.75 }}
    >
      <div className="text-center p-4">
        <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-[10px] text-muted-foreground/40">Suas imagens aparecerão aqui</p>
      </div>
    </div>
  );
}

const NanoBananaPro = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("flux");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showWarnings, setShowWarnings] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "community">("history");
  const [renders, setRenders] = useState<Render[]>([]);
  const [selectedRender, setSelectedRender] = useState<Render | null>(null);
  const [showPromptBar, setShowPromptBar] = useState(true);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [showRefImages, setShowRefImages] = useState(false);

  const { user, profile, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();

  const creditCost = getCreditCost('image');
  const currentCredits = profile?.credits ?? 0;
  const isUltimate = subscription?.plan === 'ultimate';

  const promptValidation = usePromptValidation(prompt);
  const promptAssistant = usePromptAssistant();

  // Load renders on mount
  useEffect(() => {
    if (user) {
      fetchUserRenders().then((result) => {
        if (result.success && result.renders) {
          setRenders(result.renders.filter(r => r.type === 'image'));
        }
      });
    }
  }, [user]);

  const handleEnhancePrompt = useCallback(() => {
    if (prompt.trim().length >= 3) {
      setShowAssistant(true);
      promptAssistant.enhance(prompt, 'image');
    }
  }, [prompt, promptAssistant]);

  const handleApplyEnhanced = useCallback((enhanced: string) => {
    setPrompt(enhanced);
    setShowAssistant(false);
    promptAssistant.clear();
    toast({ title: "Prompt aplicado!", description: "O prompt aprimorado foi aplicado." });
  }, [promptAssistant, toast]);

  const handleApplySuggestion = useCallback((suggestion: string) => {
    setPrompt(prev => `${prev.trim()}, ${suggestion}`);
    toast({ title: "Sugestão adicionada!", description: suggestion });
  }, [toast]);

  const handleCloseAssistant = useCallback(() => {
    setShowAssistant(false);
    promptAssistant.clear();
  }, [promptAssistant]);

  const handleSelectRender = useCallback((render: Render) => {
    setSelectedRender(render);
    setGeneratedImage(render.url);
    setCurrentPrompt(render.prompt || "");
    setIsImageLoading(false);
    setImageLoadError(null);
    setGenerationError(null);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!isUltimate && !canAfford(currentCredits, 'image')) {
      setShowNoCreditsModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setIsImageLoading(false);
    setImageLoadError(null);
    setGenerationError(null);
    setIsSaved(false);
    setIsUpscaled(false);
    setSelectedRender(null);
    setCurrentPrompt(prompt.trim());

    let creditsWereDeducted = false;
    let wasSkipped = false;

    try {
      const creditResult = await useCreditsForGeneration('image', `Geração: ${prompt.substring(0, 50)}...`);
      if (!creditResult.success) throw new Error(creditResult.message);
      creditsWereDeducted = !creditResult.skipped;
      wasSkipped = creditResult.skipped ?? false;
      await refreshProfile();

      const result = await generateImage({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        style: imageStyle,
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      });

      setIsGenerating(false);

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setIsImageLoading(true);
        setImageLoadError(null);

        const saveResult = await saveRender({
          type: 'image',
          url: result.imageUrl,
          prompt: currentPrompt,
          model: 'gemini-2.5-flash-image',
        });

        if (saveResult.success) {
          setIsSaved(true);
          // Add to local renders list
          if (saveResult.render) {
            setRenders(prev => [saveResult.render!, ...prev]);
          }
        }

        toast({
          title: 'Imagem gerada e salva! 🍉',
          description: wasSkipped
            ? 'Imagens ilimitadas no plano Ultimate! 🚀'
            : `Foram utilizados ${creditCost} créditos. Saldo: ${creditResult.newBalance}`,
        });
      } else {
        throw new Error(result.error || 'Erro ao gerar imagem');
      }
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setGenerationError(errorMessage);

      if (creditsWereDeducted) {
        try {
          const refundResult = await refundCredits('image', `Reembolso: ${errorMessage}`);
          if (refundResult.success) {
            await refreshProfile();
            toast({ title: 'Créditos reembolsados', description: `Seus ${creditCost} créditos foram devolvidos.` });
          } else {
            toast({ title: 'Erro na geração', description: `${errorMessage}. Não foi possível reembolsar.`, variant: 'destructive' });
            return;
          }
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }
      }

      toast({ title: 'Erro na geração', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleUpscale = async () => {
    if (!generatedImage || isUpscaling || isUpscaled) return;
    if (!user) { setShowAuthModal(true); return; }
    if (!isUltimate && !canAfford(currentCredits, 'image')) { setShowNoCreditsModal(true); return; }

    setIsUpscaling(true);
    let creditsWereDeducted = false;

    try {
      const creditResult = await useCreditsForGeneration('image', `Upscale: ${currentPrompt.substring(0, 30)}...`);
      if (!creditResult.success) throw new Error(creditResult.message);
      creditsWereDeducted = !creditResult.skipped;
      await refreshProfile();

      const result = await upscaleImage({ imageUrl: generatedImage, scale: 2 });
      setIsUpscaling(false);

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setIsUpscaled(true);
        setIsImageLoading(true);

        await saveRender({
          type: 'image',
          url: result.imageUrl,
          prompt: `[UPSCALE] ${currentPrompt}`,
          model: 'gemini-upscale',
        });

        toast({ title: 'Imagem melhorada! 🚀', description: 'Resolução aumentada com sucesso.' });
      } else {
        throw new Error(result.error || 'Erro ao melhorar imagem');
      }
    } catch (error) {
      setIsUpscaling(false);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (creditsWereDeducted) {
        try {
          const refundResult = await refundCredits('image', `Reembolso upscale: ${errorMessage}`);
          if (refundResult.success) await refreshProfile();
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }
      }
      toast({ title: 'Erro no upscale', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

      {/* HISTORY / COMMUNITY TABS */}
      <div className="flex items-center justify-between px-4 h-11 bg-background border-b border-border flex-shrink-0 mt-16">
        <div className="flex gap-1">
          {[
            { id: "history" as const, label: "Histórico", icon: FolderOpen },
            { id: "community" as const, label: "Comunidade", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Credits badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" />
          {isUltimate ? (
            <span className="text-primary font-semibold">Ilimitado</span>
          ) : (
            <span><span className="text-foreground font-semibold">{currentCredits}</span> créditos</span>
          )}
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="flex-1 overflow-y-auto p-2 relative">
        {/* Loading state */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-0 top-0 z-30 flex justify-center pt-8"
            >
              <div className="glass-card p-6 rounded-2xl border border-primary/20 shadow-2xl max-w-xs w-full">
                <WatermelonLoader text="Gerando imagem 4K… 🎨" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {generationError && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-0 z-30 flex justify-center pt-8"
            >
              <div className="glass-card p-5 rounded-2xl border border-destructive/30 max-w-sm w-full">
                <div className="flex items-start gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Erro na geração</h3>
                    <p className="text-muted-foreground text-xs mt-1">{generationError}</p>
                  </div>
                  <button onClick={() => setGenerationError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected image viewer */}
        <AnimatePresence>
          {generatedImage && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-20 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
            >
              <button
                onClick={() => { setGeneratedImage(null); setSelectedRender(null); }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="max-w-2xl w-full max-h-[70vh] relative rounded-xl overflow-hidden mb-4">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                )}
                <img
                  src={generatedImage}
                  alt={currentPrompt}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onLoad={() => { setIsImageLoading(false); setImageLoadError(null); }}
                  onError={() => { setIsImageLoading(false); setImageLoadError('Erro ao carregar imagem.'); }}
                />
              </div>

              {currentPrompt && (
                <p className="text-sm text-muted-foreground max-w-lg text-center mb-4 line-clamp-2">{currentPrompt}</p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <WatermelonButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (generatedImage) {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `nano-banana-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </WatermelonButton>

                <WatermelonButton
                  variant={isUpscaled ? "outline" : "secondary"}
                  size="sm"
                  onClick={handleUpscale}
                  disabled={isUpscaling || isUpscaled}
                >
                  {isUpscaling ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" /> Melhorando...</>
                  ) : isUpscaled ? (
                    <><Check className="w-4 h-4" /> Já melhorada</>
                  ) : (
                    <><ZoomIn className="w-4 h-4" /> Upscale</>
                  )}
                </WatermelonButton>

                <WatermelonButton variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4" />
                  Variação
                </WatermelonButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery grid */}
        {renders.length > 0 ? (
          <div className="grid grid-cols-6 gap-0.5 pb-28">
            {renders.map((render) => (
              <GalleryCard key={render.id} render={render} onSelect={handleSelectRender} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-0.5 pb-28">
            {Array.from({ length: 18 }).map((_, i) => (
              <PlaceholderCard key={i} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* FIXED BOTTOM PROMPT CARD */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[640px] max-w-[94vw] z-50">
        <motion.div
          className="glass-card border border-border/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Reference images row */}
          {referenceImages.length > 0 && (
            <div className="flex items-start gap-2 mb-3">
              <div className="flex gap-1.5 flex-shrink-0">
                {referenceImages.map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded-md overflow-hidden border border-border/50">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowRefImages(!showRefImages)}
                className="p-1.5 rounded-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Prompt text area */}
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setShowWarnings(true);
              if (showAssistant) { setShowAssistant(false); promptAssistant.clear(); }
            }}
            placeholder="Descreva a imagem que você quer gerar… 🎨"
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground mb-3"
            rows={2}
          />

          {/* AI Assistant */}
          {showAssistant && (
            <div className="mb-3">
              <PromptAssistant
                suggestions={promptAssistant.suggestions}
                isLoading={promptAssistant.isLoading}
                onApplyEnhanced={handleApplyEnhanced}
                onApplySuggestion={handleApplySuggestion}
                onClose={handleCloseAssistant}
              />
            </div>
          )}

          {/* Prompt warnings */}
          {prompt.trim() && showWarnings && !showAssistant && promptValidation.warnings.length > 0 && (
            <div className="mb-3">
              <PromptWarning
                warnings={promptValidation.warnings}
                hasBlockingWarning={promptValidation.hasBlockingWarning}
                onDismiss={() => setShowWarnings(false)}
              />
            </div>
          )}

          {/* Expandable sections */}
          <AnimatePresence>
            {showNegativePrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Negative prompt (o que NÃO quer na imagem)..."
                  className="w-full bg-muted/30 border border-border/50 rounded-lg outline-none resize-none text-xs text-foreground placeholder:text-muted-foreground p-2"
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRefImages && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <ReferenceImageUpload
                  images={referenceImages}
                  onImagesChange={setReferenceImages}
                  maxImages={2}
                  disabled={isGenerating}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Model selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-foreground font-medium">Nano Banana 2</span>
            </div>

            {/* Aspect Ratio pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <ImageIcon className="w-3 h-3" />
              <span>{aspectRatio}</span>
            </div>

            {/* Quality pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <Star className="w-3 h-3" />
              <span>4K</span>
            </div>

            {/* Toggle buttons */}
            <button
              onClick={() => setShowNegativePrompt(!showNegativePrompt)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                showNegativePrompt ? "bg-secondary/20 border border-secondary/30 text-secondary" : "bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              Neg
            </button>

            <button
              onClick={() => setShowRefImages(!showRefImages)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                showRefImages ? "bg-secondary/20 border border-secondary/30 text-secondary" : "bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              Ref
            </button>

            {/* Enhance button */}
            <button
              onClick={handleEnhancePrompt}
              disabled={prompt.trim().length < 3 || promptAssistant.isLoading}
              className="px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Wand2 className="w-3 h-3 inline mr-1" />
              IA
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Generate button */}
            <WatermelonButton
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!prompt.trim() || isGenerating}
              size="sm"
              className="rounded-xl"
            >
              Gerar
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] opacity-80">
                {isUltimate ? "∞" : `+${creditCost}`}
              </span>
            </WatermelonButton>
          </div>
        </motion.div>
      </div>

      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        type="image"
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

export default NanoBananaPro;
