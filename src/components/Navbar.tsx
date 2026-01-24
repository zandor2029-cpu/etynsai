import { Link, useLocation } from "react-router-dom";
import { Video, FolderOpen, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import BananaIcon from "./BananaIcon";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Nano Banana Pro 4K", icon: null, customIcon: BananaIcon },
    { path: "/motion-control", label: "Kling Motion Control", icon: Video, customIcon: null },
    { path: "/meus-renders", label: "Meus Renders", icon: FolderOpen, customIcon: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
