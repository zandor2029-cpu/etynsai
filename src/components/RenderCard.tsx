import { Download, ExternalLink, Image, Video, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";

interface RenderCardProps {
  id: string;
  type: "image" | "video";
  thumbnail: string;
  createdAt: string;
  onOpen: (id: string) => void;
  onDownload: (id: string) => void;
}

const RenderCard = ({ id, type, thumbnail, createdAt, onOpen, onDownload }: RenderCardProps) => {
  const TypeIcon = type === "image" ? Image : Video;
  const typeLabel = type === "image" ? "Imagem 4K" : "Vídeo Motion";

  return (
    <GlassCard hover className="overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        {type === "image" ? (
          <img
            src={thumbnail}
            alt="Render"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <video
            src={thumbnail}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 badge-watermelon text-xs">
          <TypeIcon className="w-3 h-3" />
          {typeLabel}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={() => onOpen(id)}
            className="p-3.5 rounded-xl bg-watermelon-green/90 hover:bg-watermelon-green text-white transition-all duration-300 hover:scale-110 shadow-glow-green"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDownload(id)}
            className="p-3.5 rounded-xl bg-watermelon-pink/90 hover:bg-watermelon-pink text-white transition-all duration-300 hover:scale-110 shadow-glow-pink"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* RGB Border on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, transparent)',
            boxShadow: 'inset 0 0 0 2px transparent',
          }}
        >
          <div 
            className="absolute inset-0 rounded-t-xl"
            style={{
              background: 'linear-gradient(90deg, hsl(145 100% 50% / 0.3), hsl(330 100% 65% / 0.3), hsl(350 90% 62% / 0.3))',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '2px',
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-watermelon-green" />
          <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground">{createdAt}</p>
      </div>
    </GlassCard>
  );
};

export default RenderCard;
