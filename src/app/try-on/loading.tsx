import { Skeleton } from "@/components/ui/skeleton";

export default function TryOnLoading() {
  return (
    <main className="container-page flex min-h-screen flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-10 w-full max-w-md rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-xl rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
      <Skeleton className="h-24 rounded-3xl" />
    </main>
  );
}
