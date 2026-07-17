import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-16 w-40 bg-card-opaque" />
            <Skeleton className="h-5 w-full bg-card-opaque" />
            <Skeleton className="h-5 w-4/5 bg-card-opaque" />
          </div>

          <Skeleton className="h-16 w-full max-w-64 rounded-2xl bg-card-opaque lg:mt-8" />
        </header>

        <section aria-label="Carregando agenda de hoje">
          <div className="rounded-[28px] border border-app-border bg-opaque-black/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-8 w-56 bg-card-opaque" />
                <Skeleton className="h-5 w-96 max-w-full bg-card-opaque" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-12 w-44 rounded-2xl bg-card-opaque" />
                <Skeleton className="h-12 w-56 rounded-2xl bg-card-opaque" />
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {["morning", "lunch", "afternoon", "night"].map((period) => (
                <div
                  key={period}
                  className="grid gap-4 rounded-[22px] border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[8rem_1fr] sm:gap-5 sm:p-5"
                >
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-10 w-28 rounded-full bg-card-opaque" />
                  </div>

                  <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-4 rounded-sm bg-card-opaque"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-px w-full bg-app-border" />
                    <div className="relative h-28">
                      <Skeleton className="absolute left-[8%] top-2 h-16 w-[18%] rounded-xl bg-card-opaque" />
                      <Skeleton className="absolute left-[38%] top-2 h-16 w-[22%] rounded-xl bg-card-opaque" />
                      <Skeleton className="absolute left-[66%] top-2 h-16 w-[18%] rounded-xl bg-card-opaque" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
