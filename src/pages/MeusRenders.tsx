import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Image as ImageIcon, Video, Filter, TrendingUp, Loader2, User } from "lucide-react";
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

  const { user, profile, subscription } = useAuth();
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

  const filteredRenders = renders.filter((r) => filter === "all" ? true : r.type === filter);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
    } catch { return dateString; }
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
        toast({ title: "Erro ao baixar", description: "Não foi possível baixar o arquivo.", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRender(id);
    if (result.success) {
      setRenders((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Render deletado", description: "O render foi removido da sua galeria." });
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível deletar o render.", variant: "destructive" });
    }
  };

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "Todos", icon: Filter },
    { value: "image", label: "Imagens", icon: ImageIcon },
    { value: "video", label: "Vídeos", icon: Video },
  ];

  // Ambient glow shared
  const Glow = () => (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[800px] h-[600px] rounded-full bg-blue-600/10 blur-[180px]" />
      <div className="absolute bottom-0 right-1/3 w-[700px] h-[500px] rounded-full bg-purple-600/8 blur-[180px]" />
    </div>
  );

  if (!user) {
    return (
      <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-[#0a0a0a] text-white overflow-hidden">
        <Glow />
        <div className="relative z-10 px-4 md:px-6 py-12 md:py-20">
          <div className="container mx-auto max-w-3xl">
            <div className="p-10 text-center rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <motion.div
                className="inline-flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center mb-5"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <FolderOpen className="w-8 h-8 text-white/60" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-display font-extrabold uppercase tracking-tight text-white mb-3">
                Faça login para ver suas criações
              </h3>
              <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
                Entre na sua conta para acessar sua galeria pessoal.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-all hover:scale-[1.03]"
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

  // Avatar inicial baseado no email
  const initial = (user.email || "U").charAt(0).toUpperCase();
  const totalImages = renders.filter((r) => r.type === "image").length;
  const totalVideos = renders.filter((r) => r.type === "video").length;

  return (
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-[#0a0a0a] text-white overflow-hidden">
      <Glow />
      <div className="relative z-10 px-4 md:px-6 py-8 md:py-10">
        <div className="container mx-auto max-w-7xl">

          {/* PROFILE HEADER (Higgsfield-style banner) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 mb-8"
          >
            {/* Banner gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-700 to-cyan-700" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-cyan-700 via-blue-700 to-purple-700"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.4) 0%, transparent 50%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent" />

            <div className="relative px-5 md:px-10 py-8 md:py-10">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 md:gap-8">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-4xl md:text-5xl font-display font-extrabold text-white shadow-2xl">
                    {initial}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.3em] text-white/70 mb-2">
                    Perfil
                  </p>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tight text-white leading-none mb-2 truncate">
                    {user.email?.split("@")[0] || "Criador"}
                  </h1>
                  <p className="text-sm text-white/70 truncate">{user.email}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                    {profile && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold">Créditos</span>
                        <span className="text-sm font-extrabold text-white">{profile.credits}</span>
                      </div>
                    )}
                    {subscription?.plan && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/30 backdrop-blur-sm border border-orange-400/40">
                        <span className="text-[10px] font-extrabold text-orange-200 uppercase tracking-wider">{subscription.plan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STATS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-3 gap-3 md:gap-4 mb-8"
          >
            {[
              { icon: TrendingUp, value: renders.length, label: "Total", color: "text-blue-400" },
              { icon: ImageIcon, value: totalImages, label: "Imagens", color: "text-cyan-400" },
              { icon: Video, value: totalVideos, label: "Vídeos", color: "text-purple-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 md:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-display font-extrabold text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* SECTION TITLE + FILTERS */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.2em] text-white/50 mb-2">
                Galeria
              </p>
              <h2 className="text-2xl md:text-4xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
                Minhas criações
              </h2>
            </div>

            {/* Filter chips */}
            <div className="inline-flex p-1 gap-1 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm self-start md:self-auto">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                    filter === btn.value
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <btn.icon className="w-3 h-3" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-white/60" />
            </div>
          )}

          {/* Renders Grid */}
          {!isLoading && filteredRenders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
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

          {/* Empty */}
          {!isLoading && filteredRenders.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <motion.div
                className="inline-flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center mb-5"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <FolderOpen className="w-8 h-8 text-white/60" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-display font-extrabold uppercase tracking-tight text-white mb-3">
                Nenhum render encontrado
              </h3>
              <p className="text-sm text-white/60 max-w-md mx-auto">
                {filter === "all"
                  ? "Comece a criar suas imagens e vídeos com IA."
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

