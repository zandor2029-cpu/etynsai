interface BananaIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

const BananaIcon = ({ className = "", size = 24, animated = true }: BananaIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? "animate-bounce-melon" : ""} ${className}`}
    >
      <defs>
        {/* RGB Animated Gradient */}
        <linearGradient id="banana-rgb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(55, 100%, 55%)">
            <animate attributeName="stop-color" 
              values="hsl(55, 100%, 55%); hsl(45, 100%, 50%); hsl(35, 100%, 60%); hsl(55, 100%, 55%)" 
              dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="hsl(50, 95%, 50%)">
            <animate attributeName="stop-color" 
              values="hsl(50, 95%, 50%); hsl(55, 100%, 55%); hsl(45, 100%, 50%); hsl(50, 95%, 50%)" 
              dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="hsl(45, 90%, 45%)">
            <animate attributeName="stop-color" 
              values="hsl(45, 90%, 45%); hsl(35, 100%, 60%); hsl(55, 100%, 55%); hsl(45, 90%, 45%)" 
              dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        
        {/* RGB Glow Filter */}
        <filter id="banana-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Highlight */}
        <linearGradient id="banana-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        
        {/* Brown tip gradient */}
        <linearGradient id="banana-tip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(30, 60%, 35%)" />
          <stop offset="100%" stopColor="hsl(25, 70%, 25%)" />
        </linearGradient>
      </defs>
      
      {/* Outer glow */}
      <ellipse 
        cx="32" 
        cy="32" 
        rx="20" 
        ry="12" 
        fill="hsl(50, 100%, 50%)" 
        opacity="0.3" 
        filter="url(#banana-glow)"
        transform="rotate(-30 32 32)"
      />
      
      {/* Main banana body */}
      <path
        d="M12 42C8 38 6 30 10 22C14 14 24 8 36 10C48 12 56 20 54 30C52 40 44 48 32 50C24 51 16 48 12 42Z"
        fill="url(#banana-rgb-gradient)"
        stroke="hsl(45, 80%, 40%)"
        strokeWidth="1"
        filter="url(#banana-glow)"
      />
      
      {/* Inner curve line */}
      <path
        d="M16 38C14 34 14 28 18 22C22 16 30 12 40 14"
        stroke="hsl(45, 70%, 40%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      
      {/* Top tip */}
      <ellipse
        cx="38"
        cy="11"
        rx="4"
        ry="3"
        fill="url(#banana-tip)"
        transform="rotate(-20 38 11)"
      />
      
      {/* Bottom tip */}
      <ellipse
        cx="13"
        cy="43"
        rx="3"
        ry="2"
        fill="url(#banana-tip)"
        transform="rotate(30 13 43)"
      />
      
      {/* Highlight shine */}
      <path
        d="M20 20C24 14 34 10 44 14C40 12 30 14 24 20C18 26 16 34 18 38C16 34 16 26 20 20Z"
        fill="url(#banana-highlight)"
      />
      
      {/* RGB Sparkles */}
      <g>
        <circle cx="50" cy="18" r="2" fill="hsl(145, 100%, 50%)">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;1.5;2" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="54" cy="24" r="1.5" fill="hsl(330, 100%, 65%)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="48" cy="26" r="1" fill="hsl(55, 100%, 60%)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
};

export default BananaIcon;
