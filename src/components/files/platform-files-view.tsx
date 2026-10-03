import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HardDrive, 
  School, 
  FileText, 
  Download, 
  Upload, 
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock
} from "lucide-react";
import type { PlatformFileSummary, SchoolFileSummary, StorageHealthIssue } from "@/lib/files/file-types";
import { formatFileSize } from "@/lib/files/file-types";

type PlatformFilesViewProps = {
  data: {
    summary: PlatformFileSummary;
    schools: SchoolFileSummary[];
    recentImports: Array<{
      id: string;
      schoolId: string;
      schoolName: string | null;
      jobType: string;
      status: string;
      createdAt: string;
    }>;
    recentExports: Array<{
      id: string;
      schoolId: string;
      schoolName: string | null;
      exportType: string;
      status: string;
      createdAt: string;
    }>;
    healthIssues: StorageHealthIssue[];
  };
};

export function PlatformFilesView({ data }: PlatformFilesViewProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Platform Files
        </h1>
        <p className="mt-1 text-muted-foreground">
          Monitor file storage, imports, exports and document-system health across SchoolDB.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total stored files"
          value={data.summary.totalStoredFiles.toLocaleString()}
          icon={FileText}
        />
        <SummaryCard
          title="Storage used"
          value={formatFileSize(data.summary.storageUsed)}
          icon={HardDrive}
        />
        <SummaryCard
          title="Schools using storage"
          value={data.summary.schoolsUsingStorage.toLocaleString()}
          icon={School}
        />
        <SummaryCard
          title="Failed or missing files"
          value={data.summary.failedOrMissingFiles.toLocaleString()}
          icon={AlertTriangle}
          highlight={data.summary.failedOrMissingFiles > 0}
        />
      </div>

      {/* Additional operational cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Recent imports"
          value={data.summary.recentImports.toLocaleString()}
          icon={Upload}
        />
        <SummaryCard
          title="Recent exports"
          value={data.summary.recentExports.toLocaleString()}
          icon={Download}
        />
        <SummaryCard
          title="Orphaned objects"
          value={data.summary.orphanedObjects.toLocaleString()}
          icon={AlertTriangle}
          highlight={data.summary.orphanedObjects > 0}
        />
        <SummaryCard
          title="Security warnings"
          value={data.summary.securityWarnings.toLocaleString()}
          icon={Shield}
          highlight={data.summary.securityWarnings > 0}
        />
      </div>

      {/* Platform Administration Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="storage-health">Storage Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Aggregate storage and metadata health across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Metadata Records</p>
                    <p className="text-2xl font-bold">{data.summary.totalStoredFiles.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Schools</p>
                    <p className="text-2xl font-bold">{data.summary.schoolsUsingStorage.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Activity (30 days)</p>
                    <p className="text-2xl font-bold">
                      {(data.summary.recentImports + data.summary.recentExports).toLocaleString()} jobs
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Issues</p>
                    <p className="text-2xl font-bold text-destructive">
                      {(data.summary.failedOrMissingFiles + data.summary.orphanedObjects).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Storage Overview</CardTitle>
              <CardDescription>
                File storage and health metrics by school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">School</th>
                      <th className="text-right p-2">Stored Files</th>
                      <th className="text-right p-2">Storage Used</th>
                      <th className="text-right p-2">Imports</th>
                      <th className="text-right p-2">Exports</th>
                      <th className="text-right p-2">Missing</th>
                      <th className="text-right p-2">Orphaned</th>
                      <th className="text-right p-2">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.schools.map((school) => (
                      <tr key={school.schoolId} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{school.schoolName}</td>
                        <td className="text-right p-2">{school.storedFileCount.toLocaleString()}</td>
                        <td className="text-right p-2">{formatFileSize(school.storageUsed)}</td>
                        <td className="text-right p-2">{school.imports.toLocaleString()}</td>
                        <td className="text-right p-2">{school.exports.toLocaleString()}</td>
                        <td className="text-right p-2">{school.missingObjects.toLocaleString()}</td>
                        <td className="text-right p-2">{school.orphanedObjects.toLocaleString()}</td>
                        <td className="text-right p-2">
                          {school.lastFileActivity ? new Date(school.lastFileActivity).toLocaleDateString() : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Import Jobs</CardTitle>
              <CardDescription>
                Recent import operations across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentImports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent import jobs
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentImports.map((import_) => (
                    <div key={import_.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{import_.jobType}</p>
                          <p className="text-sm text-muted-foreground">{import_.schoolName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={import_.status === "completed" ? "default" : "destructive"}>
                          {import_.status}
                        </Badge>
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
              <CardTitle>Recent Export Jobs</CardTitle>
              <CardDescription>
                Recent export operations across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentExports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent export jobs
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentExports.map((export_) => (
                    <div key={export_.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{export_.exportType}</p>
                          <p className="text-sm text-muted-foreground">{export_.schoolName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={export_.status === "completed" ? "default" : "destructive"}>
                          {export_.status}
                        </Badge>
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
              <CardTitle>Storage Health Issues</CardTitle>
              <CardDescription>
                Metadata records with missing or orphaned storage objects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.healthIssues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No storage health issues detected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.healthIssues.map((issue) => (
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
                            {issue.source} - {issue.schoolName}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        issue.severity === "critical" ? "destructive" :
                        issue.severity === "high" ? "secondary" :
                        "outline"
                      }>
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>
                File security configuration and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Storage Access Control</p>
                    <p className="text-sm text-muted-foreground">
                      All private buckets remain secure with RLS policies enabled
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Signed URL Expiration</p>
                    <p className="text-sm text-muted-foreground">
                      All file access uses short-lived signed URLs (60-120 seconds)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">
                      All file operations are logged for compliance and security monitoring
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
  value: string; 
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
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
