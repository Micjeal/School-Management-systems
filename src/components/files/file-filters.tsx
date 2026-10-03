"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getCategoryFilterLabel, getStatusFilterLabel } from "@/lib/files/file-paths";

interface FileFiltersProps {
  filterType?: "personal" | "role" | "platform";
}

export function FileFilters({ filterType = "personal" }: FileFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const fileType = searchParams.get("fileType") || "all";
  const department = searchParams.get("department") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/app/files?${params.toString()}`);
  };

  const categoryOptions = filterType === "role" ? [
    { value: "all", label: "All Types" },
    { value: "person_document", label: "Documents" },
    { value: "report_card", label: "Academic" },
    { value: "payment_receipt", label: "Financial" },
    { value: "message_attachment", label: "Attachments" },
    { value: "application_document", label: "Admissions" },
    { value: "assessment_file", label: "Assessments" },
    { value: "import", label: "Imports" },
    { value: "export", label: "Exports" },
    { value: "school_branding", label: "Branding" },
  ] : [
    { value: "all", label: "All Files" },
    { value: "documents", label: "Documents" },
    { value: "academic", label: "Academic" },
    { value: "financial", label: "Financial" },
    { value: "attachments", label: "Attachments" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "issued", label: "Issued" },
    { value: "voided", label: "Voided" },
    { value: "expiring", label: "Expiring Soon" },
    { value: "expired", label: "Expired" },
    { value: "available", label: "Available" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Category:</label>
        <select
          value={category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filterType === "role" && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">File Type:</label>
            <select
              value={fileType}
              onChange={(e) => updateFilter("fileType", e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="person_document">Person Document</option>
              <option value="report_card">Report Card</option>
              <option value="payment_receipt">Payment Receipt</option>
              <option value="message_attachment">Message Attachment</option>
              <option value="application_document">Application Document</option>
              <option value="assessment_file">Assessment File</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
              <option value="school_branding">Branding</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Department:</label>
            <select
              value={department}
              onChange={(e) => updateFilter("department", e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              <option value="academic">Academic</option>
              <option value="finance">Finance</option>
              <option value="health">Health</option>
              <option value="admissions">Admissions</option>
              <option value="hr">HR</option>
              <option value="school">School</option>
            </select>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Search:</label>
        <input
          type="text"
          value={search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search files..."
          className="border rounded px-3 py-2 text-sm w-64"
        />
      </div>
    </div>
  );
}
