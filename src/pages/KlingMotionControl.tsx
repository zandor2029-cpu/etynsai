import { useState } from "react";
import { Download, Save, Video } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import WatermelonButton from "@/components/WatermelonButton";
import WatermelonLoader from "@/components/WatermelonLoader";
import FileUpload from "@/components/FileUpload";

const KlingMotionControl = () => {
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const canGenerate = characterImage && motionVideo;

  const handleGenerate = () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setGeneratedVideo(null);
    setProgress(0);

    // Simular progresso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // Video de demonstração
          setGeneratedVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-animated-gradient pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="text-gradient-watermelon">Kling Motion Control</span>
            <span className="ml-3">🎬</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transfira movimentos reais para seus personagens com IA
          </p>
        </div>

        {/* Main Input Card */}
        <GlassCard className="p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-6">
            {/* Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Character Image */}
              <FileUpload
                label="Imagem do Personagem"
                accept="image"
                onFileSelect={setCharacterImage}
              />

              {/* Motion Video */}
              <FileUpload
                label="Vídeo de Movimento"
                accept="video"
                onFileSelect={setMotionVideo}
              />
            </div>

            {/* Movement Instructions */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Instruções de Movimento (opcional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Movimento suave, cinematográfico, natural…"
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
                className="w-full"
              >
                {isGenerating ? "Processando..." : "Gerar Vídeo 🍉"}
              </WatermelonButton>
            </div>
          </div>
        </GlassCard>

        {/* Loading State with Progress */}
        {isGenerating && (
          <div className="mt-10 animate-fade-in">
            <GlassCard className="p-12">
              <div className="space-y-8">
                <WatermelonLoader text="Aplicando motion control…" />
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, hsl(142 70% 45%) 0%, hsl(350 80% 60%) 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Result */}
        {generatedVideo && !isGenerating && (
          <div className="mt-10 animate-scale-in">
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Seu vídeo está pronto!
              </h2>
              
              {/* Video Player */}
              <div className="relative rounded-xl overflow-hidden mb-6 bg-black">
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
        )}
      </div>
    </div>
  );
};

export default KlingMotionControl;
