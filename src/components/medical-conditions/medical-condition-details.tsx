import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  School,
  Tag,
  Users,
} from "lucide-react";

type MedicalConditionDetailsData = {
  id: string;
  school_id: string | null;
  school_name: string | null;
  code: string;
  name: string;
  condition_type:
    | "condition"
    | "allergy"
    | "disability"
    | "dietary"
    | "other";
  description: string | null;
  created_at: string;
  usage_count: number | null;
};

type MedicalConditionDetailsProps = {
  condition:
    MedicalConditionDetailsData;
  canEdit: boolean;
  editHref: string;
};

function getConditionTypeLabel(
  value:
    MedicalConditionDetailsData["condition_type"],
): string {
  switch (value) {
    case "condition":
      return "Medical condition";

    case "allergy":
      return "Allergy";

    case "disability":
      return "Disability or support need";

    case "dietary":
      return "Dietary requirement";

    case "other":
      return "Other";

    default:
      return value;
  }
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    },
  ).format(date);
}

export function MedicalConditionDetails({
  condition,
  canEdit,
  editHref,
}: MedicalConditionDetailsProps) {
  const isGlobal =
    condition.school_id === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/app/modules/medical-conditions"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to medical conditions
          </Link>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                {condition.name}
              </h1>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {isGlobal
                  ? "Global"
                  : "School-specific"}
              </span>
            </div>

            <p className="mt-2 font-mono text-sm text-slate-500">
              {condition.code}
            </p>
          </div>
        </div>

        {canEdit ? (
          <Link
            href={editHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />

            Edit condition
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Tag className="h-4 w-4" />
            Type
          </div>

          <p className="mt-3 font-semibold text-slate-950">
            {getConditionTypeLabel(
              condition.condition_type,
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <School className="h-4 w-4" />
            Catalogue scope
          </div>

          <p className="mt-3 font-semibold text-slate-950">
            {isGlobal
              ? "All schools"
              : condition.school_name ??
                "Selected school"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Users className="h-4 w-4" />
            Usage
          </div>

          <p className="mt-3 font-semibold text-slate-950">
            {condition.usage_count ===
            null
              ? "Unavailable"
              : condition.usage_count ===
                  1
                ? "1 student record"
                : `${condition.usage_count} student records`}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CalendarDays className="h-4 w-4" />
            Created
          </div>

          <p className="mt-3 font-semibold text-slate-950">
            {formatDate(
              condition.created_at,
            )}
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">
          Description
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {condition.description ||
            "No description has been provided for this medical condition."}
        </p>
      </section>
    </div>
  );
}
