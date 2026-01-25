import { ChevronDown, Check, Ratio } from "lucide-react";
import { useState } from "react";

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
  const selected = aspectRatios.find((r) => r.value === value) || aspectRatios[0];

  return (
    <div className="relative space-y-2 md:space-y-3">
      <label className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm font-semibold text-muted-foreground tracking-wide">
        <Ratio className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
        <span>Aspect Ratio</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-glass flex items-center justify-between cursor-pointer group h-[46px] md:h-[58px]"
      >
        <span className="flex items-center gap-2 md:gap-3">
          <span className="text-lg md:text-xl">{selected.icon}</span>
          <div className="text-left">
            <span className="font-semibold text-foreground text-sm md:text-base">{selected.label}</span>
            <p className="text-[10px] md:text-xs text-muted-foreground">{selected.desc}</p>
          </div>
        </span>
        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 text-watermelon-green" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 md:mt-2 glass-card p-1.5 md:p-2 z-50 animate-fade-in rounded-xl md:rounded-2xl border border-watermelon-green/20 bg-background/95 backdrop-blur-md">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => {
                onChange(ratio.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-all duration-300
                ${ratio.value === value
                  ? "bg-gradient-to-r from-watermelon-green/20 to-watermelon-pink/20 border border-watermelon-green/30"
                  : "hover:bg-muted/50"
                }
              `}
            >
              <span className="text-xl md:text-2xl">{ratio.icon}</span>
              <div className="text-left flex-1">
                <span className={`font-semibold text-sm md:text-base ${ratio.value === value ? "text-watermelon-green-light" : "text-foreground"}`}>
                  {ratio.label}
                </span>
                <p className="text-[10px] md:text-xs text-muted-foreground">{ratio.desc}</p>
              </div>
              {ratio.value === value && (
                <div className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-watermelon-green/20">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-watermelon-green" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AspectRatioSelect;
