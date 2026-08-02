/**
 * Types for integration events system
 */

export type IntegrationEventDirection = "inbound" | "outbound";

export type IntegrationEventStatus =
  | "received"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "ignored"
  | "dead_letter";

export interface IntegrationEvent {
  id: bigint;
  school_id: string | null;
  integration_connection_id: string | null;
  provider_event_id: string | null;
  event_type: string;
  direction: IntegrationEventDirection;
  status: IntegrationEventStatus;
  payload: unknown;
  payload_hash: string | null;
  idempotency_key: string | null;
  retry_count: number;
  next_retry_at: string | null;
  processed_at: string | null;
  error_message: string | null;
  received_at: string;
}

export interface IntegrationEventWithConnection extends IntegrationEvent {
  connection_name?: string | null;
  connection_provider?: string | null;
  connection_status?: string | null;
  school_name?: string | null;
}

export interface IntegrationEventSummary {
  totalEvents: number;
  processing: number;
  failed: number;
  deadLetter: number;
  completionRate: number | null;
}

export interface IntegrationEventFilters {
  search?: string;
  connectionId?: string;
  provider?: string;
  eventType?: string;
  direction?: IntegrationEventDirection;
  status?: IntegrationEventStatus;
  startDate?: string;
  endDate?: string;
  hasError?: "all" | "yes" | "no" | "retry";
}

export interface RetryResult {
  success: boolean;
  error?: string;
  eventId: bigint;
}
