import { ChevronDown, Check, Ratio } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const aspectRatios = [
  { value: "1:1", label: "1:1 (Quadrado)", icon: "⬜", desc: "Instagram, Avatar" },
  { value: "16:9", label: "16:9 (Paisagem)", icon: "🖼️", desc: "YouTube, Desktop" },
  { value: "9:16", label: "9:16 (Vertical)", icon: "📱", desc: "Stories, TikTok" },
];

const AspectRatioSelect = ({ value, onChange }: AspectRatioSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = aspectRatios.find((r) => r.value === value) || aspectRatios[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2 md:space-y-3" ref={containerRef}>
      <label className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm font-semibold text-muted-foreground tracking-wide">
        <Ratio className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
        <span>Aspect Ratio</span>
      </label>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-glass flex items-center justify-between cursor-pointer group h-[46px] md:h-[58px]"
        whileHover={{ scale: 1.01, borderColor: "hsl(145 80% 42% / 0.3)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
      >
        <span className="flex items-center gap-2 md:gap-3">
          <motion.span 
            className="text-lg md:text-xl"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {selected.icon}
          </motion.span>
          <div className="text-left">
            <span className="font-semibold text-foreground text-sm md:text-base">{selected.label}</span>
            <p className="text-[10px] md:text-xs text-muted-foreground">{selected.desc}</p>
          </div>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute top-full left-0 right-0 mt-1.5 md:mt-2 glass-card p-1.5 md:p-2 z-50 rounded-xl md:rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-md shadow-lg"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {aspectRatios.map((ratio, index) => (
              <motion.button
                key={ratio.value}
                type="button"
                onClick={() => {
                  onChange(ratio.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-colors
                  ${ratio.value === value
                    ? "bg-gradient-to-r from-primary/20 to-etyns-purple/20 border border-primary/30"
                    : "hover:bg-muted/50"
                  }
                `}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <motion.span 
                  className="text-xl md:text-2xl"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {ratio.icon}
                </motion.span>
                <div className="text-left flex-1">
                  <span className={`font-semibold text-sm md:text-base ${ratio.value === value ? "text-primary-light" : "text-foreground"}`}>
                    {ratio.label}
                  </span>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{ratio.desc}</p>
                </div>
                {ratio.value === value && (
                  <motion.div 
                    className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-primary/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AspectRatioSelect;
