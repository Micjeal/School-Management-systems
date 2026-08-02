import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";

export type SchoolSwitcherOption = {
  school_id: string;
  school_name: string;
  school_slug: string;
  school_status: string;
  subscription_status: string;
};

type SchoolRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscription_status: string;
};

function isSchoolRow(value: unknown): value is SchoolRow {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return false;
  }

  const row = value as Record<
    string,
    unknown
  >;

  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.slug === "string" &&
    typeof row.status === "string" &&
    typeof row.subscription_status ===
      "string"
  );
}

export async function getSchoolSwitcherOptions(
  context: UserContext,
): Promise<SchoolSwitcherOption[]> {
  /*
   * Ordinary users can switch only between
   * schools where they have an active
   * membership.
   */
  if (!context.is_platform_admin) {
    const memberships =
      Array.isArray(
        context.memberships,
      )
        ? context.memberships
        : [];

    return memberships
      .filter(
        (membership) =>
          membership.status === "active",
      )
      .map((membership) => ({
        school_id:
          membership.school_id,

        school_name:
          membership.school_name,

        school_slug:
          membership.school_slug,

        school_status:
          membership.school_status,

        subscription_status:
          membership.subscription_status,
      }))
      .sort((left, right) =>
        left.school_name.localeCompare(
          right.school_name,
        ),
      );
  }

  /*
   * Platform administrators can select all
   * non-archived schools, even when they do
   * not have school_memberships rows.
   */
  const supabase =
    await createClient();

  const {
    data: rawData,
    error,
  } = await supabase
    .from("schools")
    .select(
      [
        "id",
        "name",
        "slug",
        "status",
        "subscription_status",
      ].join(","),
    )
    .neq("status", "archived")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Failed to load platform school options:",
      error,
    );

    return [];
  }

  /*
   * The generated Supabase database types
   * currently infer this query as never[].
   *
   * Validate the runtime values instead of
   * accessing properties on the inferred
   * never type.
   */
  const schools = Array.isArray(rawData)
    ? (rawData as unknown[]).filter(
        isSchoolRow,
      )
    : [];

  return schools.map((school) => ({
    school_id: school.id,
    school_name: school.name,
    school_slug: school.slug,
    school_status: school.status,
    subscription_status:
      school.subscription_status,
  }));
}