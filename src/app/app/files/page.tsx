import { requireUserContext } from "@/lib/auth/context";

import {
  getFileSummary,
  getMyFiles,
} from "@/lib/files/get-my-files";

import type {
  MyFileFilters,
  MyFileItem,
} from "@/lib/files/file-types";

import { FileSummary } from "@/components/files/file-summary";
import { FileFilters } from "@/components/files/file-filters";
import { FileList } from "@/components/files/file-list";
import { FileEmptyState } from "@/components/files/file-empty-state";
import { RefreshFilesButton } from "@/components/files/refresh-files-button";

type FilesPageSearchParams = {
  category?: string;
  status?: string;
  search?: string;
};

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<FilesPageSearchParams>;
}) {
  const context =
    await requireUserContext();

  const params =
    await searchParams;

  if (
    !context.active_school_id &&
    !context.is_platform_admin
  ) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold">
          Select a school
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a school first to view
          your private files.
        </p>
      </div>
    );
  }

  const filters: MyFileFilters = {
    category:
      params.category ||
      undefined,

    status:
      params.status ||
      undefined,

    search:
      params.search ||
      undefined,
  };

  const result =
    await getMyFiles(
      context.active_school_id,
      filters,
    );

  const files: MyFileItem[] =
    Array.isArray(result?.files)
      ? result.files
      : [];

  const summary =
    getFileSummary(files);

  const memberships =
    Array.isArray(
      context.memberships,
    )
      ? context.memberships
      : [];

  const activeMembership =
    memberships.find(
      (membership) =>
        membership.school_id ===
        context.active_school_id,
    );

  const scopeLabel =
    context.is_platform_admin &&
    !context.active_school_id
      ? "Platform"
      : activeMembership
          ?.school_name ??
        "Selected school";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Private files
          </h1>

          <p className="mt-1 text-muted-foreground">
            Your personal documents,
            published records and
            authorized downloads.
          </p>
        </div>

        <RefreshFilesButton />
      </header>

      <div className="text-sm text-muted-foreground">
        {scopeLabel} files
      </div>

      <FileSummary
        summary={summary}
      />

      <FileFilters />

      {files.length === 0 ? (
        <FileEmptyState
          category={
            params.category
          }
        />
      ) : (
        <FileList
          files={files}
        />
      )}
    </div>
  );
}