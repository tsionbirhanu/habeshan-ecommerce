import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  interactive = false,
  onChange,
  size = "md",
  showCount = false,
  count = 0,
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0);

  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const displayRating = hoveredRating || rating;
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxRating }).map((_, i) => (
          <button
            key={i}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHoveredRating(i + 1)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            disabled={!interactive}
            className={`transition-all duration-200 ${
              interactive ? "cursor-pointer" : "cursor-default"
            }`}>
            <Star
              size={iconSize}
              className={`transition-colors ${
                i < displayRating
                  ? "fill-gold text-gold"
                  : "text-gray-300 fill-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
};
