"use client";

import { useState } from "react";

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: { id: number; title: string; rating: number }) => void;
}

export default function BookForm({
  isOpen,
  onClose,
  onAddBook,
}: BookFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Por favor, insira o nome do livro");
      return;
    }

    onAddBook({
      id: Date.now(),
      title,
      rating: 0,
    });

    setTitle("");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#40513B] mb-4">
              Adicionar Livro
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Input Nome do Livro */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#40513B] mb-2">
                  Nome do Livro
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Clean Code"
                  className="w-full px-4 py-2 border-2 border-[#628141] rounded focus:outline-none focus:border-[#E67E22]"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#628141] hover:bg-[#528033] text-white font-semibold py-2 rounded transition-colors"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
