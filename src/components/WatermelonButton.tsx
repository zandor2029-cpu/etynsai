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

  const variantClasses = {
    primary: "btn-watermelon",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl transition-all duration-300 hover:-translate-y-0.5",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-block animate-spin-slow">🍉</span>
        )}
        {children}
      </span>
    </button>
  );
};

export default WatermelonButton;
