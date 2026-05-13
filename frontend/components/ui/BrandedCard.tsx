import React from "react";

interface BrandedCardProps {
  variant?: "default" | "elevated" | "flat";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BrandedCard: React.FC<BrandedCardProps> = ({
  variant = "default",
  children,
  className = "",
  onClick,
}) => {
  const variantStyles = {
    default:
      "bg-white border border-gray-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200",
    elevated:
      "bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200",
    flat: "bg-off-white border border-gray-100 hover:bg-gray-50 transition-colors duration-200",
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg
        ${variantStyles[variant]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}>
      {children}
    </div>
  );
};
