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
          border-2 border-watermelon-green text-watermelon-green-light
          hover:bg-watermelon-green/10 hover:border-watermelon-green-light
          hover:shadow-glow-green transition-all duration-300
        `;
      default:
        return "btn-watermelon";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${sizeClasses[size]}
        font-bold
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2.5">
        {loading && (
          <span className="inline-block animate-spin-slow text-xl">🍉</span>
        )}
        {children}
      </span>
    </button>
  );
};

export default WatermelonButton;
