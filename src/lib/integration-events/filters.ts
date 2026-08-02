/**
 * Filter utilities for integration events
 */

import type { IntegrationEventFilters } from "./types";

const VALID_DIRECTIONS = new Set(["inbound", "outbound"]);
const VALID_STATUSES = new Set([
  "received",
  "queued",
  "processing",
  "completed",
  "failed",
  "ignored",
  "dead_letter",
]);
const VALID_ERROR_FILTERS = new Set(["all", "yes", "no", "retry"]);

export function buildEventFilters(searchParams: {
  search?: string;
  connectionId?: string;
  provider?: string;
  eventType?: string;
  direction?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  hasError?: string;
}): IntegrationEventFilters {
  const filters: IntegrationEventFilters = {};

  if (searchParams.search && searchParams.search.trim()) {
    filters.search = searchParams.search.trim();
  }

  if (searchParams.connectionId && searchParams.connectionId.trim()) {
    filters.connectionId = searchParams.connectionId.trim();
  }

  if (searchParams.provider && searchParams.provider.trim()) {
    filters.provider = searchParams.provider.trim();
  }

  if (searchParams.eventType && searchParams.eventType.trim()) {
    filters.eventType = searchParams.eventType.trim();
  }

  if (searchParams.direction && VALID_DIRECTIONS.has(searchParams.direction)) {
    filters.direction = searchParams.direction as IntegrationEventFilters["direction"];
  }

  if (searchParams.status && VALID_STATUSES.has(searchParams.status)) {
    filters.status = searchParams.status as IntegrationEventFilters["status"];
  }

  if (searchParams.startDate && isValidDate(searchParams.startDate)) {
    filters.startDate = searchParams.startDate;
  }

  if (searchParams.endDate && isValidDate(searchParams.endDate)) {
    filters.endDate = searchParams.endDate;
  }

  if (searchParams.hasError && VALID_ERROR_FILTERS.has(searchParams.hasError)) {
    filters.hasError = searchParams.hasError as IntegrationEventFilters["hasError"];
  }

  return filters;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function filtersToQueryParams(filters: IntegrationEventFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.connectionId) params.set("connectionId", filters.connectionId);
  if (filters.provider) params.set("provider", filters.provider);
  if (filters.eventType) params.set("eventType", filters.eventType);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.status) params.set("status", filters.status);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.hasError) params.set("hasError", filters.hasError);

  return params.toString();
}

export function getScopeLabel(
  schoolId: string | null,
  schoolName: string | null,
): string {
  if (schoolId === null) {
    return "Platform";
  }
  return schoolName || "Unknown School";
}
