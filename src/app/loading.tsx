import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="container-page flex min-h-screen flex-col gap-10 py-32">
      <div className="flex flex-col items-start gap-5">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-14 w-full max-w-2xl rounded-2xl sm:h-20" />
        <Skeleton className="h-6 w-full max-w-lg rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40 rounded-2xl" />
          <Skeleton className="h-12 w-44 rounded-2xl" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-md gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
        <Skeleton className="hidden aspect-[3/4] w-full rounded-3xl sm:block" />
        <Skeleton className="hidden aspect-[3/4] w-full rounded-3xl lg:block" />
      </div>
    </main>
  );
}
