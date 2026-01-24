import { Link, useLocation, useNavigate } from "react-router-dom";
import { Video, FolderOpen, Menu, X, Sparkles, LogOut, Crown, User } from "lucide-react";
import { useState } from "react";
import BananaIcon from "./BananaIcon";
import CreditDisplay from "./CreditDisplay";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { path: "/", label: "Nano Banana Pro 4K", icon: null, customIcon: BananaIcon },
    { path: "/motion-control", label: "Kling Motion Control", icon: Video, customIcon: null },
    { path: "/meus-renders", label: "Meus Renders", icon: FolderOpen, customIcon: null },
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
        
        <div className="glass-card rounded-none border-t-0 border-x-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
              >
                <span className="text-3xl md:text-4xl animate-bounce-melon group-hover:animate-spin-slow transition-all">
                  🍉
                </span>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-display font-bold text-gradient-watermelon">
                    Watermelon IA
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase hidden sm:block">
                    <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                    Premium AI Studio
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
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
              </div>

              {/* Right side - Auth & Credits */}
              <div className="hidden md:flex items-center gap-4">
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl glass-card text-foreground hover:text-primary transition-all hover:glow-green"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-border animate-fade-in">
                {/* Credits display for mobile */}
                {user && (
                  <div className="px-4 mb-4">
                    <CreditDisplay />
                  </div>
                )}

                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all mb-2 ${
                      isActive(item.path) 
                        ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground border border-primary/30" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.customIcon ? (
                      <item.customIcon size={24} animated={false} className={isActive(item.path) ? "" : "opacity-70"} />
                    ) : item.icon ? (
                      <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-primary" : ""}`} />
                    ) : null}
                    <span className="font-semibold">{item.label}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto text-xs badge-watermelon">Ativo</span>
                    )}
                  </Link>
                ))}

                {/* Plans link mobile */}
                <Link
                  to="/planos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all mb-2 ${
                    isActive('/planos') 
                      ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground border border-primary/30" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Planos</span>
                </Link>

                {/* Auth buttons mobile */}
                <div className="mt-4 px-4 pt-4 border-t border-border">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-semibold">Sair</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowAuthModal(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-watermelon-green to-watermelon-pink text-white font-semibold"
                    >
                      <User className="w-5 h-5" />
                      Entrar / Criar Conta
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar;
