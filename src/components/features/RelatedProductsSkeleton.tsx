import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-16 border-t border-[#A6A3A2]/20 pt-10 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-[#A6A3A2]/30 flex flex-col h-full">
              <div className="relative aspect-square w-full bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/4 mt-2" />
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
