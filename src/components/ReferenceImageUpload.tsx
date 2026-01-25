import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Image, Upload, AlertCircle } from "lucide-react";
import { uploadFileForGeneration } from "@/hooks/useFileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReferenceImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ReferenceImageUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 2,
  disabled = false 
}: ReferenceImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Limite atingido",
        description: `Você pode adicionar no máximo ${maxImages} imagens de referência.`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas imagens (JPG, PNG, WebP).",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Cada imagem deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const result = await uploadFileForGeneration(file, user.id);
        if (result.success && result.url) {
          newUrls.push(result.url);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }

      onImagesChange([...images, ...newUrls]);
      toast({
        title: "Imagem(s) adicionada(s)! 🖼️",
        description: `${newUrls.length} imagem(s) de referência pronta(s) para uso.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages && !disabled && !isUploading;

  return (
    <div className="space-y-2 md:space-y-3">
      <label className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm font-semibold text-foreground tracking-wide flex-wrap">
        <ImagePlus className="w-3.5 h-3.5 md:w-4 md:h-4 text-watermelon-pink flex-shrink-0" />
        <span>Imagens de Referência</span>
        <span className="text-[10px] md:text-xs font-normal text-muted-foreground opacity-70">(opcional, até {maxImages})</span>
      </label>

      {/* Image previews */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-2 md:gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {images.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden border-2 border-watermelon-pink/30 bg-background/50">
                  <img
                    src={url}
                    alt={`Referência ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  disabled={disabled || isUploading}
                  className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 p-1 md:p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive/90"
                >
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
                <div className="absolute bottom-0.5 left-0.5 md:bottom-1 md:left-1 px-1 md:px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold bg-background/80 text-foreground">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload area */}
      {canAddMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
            relative border-2 border-dashed rounded-lg md:rounded-xl p-3 md:p-4 transition-all cursor-pointer
            ${dragActive 
              ? 'border-watermelon-pink bg-watermelon-pink/10' 
              : 'border-muted-foreground/30 hover:border-watermelon-pink/50 hover:bg-muted/30'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="flex flex-col items-center gap-1.5 md:gap-2 text-center">
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-5 h-5 md:w-6 md:h-6 text-watermelon-pink" />
                </motion.div>
                <span className="text-xs md:text-sm text-muted-foreground">Fazendo upload...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Image className="w-4 h-4 md:w-5 md:h-5 text-watermelon-pink" />
                  <Upload className="w-4 h-4 md:w-5 md:h-5 text-watermelon-green" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {dragActive ? "Solte aqui!" : "Arraste ou toque para adicionar"}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground/70">
                  JPG, PNG ou WebP • Máx 10MB
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Helper text */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-1.5 md:gap-2 p-2 md:p-3 rounded-lg bg-watermelon-green/10 border border-watermelon-green/20"
        >
          <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-watermelon-green mt-0.5 flex-shrink-0" />
          <div className="text-[10px] md:text-xs text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> Descreva no prompt como combinar as imagens. 
            Ex: "Pegue a pessoa da imagem 1 e coloque no cenário da imagem 2".
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReferenceImageUpload;
