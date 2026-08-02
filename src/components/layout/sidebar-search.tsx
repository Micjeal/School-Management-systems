"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SidebarSearch() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <form action="/app/search" className="relative mb-4">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        name="q"
        aria-label="Search"
        placeholder="Search..."
        defaultValue={query}
        className="h-10 w-full rounded-xl bg-slate-800 pl-10 pr-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
      />
    </form>
  );
}
