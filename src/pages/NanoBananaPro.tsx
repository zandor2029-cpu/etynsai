import { useState } from "react";
import { Sparkles, Download, RefreshCw, Save, Zap, Wand2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import AspectRatioSelect from "@/components/AspectRatioSelect";
import WatermelonIcon from "@/components/WatermelonIcon";
import NoCreditsModal from "@/components/NoCreditsModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditsForGeneration, getCreditCost, canAfford } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";

const NanoBananaPro = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const creditCost = getCreditCost('image');
  const currentCredits = profile?.credits ?? 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if user has enough credits
    if (!canAfford(currentCredits, 'image')) {
      setShowNoCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    // Use credits
    const result = await useCreditsForGeneration('image', `Geração: ${prompt.substring(0, 50)}...`);
    
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
    
    // Simular geração de imagem
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage("https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1024&h=1024&fit=crop");
      toast({
        title: 'Imagem gerada! 🍉',
        description: `Foram utilizados ${creditCost} créditos. Saldo: ${result.newBalance}`,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-rgb mb-4">
            <Wand2 className="w-4 h-4" />
            <span>Geração em 4K Ultra HD</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 flex items-center justify-center gap-4">
            <span className="text-gradient-rgb">Nano Banana Pro 4K</span>
            <WatermelonIcon size={64} className="hidden md:inline-block" />
            <WatermelonIcon size={48} className="inline-block md:hidden" />
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gere imagens em <span className="text-watermelon-green-light font-semibold">qualidade profissional</span> com 
            IA de <span className="text-watermelon-pink font-semibold">última geração</span>
          </p>
          
          {/* Credit cost indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full">
            <Zap className="w-4 h-4 text-watermelon-green" />
            <span className="text-muted-foreground">Custo:</span>
            <span className="font-bold text-watermelon-green">{creditCost} créditos</span>
            <span className="text-muted-foreground">por imagem</span>
          </div>
        </div>

        {/* Main Generation Card */}
        <div className="rgb-border p-[2px] rounded-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="p-6 md:p-8 rounded-3xl">
            <div className="space-y-6">
              {/* Prompt Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-watermelon-green" />
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva a imagem que você quer gerar… seja detalhado e criativo! 🎨"
                  className="textarea-glass w-full"
                  rows={4}
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Negative Prompt <span className="text-xs font-normal">(opcional)</span>
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="O que você NÃO quer na imagem..."
                  className="textarea-glass w-full"
                  rows={2}
                />
              </div>

              {/* Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aspect Ratio */}
                <AspectRatioSelect value={aspectRatio} onChange={setAspectRatio} />

                {/* Resolution Indicator */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Resolução
                  </label>
                  <div className="input-glass flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-watermelon-green/20 to-watermelon-pink/20">
                      <Zap className="w-5 h-5 text-watermelon-green-neon" />
                    </div>
                    <div>
                      <span className="font-bold text-gradient-watermelon">4K Ultra HD</span>
                      <p className="text-xs text-muted-foreground">3840 × 2160 pixels</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <WatermelonButton
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={!prompt.trim() || isGenerating}
                  size="lg"
                  className="w-full text-lg"
                >
                  {isGenerating ? "Gerando sua obra-prima..." : `Gerar Imagem 🍉 (${creditCost} créditos)`}
                </WatermelonButton>
                
                {!user && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    🔐 Faça login para gerar imagens
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-10 animate-fade-in">
            <GlassCard className="p-12 md:p-16">
              <WatermelonLoader text="Gerando sua imagem em 4K… 🎨" />
            </GlassCard>
          </div>
        )}

        {/* Result */}
        {generatedImage && !isGenerating && (
          <div className="mt-10 animate-scale-in">
            <div className="rgb-border p-[2px] rounded-3xl">
              <GlassCard className="p-6 md:p-8 rounded-3xl">
                <h2 className="text-xl md:text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-watermelon-green to-watermelon-pink">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gradient-watermelon">Sua imagem está pronta!</span>
                </h2>
                
                {/* Image Preview */}
                <div className="relative rounded-2xl overflow-hidden mb-6 group">
                  <img
                    src={generatedImage}
                    alt="Imagem gerada"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <WatermelonButton variant="primary" size="md">
                    <Download className="w-4 h-4" />
                    Baixar Imagem
                  </WatermelonButton>
                  <WatermelonButton variant="outline" size="md" onClick={handleGenerate}>
                    <RefreshCw className="w-4 h-4" />
                    Gerar Variação ({creditCost} créditos)
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
