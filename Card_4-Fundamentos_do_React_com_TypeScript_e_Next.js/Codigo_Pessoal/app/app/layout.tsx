import "./globals.css";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-[#628141] to-[#40513B] antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
