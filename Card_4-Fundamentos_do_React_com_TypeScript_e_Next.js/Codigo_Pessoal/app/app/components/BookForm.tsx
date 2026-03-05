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
  label?: string; //
}

export default function BookForm({
  isOpen,
  onClose,
  onAddBook,
  title = "Adicionar Livro",
  placeholder = "Ex: Clean Code",
  label = "Nome do Livro",
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">{title}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-primary-dark mb-2">
              {label}
            </label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full px-4 py-2 border-2 border-primary rounded focus:outline-none focus:border-accent disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-[#528033] text-white font-semibold py-2 rounded transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
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
  );
}
