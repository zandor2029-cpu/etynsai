import { Palette, Camera, Box, Sparkles, Paintbrush } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ImageStyle = 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo';

interface ImageStyleOption {
  value: ImageStyle;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const styleOptions: ImageStyleOption[] = [
  {
    value: 'flux',
    label: 'Padrão',
    description: 'Qualidade balanceada',
    icon: <Sparkles className="w-4 h-4 text-watermelon-green" />,
  },
  {
    value: 'flux-realism',
    label: 'Realismo',
    description: 'Fotos realistas',
    icon: <Camera className="w-4 h-4 text-blue-400" />,
  },
  {
    value: 'flux-anime',
    label: 'Anime',
    description: 'Estilo japonês',
    icon: <Paintbrush className="w-4 h-4 text-pink-400" />,
  },
  {
    value: 'flux-3d',
    label: '3D',
    description: 'Render 3D',
    icon: <Box className="w-4 h-4 text-purple-400" />,
  },
  {
    value: 'turbo',
    label: 'Turbo',
    description: 'Mais rápido',
    icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
  },
];

interface ImageStyleSelectProps {
  value: ImageStyle;
  onChange: (value: ImageStyle) => void;
  disabled?: boolean;
}

export default function ImageStyleSelect({ value, onChange, disabled }: ImageStyleSelectProps) {
  const selectedOption = styleOptions.find((opt) => opt.value === value);

  return (
    <div className="space-y-2 md:space-y-3">
      <label className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-semibold text-muted-foreground tracking-wide">
        <Palette className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span>Estilo</span>
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as ImageStyle)} disabled={disabled}>
        <SelectTrigger className="input-glass h-[46px] md:h-[58px] bg-background/80 backdrop-blur-sm border-white/10">
          <SelectValue>
            {selectedOption && (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-watermelon-green/20 to-watermelon-pink/20">
                  {selectedOption.icon}
                </div>
                <div className="text-left">
                  <span className="font-semibold text-sm md:text-base">{selectedOption.label}</span>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                    {selectedOption.description}
                  </p>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 z-50">
          {styleOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer hover:bg-white/5 focus:bg-white/10"
            >
              <div className="flex items-center gap-3 py-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-watermelon-green/20 to-watermelon-pink/20">
                  {option.icon}
                </div>
                <div>
                  <span className="font-semibold">{option.label}</span>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
