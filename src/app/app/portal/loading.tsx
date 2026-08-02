import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PortalLoading() {
  return (
    <PageContainer width="wide">
      <PageHeader
        title="My portal"
        description="Your personal records, tasks and school services."
      />

      {/* Summary skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview cards skeleton */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 animate-pulse rounded bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
