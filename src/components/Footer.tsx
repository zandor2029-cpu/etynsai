import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EtynsIcon from "./EtynsIcon";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-12 md:mt-16 border-t border-border/40">
      {/* Ambient glow — matches Control Motion */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[400px] h-[200px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-[400px] h-[200px] rounded-full bg-etyns-cyan/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ duration: 0.2 }}>
              <EtynsIcon size={22} animated={false} />
            </motion.div>
            <span className="font-display text-sm font-bold text-gradient-watermelon">
              Etyns
            </span>
          </Link>

          <div className="text-[11px] text-muted-foreground">
            © {currentYear} Etyns. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
