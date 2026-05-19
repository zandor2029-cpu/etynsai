import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Video, Crown, FileText, HelpCircle, Mail, Instagram, Twitter, Youtube } from "lucide-react";
import EtynsIcon from "./EtynsIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Ferramentas",
      links: [
        { label: "Nano Banana 2", to: "/image", icon: Sparkles },
        { label: "Control Motion", to: "/motion-control", icon: Video },
        { label: "Meus Renders", to: "/renders", icon: FileText },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Planos", to: "/planos", icon: Crown },
        { label: "FAQ", to: "/faq", icon: HelpCircle },
        { label: "Termos de Uso", to: "/termos", icon: FileText },
      ],
    },
    {
      title: "Contato",
      links: [
        { label: "Suporte", to: "mailto:contato@etyns.ai", icon: Mail, external: true },
      ],
    },
  ];

  const socials = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <footer className="relative mt-16 md:mt-24 border-t border-border/40 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[400px] h-[200px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-[400px] h-[200px] rounded-full bg-etyns-cyan/5 blur-[120px]" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[180px] rounded-full bg-etyns-purple/4 blur-[140px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 group mb-4">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <EtynsIcon size={28} animated={false} />
              </motion.div>
              <span className="font-display text-xl font-extrabold text-gradient-watermelon">
                Etyns
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              Estúdio criativo com IA. Imagens em 4K e vídeos cinematográficos em segundos.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ y: -3, scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  className="w-9 h-9 rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => {
                  const Icon = link.icon;
                  if ("external" in link && link.external) {
                    return (
                      <li key={link.label}>
                        <a
                          href={link.to}
                          className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            © {currentYear} Etyns. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-etyns-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-etyns-cyan" />
            </span>
            Sistema operacional
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

