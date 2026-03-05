import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Biblioteca FastCamp",

  description: "Organize seus livros favoritos e sua lista de leitura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-linear-to-br from-primary to-primary-dark antialiased">
        <Header />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
