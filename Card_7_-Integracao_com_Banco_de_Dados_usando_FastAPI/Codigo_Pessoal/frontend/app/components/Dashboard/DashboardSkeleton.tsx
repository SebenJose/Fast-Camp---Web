import { Skeleton } from "@/app/components/ui"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/app/components/ui/card"

interface DashboardSkeletonProps {
  hideHeader?: boolean
}

export function DashboardSkeleton({
  hideHeader = false,
}: DashboardSkeletonProps) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col gap-6">
      {!hideHeader && (
        <header className="flex flex-col gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 opacity-70" />
        </header>
      )}

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        <Card className="flex flex-col shadow-sm md:col-span-4">
          <CardHeader className="items-center pb-0">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-56 opacity-60" />
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center py-6">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Skeleton className="mx-auto h-4 w-32" />
          </CardFooter>
        </Card>

        <Card className="flex flex-col shadow-sm md:col-span-8">
          <CardHeader className="flex flex-col items-start gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 opacity-60" />
          </CardHeader>
          <CardContent className="flex-1 space-y-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton
                  className={`h-8 flex-1`}
                  style={{ width: `${100 - i * 15}%` }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-56" />
          </CardFooter>
        </Card>

        <Card className="flex flex-col shadow-sm md:col-span-12">
          <CardHeader>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-2 h-4 w-80 opacity-60" />
          </CardHeader>
          <CardContent className="flex h-[350px] flex-1 items-end gap-1 px-4 pb-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${20 + ((i * 17) % 60)}%` }}
              />
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-48" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
