"use client";

import { useState } from "react";

interface StarRatingProps {
  initialRating: number;
  onRatingChange: (rating: number) => void;
}

export default function StarRating({
  initialRating,
  onRatingChange,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (star: number) => {
    setRating(star);
    onRatingChange(star);
  };

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-transform hover:scale-110"
        >
          <span
            className={`text-3xl ${
              star <= (hoverRating || rating)
                ? "text-[#E67E22]"
                : "text-gray-400"
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
