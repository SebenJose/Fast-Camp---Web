import type { Metadata } from "next";

import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Fast Camp Card 12",
  description: "Projeto final iniciado com Next.js, React e Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
