import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#40513B] text-[#E5D9B6] shadow-md">
      <nav className="max-w-6xl mx-auto py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          FastCamp
        </Link>
        <ul className="flex gap-6">
          <li>
            <Link href="/" className="hover:text-[#E67E22]">
              Home
            </Link>
          </li>
          <li>
            <Link href="/sobre" className="hover:text-[#E67E22]">
              Sobre
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
