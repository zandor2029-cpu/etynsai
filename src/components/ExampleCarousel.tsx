import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface ExampleImage {
  url: string;
  prompt: string;
  style: string;
}

// Example images to showcase capabilities
const examples: ExampleImage[] = [
  {
    url: "https://images.unsplash.com/photo-1675271591211-126ad94e495d?w=600&h=600&fit=crop",
    prompt: "Futuristic cyberpunk city at night with neon lights",
    style: "Realism",
  },
  {
    url: "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=600&h=600&fit=crop",
    prompt: "Ethereal portrait with cosmic elements and stars",
    style: "Artistic",
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
    prompt: "Abstract geometric art with vibrant gradients",
    style: "3D",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    prompt: "Hyperrealistic portrait with dramatic lighting",
    style: "Realism",
  },
  {
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop",
    prompt: "Magical fantasy landscape with floating islands",
    style: "Anime",
  },
];

const ExampleCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const current = examples[currentIndex];

  return (
    <div
      className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-watermelon-green/5 via-transparent to-watermelon-pink/5" />

      {/* Main carousel */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            <img
              src={current.url}
              alt={current.prompt}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-2"
              >
                <div className="p-1.5 rounded-lg bg-watermelon-green/20 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-watermelon-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-foreground line-clamp-1 mb-0.5">
                    {current.prompt}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-watermelon-pink/20 text-watermelon-pink-neon">
                    {current.style}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background hover:scale-110"
        whileTap={{ scale: 0.9 }}
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background hover:scale-110"
        whileTap={{ scale: 0.9 }}
        aria-label="Próxima imagem"
      >
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
      </motion.button>

      {/* Dots indicator */}
      <div className="absolute bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
        {examples.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-4 bg-watermelon-green"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Ir para imagem ${idx + 1}`}
          />
        ))}
      </div>

      {/* "Exemplos IA" badge */}
      <div className="absolute top-2 md:top-3 right-2 md:right-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-background/80 backdrop-blur-sm border border-watermelon-green/30 text-watermelon-green">
          <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
          Exemplos IA
        </span>
      </div>
    </div>
  );
};

export default ExampleCarousel;
