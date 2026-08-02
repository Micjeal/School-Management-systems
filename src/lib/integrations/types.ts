export type IntegrationStatus = "inactive" | "active" | "error" | "disabled";

export type IntegrationDirection = "inbound" | "outbound";

export type IntegrationEventStatus =
  | "received"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "ignored"
  | "dead_letter";

export type IntegrationType =
  | "payments"
  | "accounting"
  | "messaging"
  | "identity"
  | "learning"
  | "storage";

export interface IntegrationConnection {
  id: string;
  school_id: string | null;
  provider: string;
  integration_type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  configuration: Record<string, unknown>;
  secret_reference: string | null;
  last_connected_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface IntegrationEvent {
  id: number;
  school_id: string | null;
  integration_connection_id: string | null;
  provider_event_id: string | null;
  event_type: string;
  direction: IntegrationDirection;
  status: IntegrationEventStatus;
  payload: Record<string, unknown>;
  payload_hash: string | null;
  idempotency_key: string | null;
  retry_count: number;
  next_retry_at: string | null;
  processed_at: string | null;
  error_message: string | null;
  received_at: string;
}

export interface IntegrationCredentials {
  // Credentials are stored securely and never exposed to the browser
  // This type is used only in server-side code
  [key: string]: string | number | boolean;
}

export interface TestResult {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ProcessResult {
  success: boolean;
  error?: string;
  shouldRetry?: boolean;
  retryDelay?: number;
}

export interface IntegrationAdapter {
  testConnection(
    connection: IntegrationConnection,
    credentials: IntegrationCredentials,
  ): Promise<TestResult>;

  processInboundEvent?(
    event: IntegrationEvent,
    connection: IntegrationConnection,
    credentials: IntegrationCredentials,
  ): Promise<ProcessResult>;

  processOutboundEvent?(
    event: IntegrationEvent,
    connection: IntegrationConnection,
    credentials: IntegrationCredentials,
  ): Promise<ProcessResult>;
}

export interface IntegrationHealth {
  activeConnections: number;
  errorConnections: number;
  inboundEvents: number;
  failedEvents: number;
  hasActivity: boolean;
}
