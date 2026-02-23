"use client";

import StarRating from "./StarRating";

interface BookCardProps {
  id: number;
  title: string;
  rating: number;
  onRatingChange: (id: number, rating: number) => void;
  onDelete: (id: number) => void;
}

export default function BookCard({
  id,
  title,
  rating,
  onRatingChange,
  onDelete,
}: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow max-w-[180px] w-full">
      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#40513B] mb-3 truncate">
          {title}
        </h3>

        {/* Estrelas */}
        <div className="mb-4 flex justify-center">
          <StarRating
            initialRating={rating}
            onRatingChange={(newRating) => onRatingChange(id, newRating)}
          />
        </div>

        {/* Nota */}
        <p className="text-sm text-gray-600 mb-3">
          {rating > 0 ? `Nota: ${rating}/5` : "Sem nota"}
        </p>

        {/* Botão Delete */}
       <button
  onClick={() => onDelete(id)}
  className="w-full border border-red-400 text-red-500 hover:bg-red-50 font-semibold py-1.5 rounded transition-colors text-sm"
>
  Remover
</button>
      </div>
    </div>
  );
}
