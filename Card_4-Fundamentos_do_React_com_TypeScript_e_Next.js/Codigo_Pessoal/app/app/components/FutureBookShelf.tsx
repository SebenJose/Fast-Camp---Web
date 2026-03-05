"use client";

import { useState } from "react";
import FutureBookCard from "@/components/FutureBookCard";
import BookForm from "@/components/BookForm";
import AddBookCard from "@/components/AddBookCard";
import { useFutureBooks } from "@/hooks/useFutureBooks";
import { useBooks } from "@/hooks/useBooks";

export default function FutureBookShelf() {
  const { futureBooks, handleAddFutureBook, handleDeleteFutureBook } =
    useFutureBooks();
  const { handleAddBook } = useBooks();
  const [isFutureFormOpen, setIsFutureFormOpen] = useState(false);

  const handleMarkAsRead = (id: number | string) => {
    const bookToMove = futureBooks.find((book) => book.id === id);
    if (bookToMove) {
      handleAddBook({ ...bookToMove, rating: 0 });
      handleDeleteFutureBook(id);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-5xl font-bold text-cream mb-3 drop-shadow-lg">
        Livros a Ler
      </h2>
      <p className="text-xl text-cream drop-shadow-md opacity-95 mb-8">
        Sua lista de desejos
      </p>

      {futureBooks.length > 0 ? (
        <div className="flex flex-wrap gap-6 w-full">
          {futureBooks.map((book) => (
            <FutureBookCard
              key={book.id}
              id={book.id}
              title={book.title}
              coverUrl={book.coverUrl}
              onDelete={handleDeleteFutureBook}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          <AddBookCard onOpenForm={() => setIsFutureFormOpen(true)} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-cream text-lg mb-6">
            Nenhum livro na sua lista de desejos. Clique no botão + para
            adicionar!
          </p>
          <AddBookCard onOpenForm={() => setIsFutureFormOpen(true)} />
        </div>
      )}

      <BookForm
        isOpen={isFutureFormOpen}
        onClose={() => setIsFutureFormOpen(false)}
        onAddBook={handleAddFutureBook}
        title="Qual livro você quer ler?"
        placeholder="Ex: O Hobbit"
        label="Nome do livro que deseja ler"
      />
    </div>
  );
}
