import { useState } from "react";
import { Download, Save, Video, Clapperboard, Play, Zap } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import FileUpload from "@/components/FileUpload";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsForGeneration, getCreditCost, canAfford } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";

const KlingMotionControl = () => {
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const creditCost = getCreditCost('video');
  const currentCredits = profile?.credits ?? 0;
  const canGenerate = characterImage && motionVideo;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
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
    setProgress(0);

    // Use credits
    const result = await useCreditsForGeneration('video', 'Geração de vídeo motion control');
    
    if (!result.success) {
      setIsGenerating(false);
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
      return;
    }
    
    // Refresh profile to update credits display
    await refreshProfile();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
          toast({
            title: 'Vídeo gerado! 🎬',
            description: `Foram utilizados ${creditCost} créditos. Saldo: ${result.newBalance}`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-rgb mb-4">
            <Play className="w-4 h-4" />
            <span>Motion Transfer AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span className="text-gradient-rgb">Kling Motion Control</span>
            <span className="ml-3 inline-block animate-float">🎬</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transfira <span className="text-watermelon-pink font-semibold">movimentos reais</span> para 
            seus personagens com <span className="text-watermelon-green-light font-semibold">IA avançada</span>
          </p>
          
          {/* Credit cost indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full">
            <Zap className="w-4 h-4 text-watermelon-pink" />
            <span className="text-muted-foreground">Custo:</span>
            <span className="font-bold text-watermelon-pink">{creditCost} créditos</span>
            <span className="text-muted-foreground">por vídeo</span>
          </div>
        </div>

        {/* Main Input Card */}
        <div className="rgb-border p-[2px] rounded-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="p-6 md:p-8 rounded-3xl">
            <div className="space-y-6">
              {/* Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Imagem do Personagem"
                  accept="image"
                  onFileSelect={setCharacterImage}
                />
                <FileUpload
                  label="Vídeo de Movimento"
                  accept="video"
                  onFileSelect={setMotionVideo}
                />
              </div>

              {/* Movement Instructions */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Clapperboard className="w-4 h-4" />
                  Instruções de Movimento <span className="text-xs font-normal">(opcional)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Movimento suave, cinematográfico, natural, expressivo…"
                  className="textarea-glass w-full"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <WatermelonButton
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={!canGenerate || isGenerating}
                  size="lg"
                  className="w-full text-lg"
                >
                  {isGenerating ? "Processando Motion Control..." : `Gerar Vídeo 🍉 (${creditCost} créditos)`}
                </WatermelonButton>
                
                {!canGenerate && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    📎 Faça upload de uma imagem e um vídeo para começar
                  </p>
                )}
                
                {!user && canGenerate && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    🔐 Faça login para gerar vídeos
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Loading State with Progress */}
        {isGenerating && (
          <div className="mt-10 animate-fade-in">
            <GlassCard className="p-12 md:p-16">
              <div className="space-y-10">
                <WatermelonLoader text="Aplicando motion control… 🎥" />
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm font-semibold mb-3">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="text-gradient-watermelon">{progress}%</span>
                  </div>
                  <div className="progress-watermelon">
                    <div
                      className="progress-watermelon-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {progress < 30 && "Analisando movimentos..."}
                    {progress >= 30 && progress < 60 && "Aplicando ao personagem..."}
                    {progress >= 60 && progress < 90 && "Renderizando frames..."}
                    {progress >= 90 && "Finalizando vídeo..."}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Result */}
        {generatedVideo && !isGenerating && (
          <div className="mt-10 animate-scale-in">
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
                <div className="flex flex-wrap gap-4">
                  <WatermelonButton variant="primary" size="md">
                    <Download className="w-4 h-4" />
                    Baixar Vídeo
                  </WatermelonButton>
                  <WatermelonButton variant="secondary" size="md">
                    <Save className="w-4 h-4" />
                    Salvar nos Meus Renders
                  </WatermelonButton>
                </div>
              </GlassCard>
            </div>
          </div>
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
