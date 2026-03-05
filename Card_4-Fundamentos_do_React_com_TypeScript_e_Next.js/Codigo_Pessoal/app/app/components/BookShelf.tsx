"use client";

import { useState } from "react";
import BookCard from "@/components/BookCard";
import BookForm from "@/components/BookForm";
import AddBookCard from "@/components/AddBookCard";
import { useBooks } from "@/hooks/useBooks";
import BookCardSkeleton from "@/components/BookCardSkeleton";

export default function BookShelf() {
  const {
    books,
    isLoaded,
    handleAddBook,
    handleRatingChange,
    handleDeleteBook,
  } = useBooks();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex flex-wrap gap-6 w-full">
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
      </div>
    );
  }

  return (
    <>
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
          <p className="text-cream text-lg mb-6">
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
    </>
  );
}
