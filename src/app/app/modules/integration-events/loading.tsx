export default function IntegrationEventsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-40 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="border rounded-lg p-4">
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <div key={j} className="h-4 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
