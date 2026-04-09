interface WatermelonLoaderProps {
  text?: string;
}

const WatermelonLoader = ({ text = "Carregando..." }: WatermelonLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full animate-pulse-glow" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-28 h-28 rounded-full opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsl(210 100% 60% / 0.3), hsl(190 100% 50% / 0.3))',
              animation: 'pulse-glow 2s ease-in-out infinite 0.5s',
            }}
          />
        </div>
        
        <div className="text-7xl animate-bounce-melon relative z-10 drop-shadow-2xl">
          ⚡
        </div>
        
        <div className="absolute -top-2 -right-2 text-2xl animate-float delay-100">✨</div>
        <div className="absolute -bottom-1 -left-2 text-xl animate-float delay-300">💫</div>
      </div>
      
      <div className="flex items-end gap-1.5 h-10">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-2 rounded-full"
            style={{
              height: '100%',
              background: `linear-gradient(180deg, 
                hsl(${210 + i * 10} 80% 50%) 0%, 
                hsl(${190 + i * 10} 90% 60%) 100%)`,
              animation: `wave 0.8s ease-in-out ${i * 0.08}s infinite`,
              boxShadow: `0 0 10px hsl(${210 + i * 10} 100% 50% / 0.5)`,
            }}
          />
        ))}
      </div>
      
      <p className="text-gradient-watermelon text-lg font-bold animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default WatermelonLoader;
