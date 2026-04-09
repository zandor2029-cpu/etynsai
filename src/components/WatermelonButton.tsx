import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WatermelonButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
}

const WatermelonButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: WatermelonButtonProps) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "btn-watermelon";
      case "secondary":
        return "btn-secondary";
      case "outline":
        return `
          relative overflow-hidden px-6 py-3 rounded-xl font-bold
          border-2 border-etyns-blue text-etyns-blue-light
          hover:bg-etyns-blue/10 hover:border-etyns-blue-light
          transition-colors duration-300
        `;
      default:
        return "btn-watermelon";
    }
  };

  const glowVariants = {
    rest: {
      boxShadow: variant === "primary" 
        ? "0 4px 12px hsl(210 100% 55% / 0.3)"
        : variant === "secondary"
        ? "0 4px 12px hsl(260 100% 65% / 0.3)"
        : "0 0 0 transparent",
      scale: 1,
    },
    hover: {
      boxShadow: variant === "primary"
        ? "0 8px 30px hsl(210 100% 60% / 0.5), 0 0 50px hsl(210 100% 60% / 0.3), 0 0 80px hsl(210 100% 60% / 0.15)"
        : variant === "secondary"
        ? "0 8px 30px hsl(260 100% 65% / 0.5), 0 0 50px hsl(260 100% 65% / 0.3), 0 0 80px hsl(260 100% 65% / 0.15)"
        : "0 4px 25px hsl(210 100% 60% / 0.4)",
      scale: 1.02,
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${sizeClasses[size]}
        font-bold
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      initial="rest"
      whileHover={!disabled ? "hover" : "rest"}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      variants={glowVariants}
      animate="rest"
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ transform: disabled ? "none" : undefined }}
    >
      <motion.span 
        className="flex items-center justify-center gap-2.5"
        whileHover={!disabled ? { y: -1 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {loading && (
          <motion.span 
            className="inline-block text-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.span>
        )}
        {children}
      </motion.span>
    </motion.button>
  );
};

export default WatermelonButton;
