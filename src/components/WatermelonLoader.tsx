interface WatermelonLoaderProps {
  text?: string;
}

const WatermelonLoader = ({ text = "Carregando..." }: WatermelonLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Watermelon */}
      <div className="relative">
        <div className="text-6xl animate-spin-slow">🍉</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-glow" />
        </div>
      </div>
      
      {/* Wave Loading Bars */}
      <div className="flex items-end gap-1 h-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full"
            style={{
              height: "100%",
              animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      
      {/* Loading Text */}
      <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default WatermelonLoader;
