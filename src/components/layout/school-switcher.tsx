"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import type { SchoolSwitcherOption } from "@/lib/auth/get-school-switcher-options";

const PLATFORM_VIEW_VALUE = "__platform__";

type SchoolSwitcherProps = {
  activeSchoolId: string | null;
  schools: SchoolSwitcherOption[];
  isPlatformAdmin: boolean;
  action: (formData: FormData) => void | Promise<void>;
};

type Choice = { id: string; name: string; searchText: string };

export function SchoolSwitcher({ activeSchoolId, schools, isPlatformAdmin, action }: SchoolSwitcherProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedId = activeSchoolId ?? PLATFORM_VIEW_VALUE;

  const choices = useMemo<Choice[]>(() => [
    ...(isPlatformAdmin ? [{ id: PLATFORM_VIEW_VALUE, name: "Platform administration", searchText: "platform administration" }] : []),
    ...schools.map((school) => ({
      id: school.school_id,
      name: school.school_name,
      searchText: [school.school_name, school.school_code, school.school_slug].filter(Boolean).join(" ").toLocaleLowerCase()
    }))
  ], [isPlatformAdmin, schools]);

  const visibleChoices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery ? choices.filter((choice) => choice.searchText.includes(normalizedQuery)) : choices;
  }, [choices, query]);
  const selectedChoice = choices.find((choice) => choice.id === selectedId);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const choose = (form: HTMLFormElement | null, choice: Choice) => {
    setOpen(false);
    setQuery("");
    const schoolInput = form?.elements.namedItem("school_id") as HTMLInputElement | null;
    if (!schoolInput) return;
    schoolInput.value = choice.id;
    form?.requestSubmit();
  };

  const openPopover = () => {
    setQuery("");
    setHighlightedIndex(Math.max(0, choices.findIndex((choice) => choice.id === selectedId)));
    setOpen(true);
  };

  const moveHighlight = (offset: number) => {
    if (!visibleChoices.length) return;
    setHighlightedIndex((current) => (current + offset + visibleChoices.length) % visibleChoices.length);
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); moveHighlight(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveHighlight(-1); }
    else if (event.key === "Enter") { event.preventDefault(); const choice = visibleChoices[highlightedIndex]; if (choice) choose(event.currentTarget.form, choice); }
    else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
  };

  return (
    <form action={action} className="min-w-0">
      <input type="hidden" name="return_to" value={pathname} />
      <input type="hidden" name="school_id" value={selectedId} />
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-label="Active school"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => open ? setOpen(false) : openPopover()}
          onKeyDown={(event) => {
            if (["ArrowDown", "Enter", " "].includes(event.key)) { event.preventDefault(); openPopover(); }
            if (event.key === "Escape") setOpen(false);
          }}
          className="flex h-10 min-w-0 max-w-52 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-52"
        >
          <Building2 aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="min-w-0 flex-1 truncate text-left">{selectedChoice?.name ?? "Select school"}</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {open ? (
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                aria-label="Search schools"
                aria-controls={listboxId}
                aria-activedescendant={visibleChoices[highlightedIndex] ? `${listboxId}-${visibleChoices[highlightedIndex]!.id}` : undefined}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setHighlightedIndex(0); }}
                onKeyDown={onSearchKeyDown}
                placeholder="Search schools..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div id={listboxId} role="listbox" aria-label="Schools" className="mt-2 max-h-80 overflow-y-auto overscroll-contain">
              {visibleChoices.length ? visibleChoices.map((choice, index) => {
                const selected = choice.id === selectedId;
                const highlighted = index === highlightedIndex;
                return <button key={choice.id} id={`${listboxId}-${choice.id}`} type="button" role="option" aria-selected={selected} onMouseMove={() => setHighlightedIndex(index)} onClick={(event) => choose(event.currentTarget.form, choice)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm ${highlighted ? "bg-slate-100" : "hover:bg-slate-50"} ${selected ? "font-semibold text-blue-700" : "text-slate-700"}`}>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">{selected ? <Check aria-label="Selected" className="h-4 w-4" /> : null}</span>
                  <span className="truncate">{choice.name}</span>
                </button>;
              }) : <p className="px-3 py-6 text-center text-sm text-slate-500">No schools found.</p>}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
