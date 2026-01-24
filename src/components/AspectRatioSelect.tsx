import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const aspectRatios = [
  { value: "1:1", label: "1:1 (Quadrado)", icon: "⬜" },
  { value: "16:9", label: "16:9 (Paisagem)", icon: "🖼️" },
  { value: "9:16", label: "9:16 (Vertical)", icon: "📱" },
];

const AspectRatioSelect = ({ value, onChange }: AspectRatioSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = aspectRatios.find((r) => r.value === value) || aspectRatios[0];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Aspect Ratio
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-glass flex items-center justify-between cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span>{selected.icon}</span>
          <span>{selected.label}</span>
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 animate-fade-in">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => {
                onChange(ratio.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                ratio.value === value
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-white/5 text-foreground"
              }`}
            >
              <span className="text-xl">{ratio.icon}</span>
              <span className="font-medium">{ratio.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AspectRatioSelect;
