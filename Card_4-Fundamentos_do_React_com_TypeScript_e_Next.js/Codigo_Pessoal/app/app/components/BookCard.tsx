"use client";

import StarRating from "./StarRating";

interface BookCardProps {
  id: number;
  title: string;
  rating: number;
  coverUrl?: string;
  onRatingChange: (id: number, rating: number) => void;
  onDelete: (id: number) => void;
  isFutureBook?: boolean;
  onMarkAsRead?: (id: number) => void;
}

export default function BookCard({
  id,
  title,
  rating,
  coverUrl,
  onRatingChange,
  onDelete,
  isFutureBook = false,
  onMarkAsRead,
}: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:-translate-y-1 transition-all duration-300 max-w-[150px] w-full flex flex-col">
      {coverUrl ? (
        <div className="w-full h-48 bg-gray-100 shrink-0 border-b border-gray-100">
          <img
            src={coverUrl}
            alt={`Capa de ${title}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-[#E5D9B6]/40 flex items-center justify-center shrink-0 border-b border-[#E5D9B6]">
          <span className="text-[#628141] text-xs font-medium px-4 text-center">
            Capa indisponível
          </span>
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <h3
          className="text-base font-bold text-[#40513B] mb-2 truncate"
          title={title}
        >
          {title}
        </h3>

        {isFutureBook ? (
          <>
            <p className="text-xs text-gray-500 mb-2 text-center">
              Próximo a ler
            </p>
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={() => onMarkAsRead?.(id)}
                className="w-full border border-[#628141] text-[#628141] hover:bg-[#f0f8e8] font-semibold py-1 rounded transition-colors text-xs"
              >
                Já li
              </button>
              <button
                onClick={() => onDelete(id)}
                className="w-full border border-red-400 text-red-500 hover:bg-red-50 font-semibold py-1 rounded transition-colors text-xs"
              >
                Remover
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex justify-center scale-90 origin-center">
              <StarRating
                initialRating={rating}
                onRatingChange={(newRating) => onRatingChange(id, newRating)}
              />
            </div>
            <p className="text-xs text-gray-600 mb-2 text-center">
              {rating > 0 ? `Nota: ${rating}/5` : "Sem nota"}
            </p>
            <div className="mt-auto">
              <button
                onClick={() => onDelete(id)}
                className="w-full border border-red-400 text-red-500 hover:bg-red-50 font-semibold py-1 rounded transition-colors text-xs"
              >
                Remover
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
