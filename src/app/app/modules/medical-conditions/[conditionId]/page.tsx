import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

import { MedicalConditionDetails } from "@/components/medical-conditions/medical-condition-details";

type MedicalConditionDetailPageProps = {
  params: Promise<{
    conditionId: string;
  }>;
};

type MedicalConditionRow = {
  id: string;
  school_id: string | null;
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
};

type SchoolRow = {
  name: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

function getPermissions(
  value: unknown,
): string[] {
  return Array.isArray(value)
    ? value.filter(
        (
          permission,
        ): permission is string =>
          typeof permission === "string",
      )
    : [];
}

export default async function MedicalConditionDetailPage({
  params,
}: MedicalConditionDetailPageProps) {
  const { conditionId } =
    await params;

  /*
   * This prevents PostgreSQL error 22P02
   * when a non-UUID value reaches:
   *
   * .eq("id", conditionId)
   */
  if (!isUuid(conditionId)) {
    notFound();
  }

  const context =
    await requireUserContext();

  const supabase =
    await createClient();

  /*
   * Never allow values such as:
   *
   * ""
   * "null"
   * "__platform__"
   *
   * to reach a UUID database filter.
   */
  const activeSchoolId =
    isUuid(
      context.active_school_id,
    )
      ? context.active_school_id
      : null;

  let conditionQuery =
    supabase
      .from("medical_conditions")
      .select(
        [
          "id",
          "school_id",
          "code",
          "name",
          "condition_type",
          "description",
          "created_at",
        ].join(","),
      )
      .eq("id", conditionId);

  /*
   * A selected-school view may access:
   *
   * - global conditions
   * - conditions for the selected school
   */
  if (activeSchoolId) {
    conditionQuery =
      conditionQuery.or(
        [
          "school_id.is.null",
          `school_id.eq.${activeSchoolId}`,
        ].join(","),
      );
  } else if (
    !context.is_platform_admin
  ) {
    /*
     * Ordinary users cannot use the
     * platform-level view.
     */
    notFound();
  }

  const {
    data: rawCondition,
    error: conditionError,
  } = await conditionQuery
    .limit(1)
    .maybeSingle();

  if (conditionError) {
    console.error(
      "Unable to load medical condition:",
      {
        code: conditionError.code,
        message:
          conditionError.message,
      },
    );

    notFound();
  }

  const condition =
    rawCondition as unknown as
      | MedicalConditionRow
      | null;

  if (!condition) {
    notFound();
  }

  /*
   * Resolve the school name separately.
   * This also avoids generated Supabase
   * relationship types becoming `never`.
   */
  let schoolName:
    | string
    | null = null;

  if (
    condition.school_id &&
    isUuid(condition.school_id)
  ) {
    const {
      data: rawSchool,
      error: schoolError,
    } = await supabase
      .from("schools")
      .select("name")
      .eq(
        "id",
        condition.school_id,
      )
      .limit(1)
      .maybeSingle();

    if (schoolError) {
      console.error(
        "Unable to load condition school:",
        {
          code: schoolError.code,
          message:
            schoolError.message,
        },
      );
    }

    const school =
      rawSchool as unknown as
        | SchoolRow
        | null;

    schoolName =
      school?.name ?? null;
  }

  /*
   * Usage count may be unavailable when
   * RLS does not permit the current user
   * to read student medical assignments.
   *
   * Do not report zero when the query
   * actually failed.
   */
  const {
    count: usageCount,
    error: usageError,
  } = await supabase
    .from(
      "student_medical_conditions",
    )
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "medical_condition_id",
      condition.id,
    );

  if (usageError) {
    console.error(
      "Unable to count medical-condition usage:",
      {
        code: usageError.code,
        message:
          usageError.message,
      },
    );
  }

  const permissions =
    getPermissions(
      context.permissions,
    );

  const canManageSelectedSchool =
    condition.school_id !== null &&
    activeSchoolId !== null &&
    condition.school_id ===
      activeSchoolId &&
    permissions.includes(
      "health.manage",
    );

  const canEdit =
    condition.school_id === null
      ? context.is_platform_admin
      : context.is_platform_admin ||
        canManageSelectedSchool;

  const conditionWithUsage = {
    ...condition,

    school_name: schoolName,

    usage_count:
      usageError
        ? null
        : usageCount ?? 0,
  };

  return (
    <MedicalConditionDetails
      condition={
        conditionWithUsage
      }
      canEdit={canEdit}
      editHref={`/app/modules/medical-conditions/${condition.id}/edit`}
    />
  );
}
