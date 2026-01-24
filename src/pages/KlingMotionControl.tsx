import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Video, Clapperboard, Play, Zap, AlertCircle, Check } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import FileUpload from "@/components/FileUpload";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import { AnimatedSection, AnimatedBadge } from "@/components/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsForGeneration, getCreditCost, canAfford } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { uploadFileForGeneration } from "@/hooks/useFileUpload";
import { generateVideo } from "@/hooks/useGeneration";
import { saveRender } from "@/hooks/useRenders";

const KlingMotionControl = () => {
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const creditCost = getCreditCost('video');
  const currentCredits = profile?.credits ?? 0;
  const canGenerateVideo = characterImage !== null;

  const handleGenerate = async () => {
    if (!canGenerateVideo || !characterImage) return;
    
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if user has enough credits
    if (!canAfford(currentCredits, 'video')) {
      setShowNoCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    setGeneratedVideo(null);
    setGenerationError(null);
    setProgress(0);
    setProgressText("Preparando arquivos...");
    setIsSaved(false);
    setCurrentPrompt(instructions.trim());

    try {
      // Upload character image
      setProgress(10);
      setProgressText("Fazendo upload da imagem...");
      const imageUpload = await uploadFileForGeneration(characterImage, user.id);
      if (!imageUpload.success || !imageUpload.url) {
        throw new Error(imageUpload.error || 'Falha ao fazer upload da imagem');
      }

      // Use credits
      setProgress(25);
      setProgressText("Processando créditos...");
      const creditResult = await useCreditsForGeneration('video', 'Geração de vídeo com IA');
      
      if (!creditResult.success) {
        throw new Error(creditResult.message);
      }
      
      // Refresh profile to update credits display
      await refreshProfile();

      // Call generation API
      setProgress(35);
      setProgressText("Iniciando geração com IA...");
      
      // Start progress simulation
      let currentProgress = 35;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 3, 90);
        setProgress(currentProgress);
        if (currentProgress < 50) {
          setProgressText("Analisando imagem...");
        } else if (currentProgress < 65) {
          setProgressText("Gerando movimentos...");
        } else if (currentProgress < 80) {
          setProgressText("Renderizando frames...");
        } else {
          setProgressText("Finalizando vídeo...");
        }
      }, 4000);

      const result = await generateVideo({
        characterImageUrl: imageUpload.url,
        prompt: instructions.trim() || undefined,
        duration: 5,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsGenerating(false);

      if (result.success && result.videoUrl) {
        setGeneratedVideo(result.videoUrl);
        
        // Auto-save to renders
        const saveResult = await saveRender({
          type: 'video',
          url: result.videoUrl,
          prompt: currentPrompt || 'Vídeo gerado com IA',
          model: 'wan-2.2-i2v-fast',
        });
        
        if (saveResult.success) {
          setIsSaved(true);
        }
        
        toast({
          title: 'Vídeo gerado e salvo! 🎬',
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
      toast({
        title: 'Erro na geração',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedBadge delay={0}>
            <div className="inline-flex items-center gap-2 badge-rgb mb-4">
              <Play className="w-4 h-4" />
              <span>Imagem para Vídeo com IA</span>
            </div>
          </AnimatedBadge>
          
          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="text-gradient-rgb">Gerador de Vídeo</span>
              <motion.span 
                className="ml-3 inline-block"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🎬
              </motion.span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme <span className="text-watermelon-pink font-semibold">imagens estáticas</span> em 
              vídeos com <span className="text-watermelon-green-light font-semibold">movimentos realistas</span>
            </p>
          </AnimatedSection>
          
          {/* Credit cost indicator */}
          <AnimatedSection delay={0.3}>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <Zap className="w-4 h-4 text-watermelon-pink" />
              <span className="text-muted-foreground">Custo:</span>
              <span className="font-bold text-watermelon-pink">{creditCost} créditos</span>
              <span className="text-muted-foreground">por vídeo</span>
            </div>
          </AnimatedSection>
        </div>

        {/* Main Input Card */}
        <AnimatedSection delay={0.35}>
          <div className="rgb-border p-[2px] rounded-3xl">
            <GlassCard className="p-6 md:p-8 rounded-3xl">
              <div className="space-y-6">
                {/* Image Upload */}
                <FileUpload
                  label="Imagem para Animar"
                  accept="image"
                  onFileSelect={setCharacterImage}
                />

                {/* Movement Instructions */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clapperboard className="w-4 h-4" />
                    Descrição do Movimento <span className="text-xs font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Descreva o movimento desejado: andar para frente, acenar, dançar, expressão feliz…"
                    className="textarea-glass w-full"
                    rows={3}
                  />
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <WatermelonButton
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!canGenerateVideo || isGenerating}
                    size="lg"
                    className="w-full text-lg"
                  >
                    {isGenerating ? "Gerando vídeo com IA..." : `Gerar Vídeo 🍉 (${creditCost} créditos)`}
                  </WatermelonButton>
                  
                  {!canGenerateVideo && (
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      📎 Faça upload de uma imagem para começar
                    </p>
                  )}
                  
                  {!user && canGenerateVideo && (
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      🔐 Faça login para gerar vídeos
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>

        {/* Loading State with Progress */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10"
          >
            <GlassCard className="p-12 md:p-16">
              <div className="space-y-10">
                <WatermelonLoader text="Gerando seu vídeo… 🎥" />
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm font-semibold mb-3">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="text-gradient-watermelon">{progress}%</span>
                  </div>
                  <div className="progress-watermelon">
                    <motion.div
                      className="progress-watermelon-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {progressText}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Error State */}
        {generationError && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            <GlassCard className="p-8 border border-destructive/20">
              <div className="flex items-center gap-4 text-destructive">
                <AlertCircle className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Erro na geração</h3>
                  <p className="text-muted-foreground">{generationError}</p>
                </div>
              </div>
              <WatermelonButton
                onClick={() => setGenerationError(null)}
                variant="outline"
                size="md"
                className="mt-4"
              >
                Tentar novamente
              </WatermelonButton>
            </GlassCard>
          </motion.div>
        )}

        {/* Result */}
        {generatedVideo && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10"
          >
            <div className="rgb-border p-[2px] rounded-3xl">
              <GlassCard className="p-6 md:p-8 rounded-3xl">
                <h2 className="text-xl md:text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-watermelon-pink to-watermelon-red">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gradient-watermelon">Seu vídeo está pronto!</span>
                </h2>
                
                {/* Video Player */}
                <div className="relative rounded-2xl overflow-hidden mb-6 bg-watermelon-seed">
                  <video
                    src={generatedVideo}
                    className="w-full h-auto max-h-[500px]"
                    controls
                    autoPlay
                    loop
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 items-center">
                  <WatermelonButton variant="primary" size="md">
                    <Download className="w-4 h-4" />
                    Baixar Vídeo
                  </WatermelonButton>
                  {isSaved && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-watermelon-green"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Salvo em Meus Renders</span>
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
