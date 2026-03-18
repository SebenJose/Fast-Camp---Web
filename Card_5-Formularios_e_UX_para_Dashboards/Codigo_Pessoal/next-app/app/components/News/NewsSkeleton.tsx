import { Skeleton } from "@/app/components/ui/skeleton"
import { NewsHeader } from "./NewsHeader"

export function NewsSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 transition-all duration-500 ease-in-out md:flex-row relative">
      <div className="flex h-full flex-col gap-6 w-full transition-all duration-500 ease-in-out">
        <NewsHeader selectedId={null} />
        {/* Skeleton Carousel Wrapper */}
        <div className="min-h-0 w-full flex-1 overflow-hidden">
        <div className="flex gap-4 h-full">
          {/* Mocking 3 visible cards of the Carousel */}
          {[1, 2, 3].map((card) => (
            <div key={`skeleton-${card}`} className="flex flex-col h-full pl-4 md:basis-1/2 lg:basis-1/3 w-full shrink-0">
              <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden p-1">
                 <Skeleton className="w-full h-40 rounded-t-lg shrink-0" />
                 <div className="p-4 flex flex-col justify-between flex-1 gap-6">
                   <div className="flex flex-col gap-2">
                     <Skeleton className="h-6 w-full" />
                     <Skeleton className="h-6 w-5/6" />
                     <Skeleton className="h-4 w-full mt-4" />
                     <Skeleton className="h-4 w-4/5" />
                   </div>
                   <Skeleton className="h-4 w-1/3 mt-4" />
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
