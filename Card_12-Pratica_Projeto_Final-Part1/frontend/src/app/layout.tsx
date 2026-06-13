import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/shared/components/ui/sonner";
import { MockProvider } from "@/mocks/MockProvider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { cn } from "@/shared/lib/utils";
import "@/shared/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

function getMetadataBase() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";

  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
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
  const shouldUseMocks = process.env.NODE_ENV === "development";
  const appContent = <QueryProvider>{children}</QueryProvider>;

  return (
    <html
      lang="pt-BR"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body>
        {shouldUseMocks ? <MockProvider>{appContent}</MockProvider> : appContent}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
