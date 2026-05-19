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
    <footer className="relative mt-12 md:mt-20 border-t border-white/10 bg-[#0a0a0a] overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[400px] h-[200px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-[400px] h-[200px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 group mb-4">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ duration: 0.2 }}>
                <EtynsIcon size={28} animated={false} />
              </motion.div>
              <span className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                Etyns
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs">
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
                  className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-extrabold uppercase tracking-[0.15em] text-white mb-4">
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
                          className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all" />
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all" />
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
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/40">
            © {currentYear} Etyns. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Sistema operacional
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

