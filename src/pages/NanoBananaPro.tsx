import { useState } from "react";
import { Sparkles, Download, RefreshCw, Save, Zap } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import AspectRatioSelect from "@/components/AspectRatioSelect";

const NanoBananaPro = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    // Simular geração de imagem
    setTimeout(() => {
      setIsGenerating(false);
      // Usando uma imagem de placeholder para demonstração
      setGeneratedImage("https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1024&h=1024&fit=crop");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-animated-gradient pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="text-gradient-watermelon">Nano Banana Pro 4K</span>
            <span className="ml-3">🍌✨</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Gere imagens em qualidade profissional com IA de última geração
          </p>
        </div>

        {/* Main Generation Card */}
        <GlassCard className="p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-6">
            {/* Prompt Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva a imagem que você quer gerar… seja detalhado"
                className="textarea-glass w-full"
                rows={4}
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="O que você NÃO quer na imagem (opcional)"
                className="textarea-glass w-full"
                rows={2}
              />
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aspect Ratio */}
              <AspectRatioSelect value={aspectRatio} onChange={setAspectRatio} />

              {/* Resolution Indicator */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Resolução
                </label>
                <div className="input-glass flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-gradient-watermelon">4K Ultra HD</span>
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
                className="w-full"
              >
                {isGenerating ? "Gerando..." : "Gerar Imagem 🍉"}
              </WatermelonButton>
            </div>
          </div>
        </GlassCard>

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-10 animate-fade-in">
            <GlassCard className="p-12">
              <WatermelonLoader text="Gerando sua imagem em 4K…" />
            </GlassCard>
          </div>
        )}

        {/* Result */}
        {generatedImage && !isGenerating && (
          <div className="mt-10 animate-scale-in">
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sua imagem está pronta!
              </h2>
              
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden mb-6">
                <img
                  src={generatedImage}
                  alt="Imagem gerada"
                  className="w-full h-auto"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <WatermelonButton variant="primary" size="md">
                  <Download className="w-4 h-4" />
                  Baixar Imagem
                </WatermelonButton>
                <WatermelonButton variant="outline" size="md" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4" />
                  Gerar Variação
                </WatermelonButton>
                <WatermelonButton variant="secondary" size="md">
                  <Save className="w-4 h-4" />
                  Salvar nos Meus Renders
                </WatermelonButton>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default NanoBananaPro;
