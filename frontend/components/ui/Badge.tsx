import React from "react";

interface BadgeProps {
  variant?: "new" | "sale" | "hot" | "outOfStock" | "verified" | "pending";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "new",
  children,
  className = "",
}) => {
  const variantStyles = {
    new: "bg-maroon text-white",
    sale: "bg-gold text-gray-800 font-bold",
    hot: "bg-error text-white",
    outOfStock: "bg-gray-300 text-gray-700",
    verified: "bg-success text-white",
    pending: "bg-warning text-white",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-3 py-1 rounded-full text-xs font-bold
        ${variantStyles[variant]}
        ${className}
      `}>
      {children}
    </span>
  );
};
