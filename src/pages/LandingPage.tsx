import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  ArrowRight,
  Zap,
  Wand2,
  Image as ImageIcon,
  Film,
  Crown,
  ChevronRight,
  Sparkles,
  Cpu,
  Palette,
  Rocket,
  Star,
  Play,
} from "lucide-react";
import EtynsIcon from "@/components/EtynsIcon";
import GoogleGIcon from "@/components/GoogleGIcon";
import ThanosDissolve from "@/components/ThanosDissolve";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const tools = [
  {
    title: "Nano Banana 2",
    subtitle: "Imagens em ultra resolução",
    description:
      "Crie imagens impressionantes em 4K com IA de última geração. Prompt inteligente, estilos artísticos e upscale automático.",
    icon: Sparkles,
    customIconComponent: GoogleGIcon,
    color: "from-etyns-blue to-etyns-cyan",
    bgGlow: "hsl(210 100% 55% / 0.18)",
    accent: "hsl(210 100% 60%)",
    link: "/image",
    badge: "POPULAR",
    features: [
      { icon: ImageIcon, label: "Resolução 4K nativa" },
      { icon: Wand2, label: "Assistente de prompts" },
      { icon: Zap, label: "Upscale inteligente" },
    ],
  },
  {
    title: "Control Motion",
    subtitle: "Transforme imagens em vídeos",
    description:
      "Anime suas imagens com controle preciso de movimento. Vídeos cinematográficos a partir de qualquer imagem estática.",
    icon: Video,
    color: "from-etyns-purple to-etyns-blue",
    bgGlow: "hsl(260 100% 65% / 0.18)",
    accent: "hsl(260 100% 70%)",
    link: "/motion-control",
    badge: "NOVO",
    features: [
      { icon: Film, label: "Vídeos Full HD 1080p" },
      { icon: Video, label: "Controle de movimento" },
      { icon: Zap, label: "Processamento rápido" },
    ],
  },
];

const showcaseItems = [
  {
    title: "Cinemático",
    tag: "VÍDEO",
    gradient: "from-etyns-blue/40 via-etyns-cyan/30 to-etyns-purple/40",
  },
  {
    title: "Retrato 4K",
    tag: "IMAGEM",
    gradient: "from-etyns-purple/40 via-etyns-blue/30 to-etyns-cyan/40",
  },
  {
    title: "Sci-fi",
    tag: "VÍDEO",
    gradient: "from-etyns-cyan/40 via-etyns-blue/30 to-etyns-purple/40",
  },
  {
    title: "Produto",
    tag: "IMAGEM",
    gradient: "from-etyns-blue/40 via-etyns-purple/30 to-etyns-cyan/40",
  },
  {
    title: "Anime",
    tag: "IMAGEM",
    gradient: "from-etyns-purple/50 via-etyns-cyan/30 to-etyns-blue/40",
  },
  {
    title: "Motion",
    tag: "VÍDEO",
    gradient: "from-etyns-cyan/50 via-etyns-purple/30 to-etyns-blue/40",
  },
];

const steps = [
  {
    icon: Wand2,
    title: "Descreva sua ideia",
    desc: "Use o assistente de prompts ou escreva livremente o que você imagina.",
  },
  {
    icon: Cpu,
    title: "IA processa em segundos",
    desc: "Modelos de última geração geram resultados em alta qualidade.",
  },
  {
    icon: Rocket,
    title: "Baixe e compartilhe",
    desc: "Exporte em 4K, anime suas imagens e leve sua criação para qualquer lugar.",
  },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen pt-[calc(3.5rem+4px)] md:pt-[calc(5rem+4px)] bg-background text-foreground overflow-hidden">
      {/* Background video */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <video
          src="/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, transparent 35%, hsl(var(--background) / 0.7) 90%, hsl(var(--background)) 100%)",
          }}
        />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-etyns-purple/6 blur-[160px]" />
      </div>

      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {/* ============ HERO ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-5xl text-center mb-16 md:mb-24 pt-4 md:pt-12">
            <motion.div initial="hidden" animate="visible">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary">
                  Estúdio criativo com IA
                </span>
              </motion.div>

              {/* Logo */}
              <motion.div variants={fadeUp} custom={1} className="flex justify-center mb-6">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <EtynsIcon size={64} animated />
                </motion.div>
              </motion.div>

              {/* Title gigante */}
              <motion.h1
                variants={fadeUp}
                custom={2}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold mb-5 leading-[0.95] tracking-tight"
              >
                <span className="text-gradient-watermelon">Etyns</span>
                <br />
                <span className="text-foreground">Studio</span>
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Gere imagens em <span className="text-foreground font-semibold">4K</span> e
                anime-as em <span className="text-foreground font-semibold">vídeos cinematográficos</span>.
                Tudo em segundos, com IA de última geração.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex flex-wrap justify-center gap-3 mb-10"
              >
                <Link
                  to="/image"
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-etyns-blue to-etyns-cyan text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                  Começar a Criar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/planos"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide border border-border/60 bg-card/80 backdrop-blur-sm text-foreground hover:border-primary/50 hover:bg-card transition-all duration-300"
                >
                  <Crown className="w-4 h-4" />
                  Ver Planos
                </Link>
              </motion.div>

              {/* Selos de confiança */}
              <motion.div
                variants={fadeUp}
                custom={5}
                className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[11px] md:text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-etyns-blue text-etyns-blue" />
                    ))}
                  </div>
                  <span>Avaliação 4.9</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-border/60" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-etyns-cyan" />
                  <span>Geração em segundos</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-border/60" />
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-etyns-purple" />
                  <span>Sem marca d'água</span>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </ThanosDissolve>

        {/* ============ TOOLS ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-6xl mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 md:mb-12"
            >
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                Ferramentas
              </p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight">
                Crie sem limites
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
                Dois motores de IA pensados para criadores. Comece pela imagem ou pule direto para vídeo.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  custom={index}
                  variants={fadeUp}
                >
                  <Link to={tool.link} className="group block h-full">
                    <motion.div
                      className="relative h-full p-6 md:p-8 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg shadow-primary/5 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Glow */}
                      <div
                        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{ background: tool.bgGlow }}
                      />

                      {/* Badge canto superior direito */}
                      <div
                        className="absolute top-4 right-4 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest"
                        style={{
                          background: `${tool.accent}20`,
                          color: tool.accent,
                          border: `1px solid ${tool.accent}40`,
                        }}
                      >
                        {tool.badge}
                      </div>

                      <div className="relative z-10">
                        {/* Ícone grande */}
                        <motion.div
                          className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${tool.color} mb-5 shadow-xl shadow-primary/20`}
                          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {"customIconComponent" in tool && tool.customIconComponent ? (
                            <tool.customIconComponent className="w-7 h-7 md:w-8 md:h-8" />
                          ) : (
                            <tool.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                          )}
                        </motion.div>

                        <h3 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-1 leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">
                          {tool.subtitle}
                        </p>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                          {tool.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2.5 mb-6">
                          {tool.features.map((feat) => (
                            <div key={feat.label} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                <feat.icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm text-foreground font-medium">
                                {feat.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all">
                          Explorar
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </ThanosDissolve>

        {/* ============ SHOWCASE ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-6xl mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-10"
            >
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                Inspiração
              </p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight">
                O que você pode criar
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
                Explore estilos visuais e formatos. Cada criação começa com um prompt.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {showcaseItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 cursor-pointer"
                >
                  {/* Gradient placeholder background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-90`}
                  />
                  {/* Pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-30 mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.4) 0%, transparent 50%)",
                    }}
                  />
                  {/* Animated noise grain on hover */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.4)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Play icon for video tag */}
                  {item.tag === "VÍDEO" && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </motion.div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-bold text-white">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-bold text-white/80 px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </ThanosDissolve>

        {/* ============ COMO FUNCIONA ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-5xl mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 md:mb-12"
            >
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                Fluxo
              </p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight">
                Como funciona
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
                Do prompt à criação final em três passos simples.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
              {/* Linha conectora desktop */}
              <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative text-center"
                >
                  {/* Número */}
                  <div className="relative inline-flex items-center justify-center mb-5">
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                    <div className="relative w-20 h-20 rounded-2xl bg-card border border-border/60 backdrop-blur-sm flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-etyns-blue to-etyns-purple flex items-center justify-center text-[11px] font-extrabold text-white shadow-lg shadow-primary/30">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </ThanosDissolve>

        {/* ============ STATS ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-5xl mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl shadow-primary/5 p-6 md:p-10 overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-etyns-blue/20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-etyns-purple/20 blur-3xl" />
              </div>

              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { value: "4K", label: "Resolução máxima" },
                  { value: "2", label: "Ferramentas IA" },
                  { value: "1080p", label: "Vídeos Full HD" },
                  { value: "∞", label: "Possibilidades" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div className="text-3xl md:text-5xl font-display font-extrabold text-gradient-watermelon mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-[0.15em]">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </ThanosDissolve>

        {/* ============ CTA FINAL ============ */}
        <ThanosDissolve direction="up" className="block">
          <section className="container mx-auto max-w-5xl mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl border border-primary/30 p-8 md:p-14 text-center"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-etyns-blue/20 via-etyns-cyan/10 to-etyns-purple/20" />
              <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />

              {/* Animated orbs */}
              <motion.div
                className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-etyns-blue/30 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-etyns-purple/30 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative z-10">
                <Palette className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-5 text-primary" />
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                  Pronto para dar vida<br />
                  <span className="text-gradient-watermelon">às suas ideias?</span>
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                  Comece grátis e explore o poder da criação com IA.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/image"
                    className="group inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-etyns-blue to-etyns-cyan text-white shadow-lg shadow-primary/30 hover:shadow-primary/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    Criar Agora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/planos"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold uppercase tracking-wide border border-border/60 bg-card/80 backdrop-blur-sm text-foreground hover:border-primary/50 transition-all duration-300"
                  >
                    <Crown className="w-4 h-4" />
                    Ver Planos
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </ThanosDissolve>
      </div>
    </div>
  );
};

export default LandingPage;

