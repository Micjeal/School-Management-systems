import { Suspense } from "react";
import { requireUserContext } from "@/lib/auth/context";
import { getMedicalConditionsWithUsage, getSchoolsForSelector } from "@/lib/medical-conditions/queries";
import { MedicalConditionsClient } from "@/components/medical-conditions/medical-conditions-client";
import type { UserContext } from "@/types/context";
import type { MedicalConditionWithUsage } from "@/lib/medical-conditions/types";

async function MedicalConditionsContent() {
  const context = await requireUserContext("health.manage");
  const isPlatformView = context.is_platform_admin && !context.active_school_id;
  const schools = context.is_platform_admin ? await getSchoolsForSelector(100) : [];

  let conditions: MedicalConditionWithUsage[] = [];

  if (isPlatformView) {
    // Load all conditions (global + school-specific) for platform admin
    conditions = await getMedicalConditionsWithUsage({ scope: "all" });
  } else if (context.active_school_id) {
    conditions = await getMedicalConditionsWithUsage({
      scope: "all",
      school_id: context.active_school_id
    });
  } else {
    conditions = [];
  }

  return (
    <MedicalConditionsClient
      initialContext={context}
      initialConditions={conditions}
      schools={schools}
      isPlatformView={isPlatformView}
    />
  );
}

export default function MedicalConditionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicalConditionsContent />
    </Suspense>
  );
}
