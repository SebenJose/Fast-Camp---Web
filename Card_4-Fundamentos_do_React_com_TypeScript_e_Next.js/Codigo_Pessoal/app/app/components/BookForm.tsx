"use client";

import { useState } from "react";
import { Book } from "../types/book";
import { fetchBookCover } from "../services/googleBooks";
import toast from "react-hot-toast";

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Book) => void;
  title?: string;
  placeholder?: string;
  isFutureBook?: boolean;
}

export default function BookForm({
  isOpen,
  onClose,
  onAddBook,
  title = "Adicionar Livro",
  placeholder = "Ex: Clean Code",
  isFutureBook = false,
}: BookFormProps) {
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookTitle.trim()) {
      toast.error("Por favor, insira o nome do livro");
      return;
    }

    setIsLoading(true);

    const coverUrl = await fetchBookCover(bookTitle);

    if (!coverUrl) {
      toast.error("Não encontramos a capa, mas o livro foi adicionado!");
    } else {
      toast.success("Livro adicionado com sucesso!");
    }

    onAddBook({
      id: crypto.randomUUID(),
      title: bookTitle,
      rating: 0,
      coverUrl,
    });

    setBookTitle("");
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#40513B] mb-4">{title}</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#40513B] mb-2">
                  {isFutureBook ? "Qual livro você quer ler?" : "Nome do Livro"}
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border-2 border-[#628141] rounded focus:outline-none focus:border-[#E67E22] disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#628141] hover:bg-[#528033] text-white font-semibold py-2 rounded transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {/* Muda o texto dinamicamente */}
                  {isLoading ? "Buscando capa..." : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded transition-colors disabled:opacity-50"
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
