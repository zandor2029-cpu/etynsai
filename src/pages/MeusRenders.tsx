import { useState } from "react";
import { FolderOpen, Image, Video, Filter } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import RenderCard from "@/components/RenderCard";

// Mock data para demonstração
const mockRenders = [
  {
    id: "1",
    type: "image" as const,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
    createdAt: "Hoje, 14:32",
  },
  {
    id: "2",
    type: "video" as const,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    createdAt: "Hoje, 12:15",
  },
  {
    id: "3",
    type: "image" as const,
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    createdAt: "Ontem, 18:45",
  },
  {
    id: "4",
    type: "image" as const,
    thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=400&h=400&fit=crop",
    createdAt: "Ontem, 16:20",
  },
  {
    id: "5",
    type: "video" as const,
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    createdAt: "22 Jan, 10:00",
  },
  {
    id: "6",
    type: "image" as const,
    thumbnail: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop",
    createdAt: "21 Jan, 09:30",
  },
];

type FilterType = "all" | "image" | "video";

const MeusRenders = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredRenders = mockRenders.filter((render) => {
    if (filter === "all") return true;
    return render.type === filter;
  });

  const handleOpen = (id: string) => {
    console.log("Abrir render:", id);
  };

  const handleDownload = (id: string) => {
    console.log("Baixar render:", id);
  };

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "Todos", icon: Filter },
    { value: "image", label: "Imagens", icon: Image },
    { value: "video", label: "Vídeos", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-animated-gradient pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="text-gradient-watermelon">Meus Renders</span>
            <span className="ml-3">📁</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórico de todas as suas criações com IA
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="inline-flex p-2 gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${filter === btn.value
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <btn.icon className="w-4 h-4" />
                <span>{btn.label}</span>
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <GlassCard className="p-4 text-center">
            <p className="text-3xl font-display font-bold text-gradient-watermelon">
              {mockRenders.length}
            </p>
            <p className="text-sm text-muted-foreground">Total de Renders</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-3xl font-display font-bold text-primary">
              {mockRenders.filter((r) => r.type === "image").length}
            </p>
            <p className="text-sm text-muted-foreground">Imagens 4K</p>
          </GlassCard>
          <GlassCard className="p-4 text-center col-span-2 md:col-span-1">
            <p className="text-3xl font-display font-bold text-secondary">
              {mockRenders.filter((r) => r.type === "video").length}
            </p>
            <p className="text-sm text-muted-foreground">Vídeos Motion</p>
          </GlassCard>
        </div>

        {/* Renders Grid */}
        {filteredRenders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRenders.map((render, index) => (
              <div
                key={render.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <RenderCard
                  {...render}
                  onOpen={handleOpen}
                  onDownload={handleDownload}
                />
              </div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center animate-fade-in">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">
              Nenhum render encontrado
            </h3>
            <p className="text-muted-foreground">
              {filter === "all"
                ? "Comece a criar suas imagens e vídeos com IA!"
                : `Você ainda não criou nenhum ${filter === "image" ? "imagem" : "vídeo"}.`}
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default MeusRenders;
