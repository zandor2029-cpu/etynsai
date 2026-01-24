import { useState } from "react";
import { FolderOpen, Image, Video, Filter, Sparkles, TrendingUp } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import RenderCard from "@/components/RenderCard";

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
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-rgb mb-4">
            <FolderOpen className="w-4 h-4" />
            <span>Galeria de Criações</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span className="text-gradient-rgb">Meus Renders</span>
            <span className="ml-3 inline-block animate-float">📁</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Histórico de todas as suas <span className="text-watermelon-green-light font-semibold">criações</span> com 
            <span className="text-watermelon-pink font-semibold"> inteligência artificial</span>
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="inline-flex p-2 gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`
                  flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold transition-all duration-300
                  ${filter === btn.value
                    ? "btn-watermelon"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <GlassCard className="p-5 text-center group hover:glow-rgb transition-all duration-500">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-watermelon-green/20 to-watermelon-pink/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-watermelon-green" />
              </div>
              <p className="text-3xl font-display font-bold text-gradient-watermelon">
                {mockRenders.length}
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total de Renders</p>
          </GlassCard>
          
          <GlassCard className="p-5 text-center group hover:glow-green transition-all duration-500">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-watermelon-green/20 group-hover:scale-110 transition-transform">
                <Image className="w-5 h-5 text-watermelon-green-light" />
              </div>
              <p className="text-3xl font-display font-bold text-watermelon-green-light">
                {mockRenders.filter((r) => r.type === "image").length}
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Imagens 4K</p>
          </GlassCard>
          
          <GlassCard className="p-5 text-center group hover:glow-pink transition-all duration-500">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-watermelon-pink/20 group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 text-watermelon-pink" />
              </div>
              <p className="text-3xl font-display font-bold text-watermelon-pink">
                {mockRenders.filter((r) => r.type === "video").length}
              </p>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Vídeos Motion</p>
          </GlassCard>
        </div>

        {/* Renders Grid */}
        {filteredRenders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRenders.map((render, index) => (
              <div
                key={render.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.08}s` }}
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
          <GlassCard className="p-16 text-center animate-fade-in">
            <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-6">
              <FolderOpen className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-gradient-watermelon">
              Nenhum render encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filter === "all"
                ? "Comece a criar suas imagens e vídeos com IA! 🍉"
                : `Você ainda não criou nenhum ${filter === "image" ? "imagem" : "vídeo"}.`}
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default MeusRenders;
