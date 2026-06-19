import { Skeleton } from "@/shared/components/ui/skeleton";

export function SessionCheckSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-black">
      <Skeleton className="h-12 w-12 rounded-full bg-card-opaque" />
    </div>
  );
}
