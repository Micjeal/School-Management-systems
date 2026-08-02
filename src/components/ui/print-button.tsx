"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white"
    >
      <Printer className="h-4 w-4" />
      Print
    </button>
  );
}
