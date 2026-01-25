import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download, RefreshCw, Zap, Wand2, AlertCircle, Check, ImagePlus } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import AspectRatioSelect from "@/components/AspectRatioSelect";
import WatermelonIcon from "@/components/WatermelonIcon";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import ReferenceImageUpload from "@/components/ReferenceImageUpload";
import { PromptWarning } from "@/components/PromptWarning";
import { AnimatedSection, AnimatedBadge } from "@/components/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsForGeneration, getCreditCost, canAfford, refundCredits, checkUnlimitedImages } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { generateImage } from "@/hooks/useGeneration";
import { saveRender } from "@/hooks/useRenders";
import { usePromptValidation } from "@/hooks/usePromptValidation";

const NanoBananaPro = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showWarnings, setShowWarnings] = useState(true);
  
  const { user, profile, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const creditCost = getCreditCost('image');
  const currentCredits = profile?.credits ?? 0;
  const isUltimate = subscription?.plan === 'ultimate';
  
  // Validate prompt in real-time
  const promptValidation = usePromptValidation(prompt);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if user has enough credits (skip for Ultimate - unlimited images)
    if (!isUltimate && !canAfford(currentCredits, 'image')) {
      setShowNoCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationError(null);
    setIsSaved(false);
    setCurrentPrompt(prompt.trim());
    
    let creditsWereDeducted = false;
    let wasSkipped = false;
    
    try {
      // Use credits first (will be skipped for Ultimate plan)
      const creditResult = await useCreditsForGeneration('image', `Geração: ${prompt.substring(0, 50)}...`);
      
      if (!creditResult.success) {
        throw new Error(creditResult.message);
      }
      
      // Mark if credits were actually deducted (not skipped)
      creditsWereDeducted = !creditResult.skipped;
      wasSkipped = creditResult.skipped ?? false;
      
      // Refresh profile to update credits display
      await refreshProfile();
      
      // Call API via edge function
      const result = await generateImage({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      });
      
      setIsGenerating(false);
      
      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        
        // Auto-save to renders
        const saveResult = await saveRender({
          type: 'image',
          url: result.imageUrl,
          prompt: currentPrompt,
          model: 'gemini-2.5-flash-image',
        });
        
        if (saveResult.success) {
          setIsSaved(true);
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
      
      // Refund credits if they were deducted
      if (creditsWereDeducted) {
        try {
          const refundResult = await refundCredits('image', `Reembolso: ${errorMessage}`);
          if (refundResult.success) {
            await refreshProfile();
            toast({
              title: 'Créditos reembolsados',
              description: `Seus ${creditCost} créditos foram devolvidos devido à falha na geração.`,
            });
          } else {
            toast({
              title: 'Erro na geração',
              description: `${errorMessage}. Não foi possível reembolsar automaticamente. Entre em contato com o suporte.`,
              variant: 'destructive',
            });
            return;
          }
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }
      }
      
      toast({
        title: 'Erro na geração',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-20 md:pt-24 pb-8 md:pb-12 px-3 md:px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <AnimatedBadge delay={0}>
            <div className="inline-flex items-center gap-1.5 md:gap-2 badge-rgb mb-3 md:mb-4 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
              <Wand2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{referenceImages.length > 0 ? 'Image-to-Image · 4K' : 'Geração em 4K Ultra HD'}</span>
            </div>
          </AnimatedBadge>
          
          <AnimatedSection delay={0.1}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6 flex items-center justify-center gap-2 md:gap-4 px-2">
              <span className="text-gradient-rgb">Nano Banana Pro 4K</span>
              <WatermelonIcon size={48} className="hidden md:inline-block" />
              <WatermelonIcon size={28} className="inline-block md:hidden flex-shrink-0" />
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              {referenceImages.length > 0 ? (
                <>
                  <span className="text-watermelon-pink font-semibold">Image-to-Image:</span> Edite, mescle e transforme suas imagens com <span className="text-watermelon-green-light font-semibold">IA de última geração</span>
                </>
              ) : (
                <>
                  Gere imagens em <span className="text-watermelon-green-light font-semibold">qualidade profissional</span> com 
                  IA de <span className="text-watermelon-pink font-semibold">última geração</span>
                </>
              )}
            </p>
          </AnimatedSection>
          
          {/* Credit cost indicator */}
          <AnimatedSection delay={0.3}>
            <div className="mt-3 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 glass-card rounded-full text-xs md:text-sm">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-watermelon-green" />
              <span className="text-muted-foreground">Custo:</span>
              {isUltimate ? (
                <>
                  <span className="font-bold text-watermelon-green">ILIMITADO</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground">(Ultimate)</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-watermelon-green">{creditCost} créditos</span>
                  <span className="text-muted-foreground hidden sm:inline">por imagem</span>
                </>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* Main Generation Card */}
        <AnimatedSection delay={0.35}>
          <div className="rgb-border p-[1px] md:p-[2px] rounded-2xl md:rounded-3xl">
            <GlassCard className="p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl">
              <div className="space-y-4 md:space-y-6">
                {/* Demo GIF Space */}
                <div className="w-full h-32 sm:h-40 md:h-56 lg:h-64 rounded-xl md:rounded-2xl bg-gradient-to-br from-watermelon-green/10 to-watermelon-pink/10 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-1.5 md:gap-2">
                  <ImagePlus className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/50" />
                  <span className="text-muted-foreground/70 text-xs md:text-sm font-medium text-center px-4">Espaço para GIF de demonstração</span>
                </div>

                {/* Prompt Field */}
                <div className="space-y-2 md:space-y-3">
                  <label className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm font-semibold text-foreground tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-watermelon-green flex-shrink-0" />
                    <span>Prompt</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      setShowWarnings(true);
                    }}
                    placeholder="Descreva a imagem que você quer gerar… seja detalhado e criativo! 🎨"
                    className="textarea-glass w-full text-sm md:text-base"
                    rows={3}
                  />
                  
                  {/* Prompt validation warnings */}
                  {prompt.trim() && showWarnings && promptValidation.warnings.length > 0 && (
                    <PromptWarning 
                      warnings={promptValidation.warnings}
                      hasBlockingWarning={promptValidation.hasBlockingWarning}
                      onDismiss={() => setShowWarnings(false)}
                    />
                  )}
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2 md:space-y-3">
                  <label className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-semibold text-muted-foreground tracking-wide">
                    <span>Negative Prompt</span>
                    <span className="text-[10px] md:text-xs font-normal opacity-70">(opcional)</span>
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="O que você NÃO quer na imagem..."
                    className="textarea-glass w-full text-sm md:text-base"
                    rows={2}
                  />
                </div>

                {/* Reference Images Upload */}
                <ReferenceImageUpload
                  images={referenceImages}
                  onImagesChange={setReferenceImages}
                  maxImages={2}
                  disabled={isGenerating}
                />

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Aspect Ratio */}
                  <AspectRatioSelect value={aspectRatio} onChange={setAspectRatio} />

                  {/* Resolution Indicator */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="flex items-center text-xs md:text-sm font-semibold text-muted-foreground tracking-wide">
                      <span>Resolução</span>
                    </label>
                    <div className="input-glass flex items-center gap-2 md:gap-3 h-[46px] md:h-[58px]">
                      <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-watermelon-green/20 to-watermelon-pink/20">
                        <Zap className="w-4 h-4 md:w-5 md:h-5 text-watermelon-green-neon" />
                      </div>
                      <div>
                        <span className="font-bold text-gradient-watermelon text-sm md:text-base">4K Ultra HD</span>
                        <p className="text-[10px] md:text-xs text-muted-foreground">3840 × 2160 pixels</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 md:pt-4">
                  <WatermelonButton
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!prompt.trim() || isGenerating}
                    size="lg"
                    className="w-full text-sm sm:text-base md:text-lg"
                  >
                    {isGenerating 
                      ? "Gerando sua obra-prima..." 
                      : isUltimate 
                        ? "Gerar Imagem 🍉 (Ilimitado)" 
                        : `Gerar Imagem 🍉 (${creditCost} créditos)`
                    }
                  </WatermelonButton>
                  
                  {!user && (
                    <p className="text-center text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 font-medium flex items-center justify-center gap-1.5 md:gap-2">
                      <span className="opacity-80">🔐</span>
                      <span>Faça login para gerar imagens</span>
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>

        {/* Loading State */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-6 md:mt-10"
          >
            <GlassCard className="p-8 md:p-12 lg:p-16">
              <WatermelonLoader text="Gerando sua imagem em 4K… 🎨" />
            </GlassCard>
          </motion.div>
        )}

        {/* Error State */}
        {generationError && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 md:mt-10"
          >
            <GlassCard className="p-5 md:p-8 border border-destructive/20">
              <div className="flex items-start md:items-center gap-3 md:gap-4 text-destructive">
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-base md:text-lg">Erro na geração</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{generationError}</p>
                </div>
              </div>
              <WatermelonButton
                onClick={() => setGenerationError(null)}
                variant="outline"
                size="md"
                className="mt-3 md:mt-4"
              >
                Tentar novamente
              </WatermelonButton>
            </GlassCard>
          </motion.div>
        )}

        {/* Result */}
        {generatedImage && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 md:mt-10"
          >
            <div className="rgb-border p-[1px] md:p-[2px] rounded-2xl md:rounded-3xl">
              <GlassCard className="p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-watermelon-green to-watermelon-pink">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-gradient-watermelon">Sua imagem está pronta!</span>
                </h2>
                
                {/* Image Preview */}
                <motion.div 
                  className="relative rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 group"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={generatedImage}
                    alt="Imagem gerada"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4">
                  <WatermelonButton 
                    variant="primary" 
                    size="md"
                    className="w-full sm:w-auto text-sm md:text-base"
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
                    Baixar Imagem
                  </WatermelonButton>
                  <WatermelonButton 
                    variant="outline" 
                    size="md" 
                    onClick={handleGenerate}
                    className="w-full sm:w-auto text-sm md:text-base"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Gerar Variação</span>
                    <span className="sm:hidden">Variação</span>
                    <span className="text-xs opacity-80">{isUltimate ? '(∞)' : `(${creditCost})`}</span>
                  </WatermelonButton>
                  {isSaved && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 md:gap-2 text-watermelon-green w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">Salvo em Meus Renders</span>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
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
