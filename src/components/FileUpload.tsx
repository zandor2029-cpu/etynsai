import { Upload, X, Image as ImageIcon, Video, Sparkles } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadProps {
  label: string;
  accept: "image" | "video";
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
}

const FileUpload = ({ label, accept, onFileSelect, preview }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptString = accept === "image" ? "image/*" : "video/*";
  const Icon = accept === "image" ? ImageIcon : Video;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setLocalPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayPreview = preview || localPreview;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="w-4 h-4 text-watermelon-green" />
        {label}
      </label>
      
      {displayPreview ? (
        <div className="relative glass-card p-3 rounded-2xl group">
          {accept === "image" ? (
            <img
              src={displayPreview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-xl"
            />
          ) : (
            <video
              src={displayPreview}
              className="w-full h-48 object-contain rounded-xl"
              controls
            />
          )}
          <button
            onClick={clearFile}
            className="absolute top-1 right-1 p-2 bg-destructive hover:bg-destructive/80 rounded-xl transition-all hover:scale-110 shadow-lg"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          {/* Success indicator */}
          <div className="absolute bottom-1 left-1 badge-watermelon text-xs">
            <Sparkles className="w-3 h-3" />
            Pronto
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer rounded-2xl p-8
            flex flex-col items-center justify-center gap-4
            transition-all duration-500 group
            ${isDragging 
              ? "border-2 border-watermelon-green bg-watermelon-green/10 glow-green" 
              : "border-2 border-dashed border-border hover:border-watermelon-green/50 hover:bg-muted/30"
            }
          `}
        >
          <div className={`
            p-4 rounded-2xl transition-all duration-300
            ${isDragging 
              ? "bg-watermelon-green/20 scale-110" 
              : "bg-muted/50 group-hover:bg-gradient-to-br group-hover:from-watermelon-green/20 group-hover:to-watermelon-pink/20 group-hover:scale-105"
            }
          `}>
            <Icon className={`
              w-8 h-8 transition-colors duration-300
              ${isDragging ? "text-watermelon-green-neon" : "text-muted-foreground group-hover:text-watermelon-green"}
            `} />
          </div>
          <div className="text-center">
            <p className={`
              font-bold transition-colors duration-300
              ${isDragging ? "text-watermelon-green-light" : "text-foreground"}
            `}>
              {isDragging ? "Solte o arquivo aqui! 🎉" : "Clique ou arraste"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {accept === "image" ? "PNG, JPG, WEBP até 20MB" : "MP4, MOV, WEBM até 100MB"}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={acceptString}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
