import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Mail, ExternalLink, Zap } from "lucide-react";
import EtynsIcon from "./EtynsIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Instagram", href: "#", icon: "📸" },
    { name: "Discord", href: "#", icon: "💬" },
  ];

  const footerLinks = [
    {
      title: "Produto",
      links: [
        { name: "Gerar Imagens", href: "/" },
        { name: "Gerar Vídeos", href: "/motion-control" },
        { name: "Meus Renders", href: "/meus-renders" },
        { name: "Planos", href: "/planos" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { name: "Tutoriais", href: "#" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Termos de Uso", href: "/termos-de-uso" },
        { name: "Privacidade", href: "#" },
        { name: "Cookies", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative mt-16 md:mt-24 border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-t from-etyns-blue/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ duration: 0.2 }}>
                <EtynsIcon size={32} animated={false} />
              </motion.div>
              <span className="font-display text-lg md:text-xl font-bold text-gradient-watermelon">
                Etyns
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Gere imagens e vídeos incríveis com a mais avançada inteligência artificial.
            </p>
            
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-sm transition-colors hover:scale-110"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm text-foreground mb-3 md:mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.name}
                      {link.href.startsWith("http") && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} Etyns.</span>
            <span className="hidden md:inline">Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Feito com</span>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
              <Heart className="w-4 h-4 text-etyns-purple fill-etyns-purple" />
            </motion.span>
            <span>e</span>
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}>
              <Zap className="w-4 h-4 text-etyns-blue" />
            </motion.span>
            <span>no Brasil 🇧🇷</span>
          </div>

          <a
            href="mailto:contato@etyns.com"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contato</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
