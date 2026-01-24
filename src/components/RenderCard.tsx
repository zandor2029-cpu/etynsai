import { Download, ExternalLink, Image, Video } from "lucide-react";
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <video
            src={thumbnail}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onOpen(id)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => onDownload(id)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{typeLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground">{createdAt}</p>
      </div>
    </GlassCard>
  );
};

export default RenderCard;
