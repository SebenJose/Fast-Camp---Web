import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useBooks() {
  // EXATAMENTE O SEU CÓDIGO RECORTADO:
  const [books, setBooks] = useLocalStorage<Book[]>("minha-biblioteca", [
    { id: 1, title: "Clean Code", rating: 5 },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleAddBook = (newBook: Book) => {
    setBooks([...books, newBook]);
  };

  const handleRatingChange = (id: number | string, rating: number) => {
    setBooks(
      books.map((book) => (book.id === id ? { ...book, rating } : book)),
    );
  };

  const handleDeleteBook = (id: number | string) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  return {
    books,
    setBooks,
    isLoaded,
    handleAddBook,
    handleRatingChange,
    handleDeleteBook,
  };
}
