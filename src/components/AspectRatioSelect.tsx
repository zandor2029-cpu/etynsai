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
    <div className="relative space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Ratio className="w-4 h-4" />
        Aspect Ratio
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-glass flex items-center justify-between cursor-pointer group"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{selected.icon}</span>
          <div className="text-left">
            <span className="font-semibold text-foreground">{selected.label}</span>
            <p className="text-xs text-muted-foreground">{selected.desc}</p>
          </div>
        </span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 text-watermelon-green" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 animate-fade-in rounded-2xl border border-watermelon-green/20">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => {
                onChange(ratio.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300
                ${ratio.value === value
                  ? "bg-gradient-to-r from-watermelon-green/20 to-watermelon-pink/20 border border-watermelon-green/30"
                  : "hover:bg-muted/50"
                }
              `}
            >
              <span className="text-2xl">{ratio.icon}</span>
              <div className="text-left flex-1">
                <span className={`font-semibold ${ratio.value === value ? "text-watermelon-green-light" : "text-foreground"}`}>
                  {ratio.label}
                </span>
                <p className="text-xs text-muted-foreground">{ratio.desc}</p>
              </div>
              {ratio.value === value && (
                <div className="p-1.5 rounded-lg bg-watermelon-green/20">
                  <Check className="w-4 h-4 text-watermelon-green" />
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
