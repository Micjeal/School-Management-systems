import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileList } from "@/components/files/file-list";
import { FileEmptyState } from "@/components/files/file-empty-state";
import { 
  HardDrive, 
  FileText, 
  Download, 
  Upload, 
  AlertTriangle,
  Shield,
  CheckCircle,
  FolderOpen
} from "lucide-react";
import type { MyFileItem } from "@/lib/files/file-types";
import { formatFileSize } from "@/lib/files/file-types";

type SchoolFilesViewProps = {
  schoolId: string;
  schoolName: string;
  data: {
    personalFiles?: MyFileItem[];
    roleFiles?: MyFileItem[];
    imports?: Array<{ id: string; jobType: string; status: string; createdAt: string }>;
    exports?: Array<{ id: string; exportType: string; status: string; createdAt: string }>;
    healthIssues?: Array<{
      id: string;
      issueType: string;
      source: string | null;
      metadataId: string | null;
      storagePath: string | null;
      detectedAt: string;
      severity: string;
    }>;
    brandingAssets?: Array<{ id: string; assetType: string; createdAt: string }>;
  };
  isPlatformAdmin: boolean;
  showPersonalOnly?: boolean;
  showRoleOnly?: boolean;
  showAdministrationOnly?: boolean;
};

export function SchoolFilesView({
  schoolId,
  schoolName,
  data,
  isPlatformAdmin,
  showPersonalOnly = false,
  showRoleOnly = false,
  showAdministrationOnly = false,
}: SchoolFilesViewProps) {
  const personalFiles = data.personalFiles || [];
  const roleFiles = data.roleFiles || [];
  const imports = data.imports || [];
  const exports = data.exports || [];
  const healthIssues = data.healthIssues || [];
  const brandingAssets = data.brandingAssets || [];

  // Calculate summary counts
  const allFilesCount = personalFiles.length + roleFiles.length;
  const verifiedCount = personalFiles.filter(f => f.status === "verified").length;
  const expiringCount = personalFiles.filter(f => f.status === "expiring").length;
  const recentCount = personalFiles.filter(f => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(f.createdAt) > thirtyDaysAgo;
  }).length;

  // Role files summary
  const roleFilesCount = roleFiles.length;
  const recentExportsCount = exports.filter(e => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(e.createdAt) > thirtyDaysAgo;
  }).length;
  const pendingFilesCount = roleFiles.filter(f => f.status === "processing").length;
  const expiringRoleFilesCount = roleFiles.filter(f => f.status === "expiring").length;

  // Administration summary
  const storedFilesCount = allFilesCount;
  const storageUsed = 0; // Would be calculated from actual storage metrics
  const orphanedObjectsCount = healthIssues.filter(h => h.issueType === "orphaned_object").length;
  const failedFilesCount = imports.filter(i => i.status === "failed").length + 
                          exports.filter(e => e.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Files — {schoolName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isPlatformAdmin 
            ? "Manage operational files and review file-system health for the selected school."
            : "Access documents and downloads available to your account and role."
          }
        </p>
      </header>

      {/* Personal Files View */}
      {showPersonalOnly && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="All files" value={allFilesCount} icon={FileText} />
            <SummaryCard title="Verified documents" value={verifiedCount} icon={CheckCircle} />
            <SummaryCard title="Expiring soon" value={expiringCount} icon={AlertTriangle} />
            <SummaryCard title="Recent files" value={recentCount} icon={FolderOpen} />
          </div>

          {personalFiles.length === 0 ? (
            <FileEmptyState />
          ) : (
            <FileList files={personalFiles} />
          )}
        </>
      )}

      {/* Role Files View */}
      {showRoleOnly && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Available role files" value={roleFilesCount} icon={FileText} />
            <SummaryCard title="Recent exports" value={recentExportsCount} icon={Download} />
            <SummaryCard title="Pending files" value={pendingFilesCount} icon={FolderOpen} />
            <SummaryCard title="Expiring files" value={expiringRoleFilesCount} icon={AlertTriangle} />
          </div>

          {roleFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No role files</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Files available through your current role will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <FileList files={roleFiles} />
          )}
        </>
      )}

      {/* Administration View */}
      {showAdministrationOnly && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="imports">Imports</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="storage-health">Storage Health</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title="Stored files" value={storedFilesCount} icon={FileText} />
              <SummaryCard title="Storage used" value={formatFileSize(storageUsed)} icon={HardDrive} />
              <SummaryCard title="Orphaned objects" value={orphanedObjectsCount} icon={AlertTriangle} highlight={orphanedObjectsCount > 0} />
              <SummaryCard title="Failed files" value={failedFilesCount} icon={AlertTriangle} highlight={failedFilesCount > 0} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>School File Administration</CardTitle>
                <CardDescription>
                  Operational file governance for {schoolName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Metadata Records</p>
                      <p className="text-2xl font-bold">{storedFilesCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Storage Health</p>
                      <p className="text-2xl font-bold text-green-500">
                        {orphanedObjectsCount === 0 && failedFilesCount === 0 ? "Healthy" : "Issues Detected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Import Jobs</p>
                      <p className="text-2xl font-bold">{imports.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Export Jobs</p>
                      <p className="text-2xl font-bold">{exports.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Jobs</CardTitle>
                <CardDescription>
                  File import operations for {schoolName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No import jobs found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {imports.map((import_) => (
                      <div key={import_.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{import_.jobType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>{import_.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(import_.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Jobs</CardTitle>
                <CardDescription>
                  File export operations for {schoolName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No export jobs found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exports.map((export_) => (
                      <div key={export_.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{export_.exportType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge>{export_.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(export_.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage-health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Health</CardTitle>
                <CardDescription>
                  Metadata records with missing or orphaned storage objects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No storage health issues detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {healthIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-4 w-4 ${
                            issue.severity === "critical" ? "text-destructive" :
                            issue.severity === "high" ? "text-orange-500" :
                            "text-yellow-500"
                          }`} />
                          <div>
                            <p className="font-medium">{issue.issueType.replace(/_/g, " ")}</p>
                            <p className="text-sm text-muted-foreground">
                              {issue.source} - {issue.storagePath || "No path"}
                            </p>
                          </div>
                        </div>
                        <Badge className={issue.severity === "critical" ? "bg-red-50 text-red-700" : issue.severity === "high" ? "bg-orange-50 text-orange-700" : "bg-amber-50 text-amber-700"}>{issue.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>School Branding Assets</CardTitle>
                <CardDescription>
                  Logo, images, and other branding files for {schoolName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {brandingAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No branding assets found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brandingAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{asset.assetType}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  highlight = false 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <Icon className={`h-4 w-4 ${highlight ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <p className={`mt-3 text-3xl font-bold tracking-tight ${highlight ? "text-destructive" : ""}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </CardContent>
    </Card>
  );
}
