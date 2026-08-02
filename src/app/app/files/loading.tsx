import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FilesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* Scope indicator skeleton */}
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* File list skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-9 w-24 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
