import { Button } from "@/shared/components/ui/button";

export function QueryErrorState({
  title,
  onRetry,
}: {
  title: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary-black px-6 text-center">
      <p className="text-lg font-semibold text-primary-title">{title}</p>
      <p className="text-sm text-secundary-title">
        Verifique sua conexão e tente novamente.
      </p>
      <Button
        type="button"
        onClick={onRetry}
        className="bg-secundary-title/20 text-secundary-title hover:bg-secundary-title/30"
      >
        Tentar novamente
      </Button>
    </main>
  );
}
