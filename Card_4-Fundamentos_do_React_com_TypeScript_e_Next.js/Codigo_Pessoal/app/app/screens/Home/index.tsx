import { BookShelf } from "../../components";

export default function HomeScreen() {
  return (
    <main className="px-8 py-12 md:px-16">
      <h1 className="text-5xl font-bold text-[#E5D9B6] mb-3 drop-shadow-lg">
        Sua Biblioteca
      </h1>
      <p className="text-xl text-[#E5D9B6] drop-shadow-md opacity-95 mb-8">
        Aqui você pode adicionar os livros que já leu.
      </p>

      <BookShelf />
      
    </main>
  );
}