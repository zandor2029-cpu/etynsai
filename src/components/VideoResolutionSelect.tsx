import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

interface VideoResolutionSelectProps {
  value: "480p" | "720p";
  onChange: (value: "480p" | "720p") => void;
}

const resolutions = [
  { 
    value: "480p" as const, 
    label: "480p", 
    icon: Smartphone, 
    desc: "Mais econômico (~$0.05)",
    savings: "Economia de ~40%"
  },
  { 
    value: "720p" as const, 
    label: "720p", 
    icon: Monitor, 
    desc: "Maior qualidade (~$0.08)",
    savings: ""
  },
];

export default function VideoResolutionSelect({ value, onChange }: VideoResolutionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = resolutions.find((r) => r.value === value) || resolutions[1];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 glass-card rounded-xl border border-white/10 hover:border-watermelon-pink/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-watermelon-pink/20 to-watermelon-red/20">
            <selected.icon className="w-4 h-4 text-watermelon-pink" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-foreground">{selected.label}</span>
            <p className="text-xs text-muted-foreground">{selected.desc}</p>
          </div>
        </div>
        {selected.savings && (
          <span className="text-xs font-medium text-watermelon-green bg-watermelon-green/10 px-2 py-1 rounded-full">
            {selected.savings}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden">
          {resolutions.map((res) => (
            <button
              key={res.value}
              type="button"
              onClick={() => {
                onChange(res.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                value === res.value ? "bg-watermelon-pink/10" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  value === res.value 
                    ? "bg-gradient-to-br from-watermelon-pink to-watermelon-red" 
                    : "bg-white/5"
                }`}>
                  <res.icon className={`w-4 h-4 ${value === res.value ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <span className={`font-semibold ${value === res.value ? "text-watermelon-pink" : "text-foreground"}`}>
                    {res.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{res.desc}</p>
                </div>
              </div>
              {res.savings && (
                <span className="text-xs font-medium text-watermelon-green bg-watermelon-green/10 px-2 py-1 rounded-full">
                  {res.savings}
                </span>
              )}
              {value === res.value && (
                <svg className="w-5 h-5 text-watermelon-pink" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
