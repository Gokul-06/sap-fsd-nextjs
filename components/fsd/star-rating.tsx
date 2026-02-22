"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  currentRating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  currentRating,
  onRate,
  disabled = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled =
          hoverRating > 0 ? star <= hoverRating : star <= (currentRating || 0);

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`transition-colors ${
              disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => !disabled && onRate(star)}
            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${iconSize} transition-colors ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300"
              }`}
            />
          </button>
        );
      })}
      {currentRating && (
        <span className="ml-1 text-xs text-muted-foreground">
          {currentRating}/5
        </span>
      )}
    </div>
  );
}
