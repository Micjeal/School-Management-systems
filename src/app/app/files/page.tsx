import { requireUserContext } from "@/lib/auth/context";
import { getMyPersonalFiles } from "@/lib/files/get-personal-files";
import { getMyRoleFiles } from "@/lib/files/get-role-files";
import { getPlatformFileAdministration, getSchoolFileAdministration } from "@/lib/files/get-platform-files";
import { FilesTabs } from "@/components/files/files-tabs";
import { PlatformFilesView } from "@/components/files/platform-files-view";
import { SchoolFilesView } from "@/components/files/school-files-view";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import type { MyFileItem } from "@/lib/files/file-types";
import type { UserContext } from "@/types/context";

type FilesPageSearchParams = {
  tab?: string;
  category?: string;
  status?: string;
  search?: string;
  fileType?: string;
  department?: string;
};

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<FilesPageSearchParams>;
}) {
  const context = await requireUserContext();
  const params = await searchParams;

  const activeTab = params.tab || "my-files";

  // Check audit authorization
  const isPlatformAdmin = context.is_platform_admin;
  const hasAuditRead = context.permissions.includes("audit.read");
  const canViewActivity = isPlatformAdmin || hasAuditRead;

  // Platform administrator with no school selected
  if (context.is_platform_admin && !context.active_school_id) {
    const platformData = await getPlatformFileAdministration(context);
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Files
            </h1>
            <p className="mt-1 text-muted-foreground">
              Access documents and downloads available to your account and role.
            </p>
          </div>
          {canViewActivity && (
            <Button asChild variant="outline">
              <Link href="/app/files/activity">
                <FileText className="h-4 w-4 mr-2" />
                File Activity
              </Link>
            </Button>
          )}
        </header>
        <PlatformFilesView data={platformData} />
      </div>
    );
  }

  // Platform administrator with selected school
  if (context.is_platform_admin && context.active_school_id) {
    const schoolData = await getSchoolFileAdministration(context, context.active_school_id);
    const schoolName = context.active_school?.name as string || "Selected School";
    
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Files — {schoolName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage operational files and review file-system health for the selected school.
            </p>
          </div>
          {canViewActivity && (
            <Button asChild variant="outline">
              <Link href="/app/files/activity">
                <FileText className="h-4 w-4 mr-2" />
                File Activity
              </Link>
            </Button>
          )}
        </header>
        <SchoolFilesView
          schoolId={context.active_school_id}
          schoolName={schoolName}
          data={schoolData}
          isPlatformAdmin={true}
        />
      </div>
    );
  }

  // Regular user with no school selected
  if (!context.active_school_id) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold">Select a school</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a school first to view your files.
        </p>
      </div>
    );
  }

  // Regular user with school selected
  const schoolId = context.active_school_id;
  const membership = context.memberships.find(m => m.school_id === schoolId);
  const schoolName = membership?.school_name || "Selected School";

  // Load data based on active tab
  let personalFiles: MyFileItem[] = [];
  let roleFiles: MyFileItem[] = [];

  if (activeTab === "my-files" || activeTab === "all") {
    const personalResult = await getMyPersonalFiles(context, schoolId, {
      category: params.category,
      status: params.status,
      search: params.search,
    });
    personalFiles = personalResult.files;
  }

  if (activeTab === "role-files" || activeTab === "all") {
    const roleResult = await getMyRoleFiles(context, schoolId, {
      fileType: params.fileType,
      department: params.department,
      status: params.status,
      search: params.search,
    });
    roleFiles = roleResult.files;
  }

  // Check if user has administration permissions
  const hasAdministrationAccess = context.permissions.some(perm =>
    ["school.manage", "files.manage", "imports.manage", "exports.manage"].includes(perm)
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Files
          </h1>
          <p className="mt-1 text-muted-foreground">
            Access documents and downloads available to your account and role.
          </p>
        </div>
        {canViewActivity && (
          <Button asChild variant="outline">
            <Link href="/app/files/activity">
              <FileText className="h-4 w-4 mr-2" />
              File Activity
            </Link>
          </Button>
        )}
      </header>

      <FilesTabs
        activeTab={activeTab}
        schoolName={schoolName}
        hasRoleFiles={roleFiles.length > 0 || context.permissions.length > 0}
        hasAdministration={hasAdministrationAccess}
        hasActivity={canViewActivity}
      />

      {activeTab === "my-files" && (
        <SchoolFilesView
          schoolId={schoolId}
          schoolName={schoolName}
          data={{
            personalFiles,
            roleFiles: [],
            imports: [],
            exports: [],
            healthIssues: [],
            brandingAssets: [],
          }}
          isPlatformAdmin={false}
          showPersonalOnly={true}
        />
      )}

      {activeTab === "role-files" && (
        <SchoolFilesView
          schoolId={schoolId}
          schoolName={schoolName}
          data={{
            personalFiles: [],
            roleFiles,
            imports: [],
            exports: [],
            healthIssues: [],
            brandingAssets: [],
          }}
          isPlatformAdmin={false}
          showRoleOnly={true}
        />
      )}

      {activeTab === "administration" && hasAdministrationAccess && (
        <SchoolFilesView
          schoolId={schoolId}
          schoolName={schoolName}
          data={await getSchoolFileAdministration(context, schoolId)}
          isPlatformAdmin={false}
          showAdministrationOnly={true}
        />
      )}

      {activeTab === "activity" && canViewActivity && (
        <div className="border rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">File Activity</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            View detailed audit logs for file access events.
          </p>
          <Button asChild>
            <Link href="/app/files/activity">
              Open Activity Viewer
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
