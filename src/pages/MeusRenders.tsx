import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Image, Video, Filter, TrendingUp, Loader2 } from "lucide-react";
import RenderCard from "@/components/RenderCard";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserRenders, deleteRender, type Render } from "@/hooks/useRenders";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type FilterType = "all" | "image" | "video";

const MeusRenders = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [renders, setRenders] = useState<Render[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadRenders();
    else setIsLoading(false);
  }, [user]);

  const loadRenders = async () => {
    setIsLoading(true);
    const result = await fetchUserRenders();
    if (result.success && result.renders) setRenders(result.renders);
    setIsLoading(false);
  };

  const filteredRenders = renders.filter((render) => {
    if (filter === "all") return true;
    return render.type === filter;
  });

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleOpen = (id: string) => {
    const render = renders.find((r) => r.id === id);
    if (render) window.open(render.url, "_blank");
  };

  const handleDownload = async (id: string) => {
    const render = renders.find((r) => r.id === id);
    if (render) {
      try {
        const response = await fetch(render.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `render-${id}.${render.type === "image" ? "png" : "mp4"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch {
        toast({
          title: "Erro ao baixar",
          description: "Não foi possível baixar o arquivo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRender(id);
    if (result.success) {
      setRenders((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Render deletado", description: "O render foi removido da sua galeria." });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Não foi possível deletar o render.",
        variant: "destructive",
      });
    }
  };

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "Todos", icon: Filter },
    { value: "image", label: "Imagens", icon: Image },
    { value: "video", label: "Vídeos", icon: Video },
  ];

  // Ambient glow shared
  const Glow = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[160px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/8 blur-[160px]" />
    </div>
  );

  if (!user) {
    return (
      <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
        <Glow />
        <div className="relative z-10 px-4 md:px-6 lg:px-8 py-6 md:py-10">
          <div className="container mx-auto max-w-3xl">
            <div className="p-10 text-center rounded-xl border border-border/60 bg-card/95 shadow-lg shadow-primary/5">
              <motion.div
                className="inline-flex p-3 rounded-2xl bg-muted/40 mb-4"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
              >
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-lg font-display font-bold mb-2 text-gradient-watermelon">
                Faça login para ver seus renders
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Entre na sua conta para acessar sua galeria de criações.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
      <Glow />
      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 border border-border/60 mb-4"
            >
              <FolderOpen className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Galeria de Criações
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl md:text-4xl font-display font-extrabold mb-2 text-gradient-watermelon tracking-tight"
            >
              Meus Renders
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-muted-foreground max-w-md mx-auto"
            >
              Histórico de todas as suas criações com inteligência artificial.
            </motion.p>
          </div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex p-1 gap-1 rounded-xl border border-border/60 bg-card/95">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filter === btn.value
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <btn.icon className="w-3 h-3" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="grid grid-cols-3 gap-2 md:gap-3 mb-6"
          >
            {[
              { icon: TrendingUp, value: renders.length, label: "Total", color: "text-primary", bg: "bg-primary/15" },
              {
                icon: Image,
                value: renders.filter((r) => r.type === "image").length,
                label: "Imagens",
                color: "text-etyns-blue-light",
                bg: "bg-etyns-blue/15",
              },
              {
                icon: Video,
                value: renders.filter((r) => r.type === "video").length,
                label: "Vídeos",
                color: "text-etyns-purple",
                bg: "bg-etyns-purple/15",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl border border-border/60 bg-card/95 shadow-sm flex items-center gap-2.5"
              >
                <div className={`p-1.5 rounded-lg ${stat.bg} shrink-0`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-base md:text-lg font-display font-extrabold ${stat.color} leading-tight`}>
                    {stat.value}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground font-medium uppercase tracking-wider leading-tight">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Renders Grid */}
          {!isLoading && filteredRenders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            >
              {filteredRenders.map((render) => (
                <RenderCard
                  key={render.id}
                  id={render.id}
                  type={render.type}
                  thumbnail={render.url}
                  createdAt={formatDate(render.created_at)}
                  prompt={render.prompt || undefined}
                  onOpen={handleOpen}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && filteredRenders.length === 0 && (
            <div className="p-10 text-center rounded-xl border border-border/60 bg-card/95 shadow-lg shadow-primary/5">
              <motion.div
                className="inline-flex p-3 rounded-2xl bg-muted/40 mb-4"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
              >
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-lg font-display font-bold mb-2 text-gradient-watermelon">
                Nenhum render encontrado
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {filter === "all"
                  ? "Comece a criar suas imagens e vídeos com IA!"
                  : `Você ainda não criou nenhum ${filter === "image" ? "imagem" : "vídeo"}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeusRenders;
