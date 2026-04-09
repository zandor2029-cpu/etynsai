interface EtynsIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

const EtynsIcon = ({ className = "", size = 48, animated = true }: EtynsIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? "animate-float" : ""} ${className}`}
    >
      <defs>
        <filter id="etyns-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="etyns-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 100%, 60%)" />
          <stop offset="50%" stopColor="hsl(190, 100%, 50%)" />
          <stop offset="100%" stopColor="hsl(260, 100%, 65%)" />
        </linearGradient>
        <linearGradient id="etyns-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 100%, 70%)" />
          <stop offset="100%" stopColor="hsl(190, 100%, 60%)" />
        </linearGradient>
        <linearGradient id="etyns-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Outer glow */}
      <circle 
        cx="32" 
        cy="32" 
        r="24" 
        fill="hsl(210, 100%, 60%)" 
        opacity="0.25" 
        filter="url(#etyns-glow)"
      />
      
      {/* Hexagon body */}
      <path
        d="M32 6L54 18V42L32 54L10 42V18L32 6Z"
        fill="url(#etyns-gradient)"
        stroke="hsl(210, 100%, 70%)"
        strokeWidth="1"
        filter="url(#etyns-glow)"
      />
      
      {/* Inner hexagon */}
      <path
        d="M32 12L48 22V38L32 48L16 38V22L32 12Z"
        fill="hsl(220, 20%, 8%)"
        opacity="0.7"
      />
      
      {/* Lightning bolt */}
      <path
        d="M36 16L24 32H32L28 48L40 30H32L36 16Z"
        fill="url(#etyns-inner)"
        filter="url(#etyns-glow)"
      />
      
      {/* Highlight shine */}
      <path
        d="M20 18C24 12 30 8 36 8C34 10 28 14 24 20C20 26 18 32 18 36C16 32 16 24 20 18Z"
        fill="url(#etyns-highlight)"
      />
      
      {/* Sparkles */}
      <g className="animate-pulse">
        <circle cx="50" cy="14" r="1.5" fill="hsl(190, 100%, 60%)" />
        <circle cx="54" cy="20" r="1" fill="hsl(210, 100%, 70%)" />
        <circle cx="48" cy="22" r="0.8" fill="hsl(260, 100%, 72%)" />
      </g>
    </svg>
  );
};

export default EtynsIcon;
