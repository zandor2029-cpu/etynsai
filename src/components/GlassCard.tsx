import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

const GlassCard = ({ children, className = "", hover = false, style }: GlassCardProps) => {
  return (
    <div className={`${hover ? "glass-card-hover" : "glass-card"} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
