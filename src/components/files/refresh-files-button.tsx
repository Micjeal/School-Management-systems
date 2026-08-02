"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RefreshFilesButton() {
  const router = useRouter();

  const [
    isRefreshing,
    startTransition,
  ] = useTransition();

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isRefreshing}
      onClick={handleRefresh}
    >
      <RefreshCw
        className={[
          "mr-2 h-4 w-4",
          isRefreshing
            ? "animate-spin"
            : "",
        ].join(" ")}
      />

      {isRefreshing
        ? "Refreshing..."
        : "Refresh"}
    </Button>
  );
}