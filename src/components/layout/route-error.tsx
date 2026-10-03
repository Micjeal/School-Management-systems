"use client";

import { Button } from "@/components/ui/button";

export function RouteError({ error, reset, title = "This section could not be loaded" }: { error: Error & { digest?: string }; reset: () => void; title?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
      <h2 className="font-semibold text-red-900">{title}</h2>
      <p className="mt-2 text-sm text-red-700">Try again. If the problem continues, share reference {error.digest ?? "unavailable"} with support.</p>
      <Button className="mt-4" variant="secondary" onClick={reset}>Try again</Button>
    </div>
  );
}
