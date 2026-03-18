import { Skeleton } from "@/app/components/ui/skeleton"
import { NewsHeader } from "./NewsHeader"

export function NewsSkeleton() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-6 transition-all duration-500 ease-in-out md:flex-row">
      <div className="flex h-full w-full flex-col gap-6 transition-all duration-500 ease-in-out">
        <NewsHeader selectedId={null} />
        {/* Skeleton Carousel Wrapper */}
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <div className="flex h-full gap-4">
            {/* Mocking 3 visible cards of the Carousel */}
            {[1, 2, 3].map((card) => (
              <div
                key={`skeleton-${card}`}
                className="flex h-full w-full shrink-0 flex-col pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm">
                  <Skeleton className="h-40 w-full shrink-0 rounded-t-lg" />
                  <div className="flex flex-1 flex-col justify-between gap-6 p-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                      <Skeleton className="mt-4 h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <Skeleton className="mt-4 h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
