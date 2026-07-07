import { Skeleton } from "@/shared/components/ui/skeleton";

export function AuthPageSkeleton() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-primary-black text-app-foreground md:grid-cols-2">
      <section className="relative flex min-h-[32rem] items-stretch justify-center overflow-hidden bg-opaque-black px-8 py-6 md:min-h-screen">
        <div className="grid w-full max-w-2xl grid-rows-[auto_1fr_auto] gap-4">
          <div className="space-y-4">
            <Skeleton className="h-11 w-4/5 bg-card-opaque" />
            <Skeleton className="h-11 w-3/5 bg-card-opaque" />
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <Skeleton className="aspect-square h-auto max-h-[52vh] w-104 max-w-full rounded-[32px] bg-card-opaque sm:w-136 md:max-h-[62vh] md:w-160 lg:w-184" />
          </div>

          <Skeleton className="h-24 w-full max-w-md rounded-2xl bg-card-opaque" />
        </div>
      </section>

      <section className="flex min-h-[60vh] items-center justify-center bg-primary-black px-8 py-12 md:min-h-screen">
        <div className="w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 shadow-2xl shadow-black/30 sm:p-10">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 bg-card-opaque" />
            <Skeleton className="h-5 w-full bg-card-opaque" />
            <Skeleton className="h-5 w-5/6 bg-card-opaque" />
          </div>

          <div className="mt-8 space-y-5">
            <Skeleton className="h-14 w-full rounded-2xl bg-card-opaque" />
            <Skeleton className="h-14 w-full rounded-2xl bg-card-opaque" />
            <Skeleton className="h-14 w-full rounded-2xl bg-card-opaque" />
          </div>
        </div>
      </section>
    </main>
  );
}
