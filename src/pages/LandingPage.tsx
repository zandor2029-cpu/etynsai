import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Video, ArrowRight, Zap, Wand2, Image, Film, Crown, ChevronRight } from "lucide-react";
import EtynsIcon from "@/components/EtynsIcon";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const tools = [
  {
    title: "Etyns Image 4K",
    subtitle: "Geração de imagens em ultra resolução",
    description:
      "Crie imagens impressionantes em 4K com IA de última geração. Prompt inteligente, estilos artísticos e upscale automático para resultados profissionais.",
    icon: Sparkles,
    color: "from-etyns-blue to-etyns-cyan",
    bgGlow: "hsl(210 100% 55% / 0.15)",
    link: "/image",
    features: [
      { icon: Image, label: "Resolução 4K nativa" },
      { icon: Wand2, label: "Assistente de prompts com IA" },
      { icon: Zap, label: "Upscale inteligente" },
    ],
  },
  {
    title: "Etyns Motion",
    subtitle: "Transforme imagens em vídeos",
    description:
      "Anime suas imagens com controle preciso de movimento. Gere vídeos cinematográficos de alta qualidade a partir de qualquer imagem estática.",
    icon: Video,
    color: "from-etyns-purple to-etyns-blue",
    bgGlow: "hsl(260 100% 65% / 0.15)",
    link: "/motion-control",
    features: [
      { icon: Film, label: "Vídeos até 720p" },
      { icon: Video, label: "Controle de movimento" },
      { icon: Zap, label: "Processamento rápido" },
    ],
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-animated-gradient bg-orbs pt-20 md:pt-28 pb-16 overflow-hidden">
      {/* Hero */}
      <section className="container mx-auto px-4 text-center mb-16 md:mb-24">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
            <EtynsIcon size={72} animated />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold mb-4 text-gradient-watermelon leading-tight"
          >
            Etyns Studio
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Estúdio criativo com IA. Gere imagens em 4K e anime-as em vídeos cinematográficos — tudo em um só lugar.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-3">
            <Link
              to="/image"
              className="btn-watermelon flex items-center gap-2 px-6 py-3 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Começar a Criar
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/planos"
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <Crown className="w-4 h-4" />
              Ver Planos
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Tools */}
      <section className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl md:text-3xl font-display font-bold text-foreground mb-10"
        >
          Nossas Ferramentas
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={index}
              variants={fadeUp}
            >
              <Link
                to={tool.link}
                className="group block h-full"
              >
                <div className="glass-card h-full p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden">
                  {/* Background glow */}
                  <div
                    className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: tool.bgGlow }}
                  />

                  {/* Icon & Title */}
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} mb-5`}>
                      <tool.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-3">
                      {tool.subtitle}
                    </p>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2.5 mb-6">
                      {tool.features.map((feat) => (
                        <div key={feat.label} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                            <feat.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm text-foreground font-medium">{feat.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                      Explorar {tool.title.split(" ").slice(1).join(" ")}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="container mx-auto px-4 mt-16 md:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card max-w-4xl mx-auto p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "4K", label: "Resolução máxima" },
              { value: "2", label: "Ferramentas IA" },
              { value: "720p", label: "Vídeos HD" },
              { value: "∞", label: "Possibilidades" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-4xl font-display font-extrabold text-gradient-watermelon mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
