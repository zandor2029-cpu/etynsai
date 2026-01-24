import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

const GlassCard = ({ children, className = "", hover = false, style, onClick }: GlassCardProps) => {
  if (hover) {
    return (
      <motion.div 
        className={`glass-card ${className}`} 
        style={style}
        onClick={onClick}
        whileHover={{ 
          y: -4,
          scale: 1.01,
          transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
        }}
        whileTap={{ scale: 0.99 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`glass-card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export default GlassCard;
