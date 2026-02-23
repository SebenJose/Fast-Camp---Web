"use client";

import { useState, useEffect } from "react";
import BookCard from "./components/BookCard";
import BookForm from "./components/BookForm";
import AddBookCard from "./components/AddBookCard";

interface Book {
  id: number;
  title: string;
  rating: number;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Carregar os dados (com um micro-atraso para evitar o erro do React 19)
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedBooks = localStorage.getItem("minha-biblioteca");
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      } else {
        setBooks([{ id: 1, title: "Clean Code", rating: 5 }]);
      }
      setIsLoaded(true);
    }, 0); // Esse 0 joga a execução para o próximo tick do event loop

    return () => clearTimeout(timer);
  }, []);

  // 2. Salvar os dados toda vez que 'books' mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("minha-biblioteca", JSON.stringify(books));
    }
  }, [books, isLoaded]);

  const handleAddBook = (newBook: Book) => {
    setBooks([...books, newBook]);
  };

  const handleRatingChange = (id: number, rating: number) => {
    setBooks(
      books.map((book) => (book.id === id ? { ...book, rating } : book)),
    );
  };

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  if (!isLoaded) return null;

  return (
    <main className="px-8 py-12 md:px-16 min-h-screen bg-linear-to-br from-[#628141] to-[#40513B]">
      <h1 className="text-5xl font-bold text-[#E5D9B6] mb-3 drop-shadow-lg">
        Sua Biblioteca
      </h1>
      <p className="text-xl text-[#E5D9B6] drop-shadow-md opacity-95 mb-8">
        Aqui você pode adicionar os livros que já leu.
      </p>

      {books.length > 0 ? (
        <div className="flex flex-wrap gap-6 w-full">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              rating={book.rating}
              onRatingChange={handleRatingChange}
              onDelete={handleDeleteBook}
            />
          ))}
          <AddBookCard onOpenForm={() => setIsFormOpen(true)} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#E5D9B6] text-lg mb-6">
            Nenhum livro adicionado ainda. Clique no botão + para começar!
          </p>
          <AddBookCard onOpenForm={() => setIsFormOpen(true)} />
        </div>
      )}

      <BookForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddBook={handleAddBook}
      />
    </main>
  );
}
