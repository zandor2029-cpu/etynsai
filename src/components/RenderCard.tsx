import { motion } from "framer-motion";
import { Download, ExternalLink, Image, Video, Sparkles, Trash2 } from "lucide-react";
import GlassCard from "./GlassCard";

interface RenderCardProps {
  id: string;
  type: "image" | "video";
  thumbnail: string;
  createdAt: string;
  prompt?: string;
  onOpen: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete?: (id: string) => void;
}

const RenderCard = ({ id, type, thumbnail, createdAt, prompt, onOpen, onDownload, onDelete }: RenderCardProps) => {
  const TypeIcon = type === "image" ? Image : Video;
  const typeLabel = type === "image" ? "Imagem" : "Vídeo";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <GlassCard className="overflow-hidden group cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden">
          {type === "image" ? (
            <motion.img
              src={thumbnail}
              alt="Render"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            />
          ) : (
            <video
              src={thumbnail}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Action Buttons */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(id);
              }}
              className="p-3 rounded-xl bg-primary/90 text-white shadow-glow-blue"
              title="Abrir"
              whileHover={{ scale: 1.15, backgroundColor: "hsl(210 100% 55%)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(id);
              }}
              className="p-3 rounded-xl bg-etyns-purple/90 text-white shadow-glow-purple"
              title="Baixar"
              whileHover={{ scale: 1.15, backgroundColor: "hsl(260 100% 65%)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>
            {onDelete && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="p-3 rounded-xl bg-destructive/90 text-white"
                title="Deletar"
                whileHover={{ scale: 1.15, backgroundColor: "hsl(0 90% 55%)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>

          {/* RGB Border Glow on Hover */}
          <motion.div 
            className="absolute inset-0 pointer-events-none rounded-t-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              boxShadow: "inset 0 0 20px hsl(210 100% 60% / 0.2), inset 0 0 40px hsl(190 100% 50% / 0.15)",
            }}
          />
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="w-4 h-4 text-etyns-blue" />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </div>
          {prompt && (
            <p className="text-xs text-muted-foreground line-clamp-2" title={prompt}>
              {prompt}
            </p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default RenderCard;
