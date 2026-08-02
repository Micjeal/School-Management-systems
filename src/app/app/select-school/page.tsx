import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACTIVE_SCHOOL_COOKIE } from "@/lib/auth/context";

export default async function SelectSchoolPage() {
  const context = await requireUserContext();
  
  // If user has only one school, auto-select it
  if (context.memberships.length === 1) {
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_SCHOOL_COOKIE, context.memberships[0]!.school_id);
    redirect("/app");
  }

  // If user has no active memberships, show access pending
  if (context.memberships.length === 0) {
    return (
      <div>
        <PageHeader 
          title="No Active School" 
          description="You do not have any active school memberships"
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600">
              Your account is not currently associated with any active school. 
              Please contact your school administrator or platform support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Select School" 
        description="You have access to multiple schools. Please select one to continue."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {context.memberships.map((membership) => (
          <Card key={membership.membership_id} className="hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{membership.school_name}</h3>
                  <p className="text-sm text-slate-500">{membership.school_slug}</p>
                </div>
                <Badge>{membership.subscription_status}</Badge>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  Status: <span className="font-medium">{membership.status}</span>
                </p>
                {membership.roles.length > 0 && (
                  <p className="text-sm text-slate-600 mt-1">
                    Roles: {membership.roles.map(r => r.name).join(", ")}
                  </p>
                )}
              </div>
              <form action={async () => {
                "use server";
                const cookieStore = await cookies();
                cookieStore.set(ACTIVE_SCHOOL_COOKIE, membership.school_id);
                redirect("/app");
              }}>
                <Button type="submit" className="w-full">
                  Enter School
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
