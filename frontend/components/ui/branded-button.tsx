import React from "react";
import { Loader2 } from "lucide-react";

interface BrandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<
  HTMLBrandedButtonElement,
  BrandedButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    };

    const variantStyles = {
      primary:
        "bg-maroon text-white hover:bg-maroon-light shadow-md hover:shadow-lg",
      secondary:
        "bg-white text-maroon border-2 border-maroon hover:bg-maroon/5",
      ghost: "bg-transparent text-gray-600 hover:text-maroon hover:bg-maroon/5",
      danger: "bg-error text-white hover:bg-red-700 shadow-md hover:shadow-lg",
      gold: "bg-gold text-gray-800 hover:bg-gold-light shadow-md hover:shadow-lg font-bold",
    };

    return (
      <button
        ref={ref as any}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

type HTMLBrandedButtonElement = HTMLButtonElement;
