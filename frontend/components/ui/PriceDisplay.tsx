import React from "react";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  showVAT?: boolean;
  size?: "sm" | "md" | "lg";
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  showVAT = false,
  size = "md",
}) => {
  const sizeStyles = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className={`font-bold text-maroon ${sizeStyles[size]} font-body`}>
          {formatPrice(price)}
        </span>

        {originalPrice && originalPrice > price && (
          <>
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
            {discount > 0 && (
              <span className="text-sm font-bold text-error">-{discount}%</span>
            )}
          </>
        )}
      </div>

      {showVAT && <p className="text-xs text-gray-500">inkl. MwSt.</p>}
    </div>
  );
};
