import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, ArrowRight, Zap, Wand2, Image, Film, Crown, ChevronRight, Sparkles } from "lucide-react";
import EtynsIcon from "@/components/EtynsIcon";
import GoogleGIcon from "@/components/GoogleGIcon";
import ThanosDissolve from "@/components/ThanosDissolve";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
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
    bgGlow: "hsl(210 100% 55% / 0.15)",
    link: "/image",
    features: [
      { icon: Image, label: "Resolução 4K nativa" },
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
    bgGlow: "hsl(260 100% 65% / 0.15)",
    link: "/motion-control",
    features: [
      { icon: Film, label: "Vídeos Full HD 1080p" },
      { icon: Video, label: "Controle de movimento" },
      { icon: Zap, label: "Processamento rápido" },
    ],
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
        {/* Dark gradient overlay — vignette + top/bottom darkening */}
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

      {/* Ambient glow — Control Motion style */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-etyns-cyan/8 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-etyns-purple/6 blur-[160px]" />
      </div>

      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {/* Hero */}
        <ThanosDissolve direction="up" className="block">
        <section className="container mx-auto max-w-4xl text-center mb-10 md:mb-14">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-4">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <EtynsIcon size={52} animated />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-3 text-gradient-watermelon leading-tight tracking-tight"
            >
              ETYNS
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed"
            >
              Estúdio criativo com IA. Gere imagens em 4K e anime-as em vídeos cinematográficos.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-2.5">
              <Link
                to="/image"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Começar a Criar
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/planos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border border-border/60 bg-card/95 text-foreground hover:border-primary/50 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                Ver Planos
              </Link>
            </motion.div>
          </motion.div>
        </section>
        </ThanosDissolve>

        {/* Tools */}
        <ThanosDissolve direction="up" className="block">
        <section className="container mx-auto max-w-5xl mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-lg md:text-xl font-display font-bold text-foreground mb-6"
          >
            Nossas Ferramentas
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
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
                    className="relative h-full p-4 md:p-5 rounded-xl border border-border/60 bg-card/95 shadow-lg shadow-primary/5 overflow-hidden transition-all hover:border-primary/40"
                    whileHover={{ y: -3, transition: { duration: 0.25 } }}
                  >
                    {/* Background glow */}
                    <div
                      className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ background: tool.bgGlow }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} mb-3 shadow-md`}
                        whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                      >
                        {'customIconComponent' in tool && tool.customIconComponent ? (
                          <tool.customIconComponent className="w-5 h-5" />
                        ) : (
                          <tool.icon className="w-5 h-5 text-white" />
                        )}
                      </motion.div>

                      <h3 className="text-base md:text-lg font-display font-bold text-foreground mb-0.5 leading-tight">
                        {tool.title}
                      </h3>
                      <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2">
                        {tool.subtitle}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                        {tool.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1.5 mb-4">
                        {tool.features.map((feat) => (
                          <div key={feat.label} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                              <feat.icon className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-[11px] text-foreground font-medium">{feat.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px] uppercase tracking-wider group-hover:gap-2.5 transition-all">
                        Explorar
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        </ThanosDissolve>

        {/* Stats */}
        <ThanosDissolve direction="up" className="block">
        <section className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-border/60 bg-card/95 shadow-lg shadow-primary/5 p-5 md:p-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { value: "4K", label: "Resolução máxima" },
                { value: "2", label: "Ferramentas IA" },
                { value: "1080p", label: "Vídeos Full HD" },
                { value: "∞", label: "Possibilidades" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                >
                  <div className="text-xl md:text-2xl font-display font-extrabold text-gradient-watermelon mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
        </ThanosDissolve>
      </div>
    </div>
  );
};

export default LandingPage;
