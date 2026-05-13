import React from "react";

interface SkeletonProps {
  variant?: "text" | "image" | "card" | "productCard" | "tableRow";
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  count = 1,
  className = "",
}) => {
  const variantStyles = {
    text: "h-4 w-full rounded",
    image: "h-48 w-full rounded-lg",
    card: "h-64 w-full rounded-lg",
    productCard: "aspect-[3/4] w-full rounded-lg",
    tableRow: "h-12 w-full rounded",
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
        animate-shimmer bg-[length:1000px_100%]
        ${variantStyles[variant]}
        ${className}
        ${count > 1 ? "mb-4" : ""}
      `}
    />
  ));

  return <>{skeletons}</>;
};
