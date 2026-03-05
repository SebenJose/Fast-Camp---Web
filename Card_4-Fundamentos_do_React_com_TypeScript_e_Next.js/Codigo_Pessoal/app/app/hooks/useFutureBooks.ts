import { Book } from "@/types/book";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useFutureBooks() {
  const [futureBooks, setFutureBooks] = useLocalStorage<Book[]>(
    "livros-a-ler",
    [],
  );

  const handleAddFutureBook = (newBook: Book) => {
    setFutureBooks([...futureBooks, newBook]);
  };

  const handleDeleteFutureBook = (id: number | string) => {
    setFutureBooks(futureBooks.filter((book) => book.id !== id));
  };

  return {
    futureBooks,
    handleAddFutureBook,
    handleDeleteFutureBook,
  };
}
