"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown } from "lucide-react";

import type { SchoolSwitcherOption } from "@/lib/auth/get-school-switcher-options";

const PLATFORM_VIEW_VALUE = "__platform__";

type SchoolSwitcherProps = {
  activeSchoolId: string | null;
  schools: SchoolSwitcherOption[];
  isPlatformAdmin: boolean;
  action: (formData: FormData) => void | Promise<void>;
};

export function SchoolSwitcher({
  activeSchoolId,
  schools,
  isPlatformAdmin,
  action,
}: SchoolSwitcherProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const pathname = usePathname();

  return (
    <form ref={formRef} action={action} className="min-w-0">
      <label className="sr-only" htmlFor="school_id">
        Active school
      </label>

      <input type="hidden" name="return_to" value={pathname} />

      <div className="relative flex h-10 min-w-0 items-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <Building2
          aria-hidden="true"
          className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500"
        />

        <select
          id="school_id"
          name="school_id"
          value={activeSchoolId ?? PLATFORM_VIEW_VALUE}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-full min-w-0 max-w-52 appearance-none rounded-xl bg-transparent pl-9 pr-8 text-sm font-semibold text-slate-800 outline-none sm:w-52"
        >
          {isPlatformAdmin ? (
            <option value={PLATFORM_VIEW_VALUE}>Platform administration</option>
          ) : null}

          {schools.map((school) => (
            <option value={school.school_id} key={school.school_id}>
              {school.school_name}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 h-4 w-4 text-slate-400"
        />
      </div>
    </form>
  );
}