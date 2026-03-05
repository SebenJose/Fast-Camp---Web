export default function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-[150px] w-full flex flex-col animate-pulse">
      {/* Esqueleto da Capa */}
      <div className="w-full h-48 bg-gray-200 shrink-0 border-b border-gray-100"></div>

      {/* Esqueleto do Texto e Botão */}
      <div className="p-3 flex flex-col flex-1 gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div> {/* Título */}
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>{" "}
        {/* Nota */}
        <div className="h-6 bg-gray-200 rounded w-full mt-auto"></div>{" "}
        {/* Botão */}
      </div>
    </div>
  );
}
