"use client";

import { useState, useEffect } from "react";
import BookCard from "./components/BookCard";
import BookForm from "./components/BookForm";
import AddBookCard from "./components/AddBookCard";

interface Book {
  id: number;
  title: string;
  rating: number;
  coverUrl?: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [futureBooks, setFutureBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFutureFormOpen, setIsFutureFormOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedBooks = localStorage.getItem("minha-biblioteca");
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      } else {
        setBooks([{ id: 1, title: "Clean Code", rating: 5 }]);
      }

      const savedFutureBooks = localStorage.getItem("livros-a-ler");
      if (savedFutureBooks) {
        setFutureBooks(JSON.parse(savedFutureBooks));
      }

      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("minha-biblioteca", JSON.stringify(books));
    }
  }, [books, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("livros-a-ler", JSON.stringify(futureBooks));
    }
  }, [futureBooks, isLoaded]);

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

  const handleAddFutureBook = (newBook: Book) => {
    setFutureBooks([...futureBooks, newBook]);
  };

  const handleDeleteFutureBook = (id: number) => {
    setFutureBooks(futureBooks.filter((book) => book.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    const bookToMove = futureBooks.find((book) => book.id === id);
    if (bookToMove) {
      setBooks([...books, { ...bookToMove, rating: 0 }]);
      handleDeleteFutureBook(id);
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="px-8 py-12 md:px-16">
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
              coverUrl={book.coverUrl}
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

      {/* Seção Livros a Ler */}
      <div className="mt-16">
        <h2 className="text-5xl font-bold text-[#E5D9B6] mb-3 drop-shadow-lg">
          Livros a Ler
        </h2>
        <p className="text-xl text-[#E5D9B6] drop-shadow-md opacity-95 mb-8">
          Sua lista de desejos
        </p>

        {futureBooks.length > 0 ? (
          <div className="flex flex-wrap gap-6 w-full">
            {futureBooks.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                rating={book.rating}
                coverUrl={book.coverUrl}
                onRatingChange={() => {}}
                onDelete={handleDeleteFutureBook}
                isFutureBook={true}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
            <AddBookCard onOpenForm={() => setIsFutureFormOpen(true)} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#E5D9B6] text-lg mb-6">
              Nenhum livro na sua lista de desejos. Clique no botão + para
              adicionar!
            </p>
            <AddBookCard onOpenForm={() => setIsFutureFormOpen(true)} />
          </div>
        )}
      </div>

      <BookForm
        isOpen={isFutureFormOpen}
        onClose={() => setIsFutureFormOpen(false)}
        onAddBook={handleAddFutureBook}
        title="Qual livro você quer ler?"
        placeholder="Ex: O Hobbit"
        isFutureBook={true}
      />
    </main>
  );
}
