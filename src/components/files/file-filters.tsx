"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getCategoryFilterLabel, getStatusFilterLabel } from "@/lib/files/file-paths";

export function FileFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "all";
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/app/files?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Category:</label>
        <select
          value={category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Files</option>
          <option value="documents">My Documents</option>
          <option value="academic">Academic</option>
          <option value="financial">Financial</option>
          <option value="attachments">Attachments</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="published">Issued</option>
          <option value="voided">Voided</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="active">Active</option>
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
