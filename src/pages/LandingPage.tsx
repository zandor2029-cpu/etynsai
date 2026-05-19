import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  ArrowRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Wand2,
  Cpu,
  Crown,
} from "lucide-react";
import { useState } from "react";
import GoogleGIcon from "@/components/GoogleGIcon";

/* ============================================================
   ETYNS LANDING — Higgsfield-inspired layout
   - Left vertical section nav (desktop only)
   - Hero = product cards grid (no big title)
   - PRESETS section with thumbnail grid
   - Studio CTA banner
   - Showcase grid + footer CTA
============================================================ */

const sectionLabels = [
  { id: "presets", label: "ETYNS PRESETS" },
  { id: "tools", label: "STUDIO" },
  { id: "showcase", label: "GALERIA" },
  { id: "pricing", label: "PLANOS" },
];

type ProductCard = {
  title: string;
  subtitle: string;
  badge?: { label: string; color: string } | null;
  category?: string;
  link: string;
  gradient: string;
  icon?: any;
  large?: boolean;
};

const productCards: ProductCard[] = [
  {
    title: "Etyns Studio",
    subtitle: "Crie imagens 4K e vídeos cinematográficos em segundos",
    badge: { label: "NOVO", color: "#3b82f6" },
    link: "/image",
    gradient: "from-blue-600/40 via-cyan-500/20 to-purple-600/30",
    icon: Sparkles,
    large: true,
  },
  {
    title: "Nano Banana 2",
    subtitle: "Geração de imagens em ultra resolução",
    category: "IMAGEM",
    link: "/image",
    gradient: "from-blue-500/30 via-cyan-400/20 to-blue-700/40",
    icon: GoogleGIcon,
  },
  {
    title: "Control Motion",
    subtitle: "Anime imagens em vídeos cinematográficos",
    category: "VÍDEO",
    link: "/motion-control",
    gradient: "from-purple-600/40 via-blue-500/20 to-cyan-500/30",
    icon: Video,
  },
  {
    title: "Assistente de Prompts",
    subtitle: "IA que escreve prompts perfeitos por você",
    badge: { label: "EM ALTA", color: "#f97316" },
    link: "/image",
    gradient: "from-orange-500/30 via-pink-500/20 to-purple-600/30",
    icon: Wand2,
  },
  {
    title: "Upscale 4K",
    subtitle: "Aumente a resolução das suas criações",
    badge: { label: "NOVO", color: "#3b82f6" },
    link: "/image",
    gradient: "from-cyan-500/40 via-blue-500/20 to-indigo-600/30",
    icon: Cpu,
  },
  {
    title: "Meus Renders",
    subtitle: "Galeria pessoal de todas as suas criações",
    link: "/meus-renders",
    gradient: "from-emerald-500/30 via-cyan-500/20 to-blue-600/30",
    icon: ImageIcon,
  },
  {
    title: "Planos Pro",
    subtitle: "Desbloqueie créditos ilimitados",
    link: "/planos",
    gradient: "from-yellow-500/30 via-orange-500/20 to-red-600/30",
    icon: Crown,
  },
];

const presets = [
  "CINEMA NOIR", "PAPARAZZI 2000", "NEON CITY", "DRAGON FANTASY",
  "RED CARPET", "OFFICE CCTV", "NIGHT VISION", "FAN MEETING",
  "RACE WINNER", "SUMMER HAZE", "ENDING FAIRY", "EXIT THE DREAM",
  "IN THE DARK", "SOUL FIGHTER", "TUSCAN YOGA", "APEX HUNTER",
  "DROWN IN MUSIC", "RED THREAD", "BASEBALL GAME", "NIGHTLINE",
];

const presetCategories = [
  "TODOS", "CINEMÁTICO", "RETRATO", "PRODUTO", "FANTASIA", "AÇÃO", "RETRÔ", "NOTURNO",
];

const presetGradients = [
  "from-slate-800 via-slate-900 to-black",
  "from-amber-900/40 via-orange-800/30 to-black",
  "from-purple-900/50 via-pink-800/30 to-black",
  "from-red-900/40 via-orange-900/30 to-black",
  "from-pink-900/40 via-rose-800/30 to-black",
  "from-cyan-900/40 via-blue-900/30 to-black",
  "from-emerald-900/40 via-green-900/30 to-black",
  "from-indigo-900/40 via-blue-800/30 to-black",
  "from-yellow-900/40 via-amber-800/30 to-black",
  "from-orange-900/40 via-red-900/30 to-black",
  "from-violet-900/50 via-purple-800/30 to-black",
  "from-rose-900/40 via-pink-900/30 to-black",
  "from-blue-950 via-slate-900 to-black",
  "from-fuchsia-900/40 via-purple-900/30 to-black",
  "from-teal-900/40 via-cyan-900/30 to-black",
  "from-stone-800 via-zinc-900 to-black",
  "from-blue-900/50 via-indigo-800/30 to-black",
  "from-red-950 via-rose-900/40 to-black",
  "from-green-900/40 via-emerald-900/30 to-black",
  "from-slate-900 via-blue-950 to-black",
];

const showcaseShots = Array.from({ length: 8 }).map((_, i) => ({
  title: `SHOT ${i + 1}`,
  gradient: presetGradients[i % presetGradients.length],
  tag: i % 2 === 0 ? "VÍDEO" : "IMAGEM",
}));

const LandingPage = () => {
  const [activeCategory, setActiveCategory] = useState("TODOS");

  return (
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-[#0a0a0a] text-foreground overflow-hidden">
      {/* ============ LEFT VERTICAL SIDEBAR (desktop) ============ */}
      <aside className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 flex-col gap-2 px-3">
        {sectionLabels.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group relative px-2 py-3 rounded-md hover:bg-white/5 transition-colors"
            style={{ writingMode: "vertical-rl" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
              {s.label}
            </span>
          </a>
        ))}
      </aside>

      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[800px] h-[600px] rounded-full bg-blue-600/10 blur-[180px]" />
        <div className="absolute top-1/2 right-0 w-[700px] h-[500px] rounded-full bg-purple-600/8 blur-[180px]" />
      </div>

      <div className="relative z-10 lg:pl-16 px-3 md:px-6 py-4 md:py-6">
        {/* ============ HERO = PRODUCT CARDS GRID (Higgsfield style) ============ */}
        <section className="container mx-auto max-w-7xl mb-12 md:mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
            {productCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`${card.large ? "col-span-2 row-span-2" : ""} group relative`}
              >
                <Link
                  to={card.link}
                  className="relative block w-full h-full overflow-hidden rounded-xl border border-white/10 bg-[#111] hover:border-white/30 transition-all duration-300"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-50 mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.5) 0%, transparent 50%)",
                    }}
                  />
                  {/* Hover scale layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Icon top-left */}
                  {card.icon && (
                    <div
                      className={`absolute ${
                        card.large ? "top-5 left-5" : "top-3 left-3"
                      } transition-transform duration-500 group-hover:scale-110`}
                    >
                      <div
                        className={`${
                          card.large ? "w-14 h-14" : "w-10 h-10"
                        } rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center`}
                      >
                        <card.icon
                          className={`${card.large ? "w-7 h-7" : "w-5 h-5"} text-white`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Badge top-right */}
                  {card.badge && (
                    <div
                      className={`absolute ${card.large ? "top-5 right-5" : "top-3 right-3"} px-2 py-0.5 rounded text-[9px] font-extrabold tracking-widest uppercase`}
                      style={{
                        backgroundColor: `${card.badge.color}25`,
                        color: card.badge.color,
                        border: `1px solid ${card.badge.color}80`,
                      }}
                    >
                      {card.badge.label}
                    </div>
                  )}

                  {/* Bottom content */}
                  <div className={`absolute inset-x-0 bottom-0 ${card.large ? "p-5 md:p-7" : "p-3 md:p-4"} z-10`}>
                    {card.category && (
                      <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/60 uppercase mb-1.5">
                        {card.category}
                      </div>
                    )}
                    <h3
                      className={`${
                        card.large
                          ? "text-2xl md:text-4xl font-display font-extrabold uppercase tracking-tight leading-[0.95]"
                          : "text-base md:text-lg font-display font-bold uppercase tracking-tight leading-tight"
                      } text-white mb-1`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`${card.large ? "text-sm md:text-base text-white/70 max-w-md" : "text-[11px] md:text-xs text-white/60"} leading-snug`}
                    >
                      {card.subtitle}
                    </p>

                    {card.large && (
                      <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wide group-hover:gap-3 transition-all">
                        Começar agora
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ ETYNS PRESETS (Higgsfield viral presets clone) ============ */}
        <section id="presets" className="container mx-auto max-w-7xl mb-12 md:mb-16">
          <div className="flex items-end justify-between mb-5 md:mb-6">
            <div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
                Etyns Presets
              </h2>
              <p className="text-xs md:text-sm text-white/50 mt-2 max-w-md">
                Estilos visuais prontos. Aplique em qualquer prompt e gere obras com coerência visual.
              </p>
            </div>
            <Link
              to="/image"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category chips */}
          <div className="relative mb-5">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3 md:mx-0 md:px-0">
              {presetCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel arrows + grid */}
          <div className="relative">
            <button
              aria-label="Anterior"
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/20 items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Próximo"
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/20 items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {presets.map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (i % 10) * 0.04, duration: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-white/40 transition-colors"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${presetGradients[i % presetGradients.length]}`}
                  />
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Title bottom-left */}
                  <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
                    <div className="text-[9px] md:text-[10px] font-extrabold tracking-[0.1em] text-white uppercase">
                      {p}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STUDIO BIG CTA BANNER ============ */}
        <section id="tools" className="container mx-auto max-w-7xl mb-12 md:mb-16">
          <Link
            to="/image"
            className="group relative block overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors"
          >
            <div className="aspect-[16/7] md:aspect-[16/5] relative">
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-cyan-600 to-purple-700" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-600"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Pattern */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.4) 0%, transparent 50%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 lg:p-16 max-w-3xl">
                <div className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.2em] text-white/70 mb-3">
                  Etyns Studio
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase text-white leading-[0.95] tracking-tight mb-4">
                  Um estúdio.<br />Toda a criação.
                </h2>
                <p className="text-sm md:text-base text-white/80 max-w-md mb-6">
                  Imagem, vídeo, controle de movimento e upscale 4K — tudo em um só lugar.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-black text-xs md:text-sm font-bold uppercase tracking-wide w-fit group-hover:gap-3 transition-all">
                  Abrir o estúdio
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ============ SHOWCASE GALLERY ============ */}
        <section id="showcase" className="container mx-auto max-w-7xl mb-12 md:mb-16">
          <div className="flex items-end justify-between mb-5 md:mb-6">
            <div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tight text-white leading-none">
                Galeria
              </h2>
              <p className="text-xs md:text-sm text-white/50 mt-2 max-w-md">
                Confira o que a comunidade está criando com o Etyns Studio.
              </p>
            </div>
            <Link
              to="/meus-renders"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
            >
              Ver galeria
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {showcaseShots.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 8) * 0.05, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-white/40 transition-colors"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
                <div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.25) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {s.tag === "VÍDEO" && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/30 text-white">
                    {s.tag}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
                  <div className="text-[10px] md:text-[11px] font-extrabold tracking-[0.1em] text-white uppercase">
                    {s.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ PRICING SUB-CTA ============ */}
        <section id="pricing" className="container mx-auto max-w-7xl mb-12 md:mb-20">
          <div className="grid md:grid-cols-2 gap-3">
            <Link
              to="/planos"
              className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors aspect-[16/9] md:aspect-[16/8]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-red-800" />
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70 mb-2">
                  Planos
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-extrabold uppercase text-white leading-tight tracking-tight mb-2">
                  Créditos<br />ilimitados
                </h3>
                <p className="text-xs md:text-sm text-white/80 mb-4 max-w-xs">
                  Desbloqueie todo o potencial criativo com os planos Pro.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white group-hover:gap-2.5 transition-all">
                  Ver planos
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            <Link
              to="/faq"
              className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors aspect-[16/9] md:aspect-[16/8]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800" />
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70 mb-2">
                  Suporte
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-extrabold uppercase text-white leading-tight tracking-tight mb-2">
                  Tire suas<br />dúvidas
                </h3>
                <p className="text-xs md:text-sm text-white/80 mb-4 max-w-xs">
                  Confira o FAQ ou fale com nosso suporte.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white group-hover:gap-2.5 transition-all">
                  Acessar FAQ
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;



