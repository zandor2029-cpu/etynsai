import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      
      {displayPreview ? (
        <div className="relative glass-card p-4 rounded-xl">
          {accept === "image" ? (
            <img
              src={displayPreview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
            />
          ) : (
            <video
              src={displayPreview}
              className="w-full h-48 object-contain rounded-lg"
              controls
            />
          )}
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-2 bg-destructive/80 hover:bg-destructive rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
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
            relative cursor-pointer border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center gap-3
            transition-all duration-300
            ${isDragging 
              ? "border-primary bg-primary/10" 
              : "border-white/20 hover:border-primary/50 hover:bg-white/5"
            }
          `}
        >
          <div className={`p-4 rounded-full ${isDragging ? "bg-primary/20" : "bg-white/5"}`}>
            <Icon className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              {isDragging ? "Solte o arquivo aqui" : "Clique ou arraste"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {accept === "image" ? "PNG, JPG, WEBP" : "MP4, MOV, WEBM"}
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
