import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/shared/components/ui/sonner";
import { cn } from "@/shared/lib/utils";
import "@/shared/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Organiza.IA",
  description: "Projeto final iniciado com Next.js, React e Tailwind CSS.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Organiza.IA",
    description: "Projeto final iniciado com Next.js, React e Tailwind CSS.",
    images: [
      {
        url: "/images/logo.png",
        width: 1024,
        height: 1024,
        alt: "Logo Organiza.IA",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Organiza.IA",
    description: "Projeto final iniciado com Next.js, React e Tailwind CSS.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
