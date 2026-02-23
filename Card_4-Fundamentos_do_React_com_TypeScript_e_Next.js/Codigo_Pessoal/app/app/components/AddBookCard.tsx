"use client";

interface AddBookCardProps {
  onOpenForm: () => void;
}

export default function AddBookCard({ onOpenForm }: AddBookCardProps) {
  return (
    <button
      onClick={onOpenForm}
      className="rounded-lg max-w-[150px] w-full p-4 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-[#E5D9B6] bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
      style={{ minHeight: 250 }}
    >
      <span className="text-5xl text-[#E5D9B6] mb-3 block">+</span>
      <span className="text-sm font-semibold text-[#E5D9B6] block">
        Adicionar
      </span>
    </button>
  );
}
