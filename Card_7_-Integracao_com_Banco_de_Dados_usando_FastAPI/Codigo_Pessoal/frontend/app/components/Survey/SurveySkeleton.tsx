import { Skeleton } from "@/app/components/ui"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/app/components/ui/card"

interface SurveySkeletonProps {
  hideHeader?: boolean
}

export function SurveySkeleton({ hideHeader = false }: SurveySkeletonProps) {
  return (
    <Card className="border-none shadow-xl">
      {!hideHeader && (
        <CardHeader className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-5/6 opacity-60" />
          <Skeleton className="mx-auto h-4 w-4/6 opacity-60" />
        </CardHeader>
      )}

      <CardContent className="mt-6 space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col border-t bg-muted/20 pt-8">
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardFooter>
    </Card>
  )
}
