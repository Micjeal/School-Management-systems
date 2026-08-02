"use client";

import { Search } from "lucide-react";

export function HeaderSearch() {
  return (
    <form
      action="/app/search"
      className="relative hidden max-w-xl flex-1 md:block"
    >
      <Search
        aria-hidden="true"
        className="
          pointer-events-none absolute left-3 top-1/2
          h-4 w-4 -translate-y-1/2
          text-slate-400
        "
      />

      <input
        type="search"
        name="q"
        aria-label="Search SchoolDB"
        placeholder="Search students, staff, invoices..."
        className="
          h-10 w-full rounded-xl
          border border-slate-200
          bg-slate-50
          pl-10 pr-4
          text-sm text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          hover:border-slate-300
          focus:border-blue-500
          focus:bg-white
          focus:ring-2 focus:ring-blue-500/20
        "
      />
    </form>
  );
}
