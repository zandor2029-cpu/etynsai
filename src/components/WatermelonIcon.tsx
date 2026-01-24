interface WatermelonIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

const WatermelonIcon = ({ className = "", size = 48, animated = true }: WatermelonIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? "animate-float" : ""} ${className}`}
    >
      {/* Glow filter */}
      <defs>
        <filter id="watermelon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="rind-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(145, 80%, 45%)" />
          <stop offset="50%" stopColor="hsl(145, 85%, 35%)" />
          <stop offset="100%" stopColor="hsl(145, 90%, 25%)" />
        </linearGradient>
        <linearGradient id="flesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(350, 90%, 65%)" />
          <stop offset="50%" stopColor="hsl(350, 85%, 55%)" />
          <stop offset="100%" stopColor="hsl(340, 80%, 50%)" />
        </linearGradient>
        <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Outer glow */}
      <ellipse 
        cx="32" 
        cy="36" 
        rx="26" 
        ry="22" 
        fill="hsl(350, 90%, 60%)" 
        opacity="0.3" 
        filter="url(#watermelon-glow)"
      />
      
      {/* Green rind (outer) */}
      <path
        d="M6 36C6 22 17 10 32 10C47 10 58 22 58 36C58 50 47 54 32 54C17 54 6 50 6 36Z"
        fill="url(#rind-gradient)"
        stroke="hsl(145, 90%, 30%)"
        strokeWidth="1"
      />
      
      {/* Light green inner rind */}
      <path
        d="M10 36C10 24 19 14 32 14C45 14 54 24 54 36C54 48 45 50 32 50C19 50 10 48 10 36Z"
        fill="hsl(145, 70%, 55%)"
      />
      
      {/* Red flesh */}
      <path
        d="M14 36C14 26 21 18 32 18C43 18 50 26 50 36C50 46 43 46 32 46C21 46 14 46 14 36Z"
        fill="url(#flesh-gradient)"
      />
      
      {/* Seeds */}
      <ellipse cx="24" cy="32" rx="2" ry="3" fill="hsl(30, 20%, 10%)" transform="rotate(-20 24 32)" />
      <ellipse cx="32" cy="28" rx="2" ry="3" fill="hsl(30, 20%, 10%)" transform="rotate(10 32 28)" />
      <ellipse cx="40" cy="32" rx="2" ry="3" fill="hsl(30, 20%, 10%)" transform="rotate(25 40 32)" />
      <ellipse cx="28" cy="38" rx="1.5" ry="2.5" fill="hsl(30, 20%, 10%)" transform="rotate(-10 28 38)" />
      <ellipse cx="36" cy="38" rx="1.5" ry="2.5" fill="hsl(30, 20%, 10%)" transform="rotate(15 36 38)" />
      
      {/* Highlight shine */}
      <path
        d="M18 28C18 22 24 16 32 16C35 16 38 17 40 18C36 16 30 18 26 24C22 30 22 34 22 36C20 34 18 32 18 28Z"
        fill="url(#highlight-gradient)"
      />
      
      {/* Small sparkles */}
      <g className="animate-pulse">
        <circle cx="50" cy="16" r="1.5" fill="hsl(45, 100%, 70%)" />
        <circle cx="54" cy="20" r="1" fill="hsl(45, 100%, 70%)" />
        <circle cx="48" cy="22" r="0.8" fill="hsl(45, 100%, 70%)" />
      </g>
    </svg>
  );
};

export default WatermelonIcon;
