import "./globals.css";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#7CB342] min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}
