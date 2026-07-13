import { Skeleton } from "@/shared/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <main className="min-h-screen bg-primary-black px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 bg-card-opaque" />
          <Skeleton className="h-12 w-64 bg-card-opaque" />
          <Skeleton className="h-4 w-96 max-w-full bg-card-opaque" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-input-opaque/55" />
          ))}
        </div>

        <Skeleton className="h-96 rounded-[24px] bg-input-opaque/40" />

        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-[26rem] rounded-[24px] bg-input-opaque/40" />
          <Skeleton className="h-[26rem] rounded-[24px] bg-input-opaque/40" />
        </div>
      </div>
    </main>
  );
}
