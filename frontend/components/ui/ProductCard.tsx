import React, { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { Badge } from "./Badge";
import { StarRating } from "./StarRating";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "./branded-button";

export interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: "new" | "sale" | "hot";
  isWishlisted?: boolean;
  isLoading?: boolean;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  onQuickView?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  price,
  originalPrice,
  rating = 4.5,
  reviewCount = 0,
  badge,
  isWishlisted = false,
  isLoading = false,
  onAddToCart,
  onWishlistToggle,
  onQuickView,
}) => {
  const [hovered, setHovered] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalWishlisted(!localWishlisted);
    onWishlistToggle?.();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.();
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-card-hover transition-all duration-300 h-full flex flex-col group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : (
          <>
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badge */}
            {badge && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant={badge}>
                  {badge === "new" ? "New" : badge === "sale" ? "Sale" : "Hot"}
                </Badge>
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:shadow-lg transition-all duration-200 z-20 hover:scale-110">
              <Heart
                size={20}
                className={`transition-colors duration-200 ${
                  localWishlisted
                    ? "fill-maroon text-maroon"
                    : "text-gray-400 hover:text-maroon"
                }`}
              />
            </button>

            {/* Quick View Overlay */}
            {hovered && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 animate-fade-in-up">
                <button
                  onClick={handleQuickView}
                  className="bg-white text-maroon px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <Eye size={18} />
                  Quick View
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Name */}
        <h3 className="font-display font-bold text-lg text-gray-800 mb-2 line-clamp-2 hover:text-maroon transition-colors">
          {name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <StarRating rating={rating} size="sm" interactive={false} />
            <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4 flex-1">
          <PriceDisplay price={price} originalPrice={originalPrice} />
        </div>

        {/* Add to Cart Button - Shows on hover or always on mobile */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={onAddToCart}
          isLoading={isLoading}
          className={`transition-all duration-300 ${
            hovered ? "opacity-100" : "opacity-0 md:opacity-100"
          }`}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
