import { Skeleton } from "@/shared/components/ui/skeleton";

export function AiChatPageSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-primary-black">
      <header className="flex shrink-0 items-center gap-3 border-b border-app-border px-6 py-4">
        <Skeleton className="h-9 w-9 rounded-full bg-card-opaque" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-card-opaque" />
          <Skeleton className="h-3 w-40 bg-card-opaque" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full bg-card-opaque" />
          <Skeleton className="h-3 w-12 bg-card-opaque" />
        </div>
      </header>

      <div className="flex-1 space-y-5 px-6 py-6">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-card-opaque" />
          <Skeleton className="h-28 w-full max-w-[34rem] rounded-2xl rounded-tl-sm bg-input-opaque" />
        </div>

        <div className="flex flex-row-reverse gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-card-opaque" />
          <Skeleton className="h-16 w-full max-w-[24rem] rounded-2xl rounded-tr-sm bg-card-opaque" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-card-opaque" />
          <Skeleton className="h-20 w-full max-w-[28rem] rounded-2xl rounded-tl-sm bg-input-opaque" />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="flex items-end gap-2 rounded-xl border border-app-border bg-input-opaque p-2">
          <Skeleton className="h-10 flex-1 rounded-lg bg-card-opaque" />
          <Skeleton className="h-9 w-9 rounded-lg bg-card-opaque" />
        </div>
        <Skeleton className="mx-auto mt-2 h-3 w-80 max-w-full bg-card-opaque" />
      </div>
    </div>
  );
}
