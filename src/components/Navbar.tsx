import { Link, useLocation } from "react-router-dom";
import { Video, FolderOpen, Menu, X, Sparkles, LogOut, Crown, User, History, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BananaIcon from "./BananaIcon";
import CreditDisplay from "./CreditDisplay";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useAuth();

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const menuRef = useFocusTrap({
    isActive: mobileMenuOpen,
    onEscape: closeMobileMenu,
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { path: "/", label: "Nano Banana Pro 4K", shortLabel: "Nano Banana", icon: null, customIcon: BananaIcon },
    { path: "/motion-control", label: "Kling Motion Control", shortLabel: "Motion Control", icon: Video, customIcon: null },
    { path: "/meus-renders", label: "Meus Renders", shortLabel: "Meus Renders", icon: FolderOpen, customIcon: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* RGB Top Border */}
        <div 
          className="h-0.5 w-full"
          style={{
            background: 'linear-gradient(90deg, hsl(145 100% 50%), hsl(180 100% 50%), hsl(330 100% 65%), hsl(350 90% 62%), hsl(15 100% 60%), hsl(145 100% 50%))',
            backgroundSize: '300% 100%',
            animation: 'rgb-flow 4s linear infinite',
          }}
        />
        
        <div className="glass-card rounded-none border-t-0 border-x-0 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-3 md:px-4">
            <div className="flex items-center justify-between h-14 md:h-20">
              {/* Logo - Compact on mobile */}
              <Link 
                to="/" 
                className="flex items-center gap-2 md:gap-3 group"
              >
                <span className="text-2xl md:text-4xl animate-bounce-melon group-hover:animate-spin-slow transition-all">
                  🍉
                </span>
                <div className="flex flex-col">
                  <span className="text-base md:text-2xl font-display font-bold text-gradient-watermelon">
                    Watermelon IA
                  </span>
                  <span className="text-[8px] md:text-[10px] text-muted-foreground font-medium tracking-widest uppercase hidden sm:block">
                    <Sparkles className="w-2 h-2 md:w-2.5 md:h-2.5 inline mr-0.5 md:mr-1" />
                    Premium AI Studio
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2.5 ${isActive(item.path) ? "active" : ""}`}
                  >
                    {item.customIcon ? (
                      <item.customIcon size={20} animated={false} />
                    ) : item.icon ? (
                      <item.icon className="w-4 h-4" />
                    ) : null}
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                ))}
                
                {/* Plans Link */}
                <Link
                  to="/planos"
                  className={`nav-link flex items-center gap-2.5 ${isActive('/planos') ? "active" : ""}`}
                >
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold">Planos</span>
                </Link>
                
                {/* History Link - only for logged in users */}
                {user && (
                  <Link
                    to="/historico"
                    className={`nav-link flex items-center gap-2.5 ${isActive('/historico') ? "active" : ""}`}
                  >
                    <History className="w-4 h-4" />
                    <span className="font-semibold">Histórico</span>
                  </Link>
                )}
              </div>

              {/* Right side - Auth & Credits (Desktop) */}
              <div className="hidden lg:flex items-center gap-4">
                {user ? (
                  <>
                    <CreditDisplay compact />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {profile?.full_name || profile?.email?.split('@')[0]}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Sair"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-watermelon-green/20 to-watermelon-pink/20 border border-watermelon-green/30 hover:border-watermelon-green/50 transition-colors"
                  >
                    <User className="w-4 h-4 text-watermelon-green" />
                    <span className="font-semibold text-foreground">Entrar</span>
                  </button>
                )}
              </div>

              {/* Mobile Right Side - Credits + Menu */}
              <div className="flex lg:hidden items-center gap-2">
                {/* Compact credits on mobile */}
                {user && (
                  <Link to="/planos" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-watermelon-green/10 border border-watermelon-green/20">
                    <Sparkles className="w-3.5 h-3.5 text-watermelon-green" />
                    <span className="text-xs font-bold text-watermelon-green">{profile?.credits ?? 0}</span>
                  </Link>
                )}
                
                {/* Hamburger Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl glass-card text-foreground hover:text-primary transition-all"
                  aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation-menu"
                  aria-haspopup="true"
                >
                  <AnimatePresence mode="wait">
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Menu className="w-5 h-5" aria-hidden="true" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              
              {/* Menu Panel */}
              <motion.div
                ref={menuRef}
                id="mobile-navigation-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navegação"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-[58px] right-0 bottom-0 w-[280px] max-w-[85vw] bg-background/98 backdrop-blur-xl border-l border-border lg:hidden overflow-y-auto"
              >
                <div className="p-4">
                  {/* User info */}
                  {user && (
                    <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-watermelon-green to-watermelon-pink flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {profile?.full_name || 'Usuário'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav aria-label="Menu principal mobile" className="space-y-1" role="navigation">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          aria-current={isActive(item.path) ? "page" : undefined}
                          className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-watermelon-green focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            isActive(item.path) 
                              ? "bg-gradient-to-r from-watermelon-green/15 to-watermelon-pink/15 border border-watermelon-green/30" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {/* Active indicator bar */}
                          {isActive(item.path) && (
                            <motion.div
                              layoutId="mobile-nav-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-watermelon-green to-watermelon-pink"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              transition={{ duration: 0.2 }}
                              aria-hidden="true"
                            />
                          )}
                          {item.customIcon ? (
                            <item.customIcon size={20} animated={false} className={isActive(item.path) ? "" : "opacity-70"} aria-hidden="true" />
                          ) : item.icon ? (
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-watermelon-green" : "text-muted-foreground"}`} aria-hidden="true" />
                          ) : null}
                          <span className={`font-medium text-sm flex-1 ${isActive(item.path) ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            {item.shortLabel}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isActive(item.path) ? "text-watermelon-green" : "text-muted-foreground/50"}`} aria-hidden="true" />
                        </Link>
                      </motion.div>
                    ))}

                    {/* Plans link */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navItems.length * 0.05 }}
                    >
                      <Link
                        to="/planos"
                        aria-current={isActive('/planos') ? "page" : undefined}
                        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-watermelon-green focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          isActive('/planos') 
                            ? "bg-gradient-to-r from-watermelon-green/15 to-watermelon-pink/15 border border-watermelon-green/30" 
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {isActive('/planos') && (
                          <motion.div
                            layoutId="mobile-nav-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-watermelon-green to-watermelon-pink"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          />
                        )}
                        <Crown className={`w-5 h-5 ${isActive('/planos') ? "text-watermelon-green" : "text-muted-foreground"}`} aria-hidden="true" />
                        <span className={`font-medium text-sm flex-1 ${isActive('/planos') ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          Planos
                        </span>
                        <ChevronRight className={`w-4 h-4 ${isActive('/planos') ? "text-watermelon-green" : "text-muted-foreground/50"}`} aria-hidden="true" />
                      </Link>
                    </motion.div>

                    {/* History link - only for logged in users */}
                    {user && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navItems.length + 1) * 0.05 }}
                      >
                        <Link
                          to="/historico"
                          aria-current={isActive('/historico') ? "page" : undefined}
                          className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-watermelon-green focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            isActive('/historico') 
                              ? "bg-gradient-to-r from-watermelon-green/15 to-watermelon-pink/15 border border-watermelon-green/30" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {isActive('/historico') && (
                            <motion.div
                              layoutId="mobile-nav-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-watermelon-green to-watermelon-pink"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              transition={{ duration: 0.2 }}
                              aria-hidden="true"
                            />
                          )}
                          <History className={`w-5 h-5 ${isActive('/historico') ? "text-watermelon-green" : "text-muted-foreground"}`} aria-hidden="true" />
                          <span className={`font-medium text-sm flex-1 ${isActive('/historico') ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            Histórico
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isActive('/historico') ? "text-watermelon-green" : "text-muted-foreground/50"}`} aria-hidden="true" />
                        </Link>
                      </motion.div>
                    )}
                  </nav>

                  {/* Divider */}
                  <div className="my-4 border-t border-border" role="separator" />

                  {/* Auth Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label="Sair da sua conta"
                      >
                        <LogOut className="w-5 h-5" aria-hidden="true" />
                        <span className="font-medium text-sm">Sair da conta</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowAuthModal(true);
                        }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-watermelon-green to-watermelon-pink text-white font-semibold text-sm shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-watermelon-green focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label="Entrar ou criar uma conta"
                      >
                        <User className="w-4 h-4" aria-hidden="true" />
                        Entrar / Criar Conta
                      </button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar;
