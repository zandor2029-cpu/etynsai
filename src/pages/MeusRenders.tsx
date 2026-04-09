import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Image, Video, Filter, TrendingUp, Loader2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import RenderCard from "@/components/RenderCard";
import AuthModal from "@/components/AuthModal";
import { AnimatedSection, AnimatedBadge, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
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
    if (user) {
      loadRenders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadRenders = async () => {
    setIsLoading(true);
    const result = await fetchUserRenders();
    if (result.success && result.renders) {
      setRenders(result.renders);
    }
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
    const render = renders.find(r => r.id === id);
    if (render) {
      window.open(render.url, '_blank');
    }
  };

  const handleDownload = async (id: string) => {
    const render = renders.find(r => r.id === id);
    if (render) {
      try {
        const response = await fetch(render.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `render-${id}.${render.type === 'image' ? 'png' : 'mp4'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch {
        toast({
          title: 'Erro ao baixar',
          description: 'Não foi possível baixar o arquivo.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRender(id);
    if (result.success) {
      setRenders(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Render deletado',
        description: 'O render foi removido da sua galeria.',
      });
    } else {
      toast({
        title: 'Erro',
        description: result.error || 'Não foi possível deletar o render.',
        variant: 'destructive',
      });
    }
  };

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "Todos", icon: Filter },
    { value: "image", label: "Imagens", icon: Image },
    { value: "video", label: "Vídeos", icon: Video },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <GlassCard className="p-16 text-center">
              <motion.div 
                className="inline-flex p-4 rounded-2xl bg-muted/50 mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <FolderOpen className="w-16 h-16 text-muted-foreground" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-3 text-gradient-watermelon">
                Faça login para ver seus renders
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Entre na sua conta para acessar sua galeria de criações
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-watermelon px-6 py-3 rounded-xl font-bold"
              >
                Entrar
              </button>
            </GlassCard>
          </AnimatedSection>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedBadge delay={0}>
            <div className="inline-flex items-center gap-2 badge-rgb mb-4">
              <FolderOpen className="w-4 h-4" />
              <span>Galeria de Criações</span>
            </div>
          </AnimatedBadge>
          
          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="text-gradient-rgb">Meus Renders</span>
              <motion.span 
                className="ml-3 inline-block"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                📁
              </motion.span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Histórico de todas as suas <span className="text-etyns-blue-light font-semibold">criações</span> com 
              <span className="text-etyns-purple font-semibold"> inteligência artificial</span>
            </p>
          </AnimatedSection>
        </div>

        {/* Filter Buttons */}
        <AnimatedSection delay={0.3}>
          <div className="flex justify-center mb-10">
            <GlassCard className="inline-flex p-2 gap-2">
              {filterButtons.map((btn) => (
                <motion.button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                </motion.button>
              ))}
            </GlassCard>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" staggerDelay={0.08} delay={0.35}>
          <StaggerItem>
            <GlassCard className="p-5 text-center group hover:glow-rgb transition-all duration-500">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-etyns-blue/20 to-etyns-purple/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-etyns-blue" />
                </div>
                <p className="text-3xl font-display font-bold text-gradient-watermelon">
                  {renders.length}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Total de Renders</p>
            </GlassCard>
          </StaggerItem>
          
          <StaggerItem>
            <GlassCard className="p-5 text-center group hover:glow-blue transition-all duration-500">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-etyns-blue/20 group-hover:scale-110 transition-transform">
                  <Image className="w-5 h-5 text-etyns-blue-light" />
                </div>
                <p className="text-3xl font-display font-bold text-etyns-blue-light">
                  {renders.filter((r) => r.type === "image").length}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Imagens</p>
            </GlassCard>
          </StaggerItem>
          
          <StaggerItem>
            <GlassCard className="p-5 text-center group hover:glow-purple transition-all duration-500">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-etyns-purple/20 group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5 text-etyns-purple" />
                </div>
                <p className="text-3xl font-display font-bold text-etyns-purple">
                  {renders.filter((r) => r.type === "video").length}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Vídeos</p>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Renders Grid */}
        {!isLoading && filteredRenders.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06} delay={0.5}>
            {filteredRenders.map((render) => (
              <StaggerItem key={render.id}>
                <RenderCard
                  id={render.id}
                  type={render.type}
                  thumbnail={render.type === 'video' ? render.url : render.url}
                  createdAt={formatDate(render.created_at)}
                  prompt={render.prompt || undefined}
                  onOpen={handleOpen}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Empty State */}
        {!isLoading && filteredRenders.length === 0 && (
          <AnimatedSection>
            <GlassCard className="p-16 text-center">
              <motion.div 
                className="inline-flex p-4 rounded-2xl bg-muted/50 mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <FolderOpen className="w-16 h-16 text-muted-foreground" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-3 text-gradient-watermelon">
                Nenhum render encontrado
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {filter === "all"
                  ? "Comece a criar suas imagens e vídeos com IA!"
                  : `Você ainda não criou nenhum ${filter === "image" ? "imagem" : "vídeo"}.`}
              </p>
            </GlassCard>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default MeusRenders;
