import Link from "next/link";

export default function Sobre() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      {/* A "Folha de Papel" centralizada */}
      <div className="bg-[#E5D9B6] text-gray-900 max-w-3xl w-full p-10 md:p-16 rounded-xl shadow-2xl space-y-6">
        <h1 className="text-4xl font-bold text-[#40513B] mb-8 text-center border-b-2 border-[#628141]/30 pb-4">
          Sobre a Biblioteca
        </h1>

        <div className="space-y-6 text-lg leading-relaxed text-gray-800">
          <p>
            Olá! Esta página funciona como uma carta de esclarecimento e também
            como um espaço prático para aplicarmos o sistema de roteamento do
            Next.js.
          </p>

          <p>
            A <strong>Biblioteca FastCamp</strong> é um projeto de simulação
            desenvolvido com o objetivo de treinar e consolidar conhecimentos em
            desenvolvimento web. Aqui, colocamos em prática a construção de
            interfaces modernas utilizando React e Tailwind CSS.
          </p>

          <p>
            Durante o desenvolvimento, implementamos funcionalidades essenciais,
            como o uso do <em>localStorage</em> para persistência de dados no
            navegador do usuário, e o consumo de APIs externas (Google Books)
            para enriquecer a experiência visual da aplicação com capas reais.
          </p>

          <p className="font-medium text-center text-[#40513B] mt-8">
            Sinta-se à vontade para adicionar seus livros favoritos e organizar
            sua fila de leitura!
          </p>
        </div>

        <div className="pt-10 flex justify-center">
          <Link
            href="/"
            className="bg-[#40513B] hover:bg-[#628141] text-[#E5D9B6] font-semibold py-3 px-8 rounded-lg transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl"
          >
            Voltar para a Inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
