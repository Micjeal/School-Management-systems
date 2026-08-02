import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MedicalConditionWithUsage } from "@/lib/medical-conditions/types";

interface MedicalConditionSummaryProps {
  conditions: MedicalConditionWithUsage[];
  isPlatformView: boolean;
}

export function MedicalConditionSummary({ conditions, isPlatformView }: MedicalConditionSummaryProps) {
  const globalCount = conditions.filter((c) => c.school_id === null).length;
  const schoolCount = conditions.filter((c) => c.school_id !== null).length;
  const inUseCount = conditions.filter((c) => c.usage_count > 0).length;
  const unusedCount = conditions.filter((c) => c.usage_count === 0).length;

  const allergiesCount = conditions.filter((c) => c.condition_type === "allergy").length;
  const dietaryCount = conditions.filter((c) => c.condition_type === "dietary").length;
  const disabilitiesCount = conditions.filter((c) => c.condition_type === "disability").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isPlatformView && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Global conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                School-specific conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolCount}</div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Conditions in use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inUseCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unused conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unusedCount}</div>
        </CardContent>
      </Card>

      {isPlatformView && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allergiesCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dietary requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dietaryCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disabilitiesCount}</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
