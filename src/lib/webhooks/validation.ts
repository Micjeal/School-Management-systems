import { isValidEventType } from "./event-types";

// Private network ranges that should be rejected
const PRIVATE_NETWORK_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./i,
  /^https?:\/\/0\.0\.0\.0/i,
  /^https?:\/\/10\./i,
  /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./i,
  /^https?:\/\/192\.168\./i,
  /^https?:\/\/169\.254\./i, // AWS metadata
  /^https?:\/\/::1$/i,
  /^https?:\/\/\[::1\]/i,
  /^file:\/\//i,
];

// Cloud metadata addresses that should be rejected
const METADATA_ADDRESSES = [
  "169.254.169.254",
];

const VALID_STATUSES = ["active", "paused", "disabled"] as const;
const VALID_DELIVERY_STATUSES = ["queued", "processing", "delivered", "failed", "dead_letter"] as const;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateWebhookName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required." });
  } else if (name.length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters." });
  } else if (name.length > 100) {
    errors.push({ field: "name", message: "Name must not exceed 100 characters." });
  }

  return { valid: errors.length === 0, errors };
}

export function validateWebhookURL(url: string, allowLocalhost = false): ValidationResult {
  const errors: ValidationError[] = [];

  if (!url || url.trim().length === 0) {
    errors.push({ field: "url", message: "URL is required." });
    return { valid: false, errors };
  }

  try {
    const parsed = new URL(url);

    // Must be HTTPS in production
    if (!allowLocalhost && parsed.protocol !== "https:") {
      errors.push({ field: "url", message: "URL must use HTTPS in production." });
    }

    // Reject URLs with username/password
    if (parsed.username || parsed.password) {
      errors.push({ field: "url", message: "URL must not include username or password." });
    }

    // Reject private network addresses
    if (!allowLocalhost) {
      for (const pattern of PRIVATE_NETWORK_PATTERNS) {
        if (pattern.test(url)) {
          errors.push({ field: "url", message: "URL must not point to private or loopback networks." });
          break;
        }
      }

      // Check for cloud metadata addresses
      const hostname = parsed.hostname;
      if (METADATA_ADDRESSES.includes(hostname)) {
        errors.push({ field: "url", message: "URL must not point to cloud metadata addresses." });
      }
    }
  } catch {
    errors.push({ field: "url", message: "URL is invalid." });
  }

  return { valid: errors.length === 0, errors };
}

export function validateEventTypes(eventTypes: string[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!eventTypes || eventTypes.length === 0) {
    errors.push({ field: "event_types", message: "At least one event type must be selected." });
    return { valid: false, errors };
  }

  for (const eventType of eventTypes) {
    if (!isValidEventType(eventType)) {
      errors.push({
        field: "event_types",
        message: `Event type "${eventType}" is not supported.`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateWebhookStatus(status: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!status) {
    errors.push({ field: "status", message: "Status is required." });
  } else if (!VALID_STATUSES.includes(status as any)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateSecretReference(secretReference: string | null | undefined): ValidationResult {
  const errors: ValidationError[] = [];

  if (secretReference && secretReference.trim().length > 0) {
    // Basic format validation - should look like an environment variable reference
    if (!/^[A-Z_][A-Z0-9_]*$/.test(secretReference)) {
      errors.push({
        field: "secret_reference",
        message: "Secret reference must be a valid environment variable name (uppercase letters, numbers, underscores).",
      });
    }

    // Reject obviously insecure values
    const insecurePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /api[_-]?key/i,
    ];

    for (const pattern of insecurePatterns) {
      if (pattern.test(secretReference)) {
        errors.push({
          field: "secret_reference",
          message: "Secret reference must not contain sensitive keywords.",
        });
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateWebhookEndpoint(data: {
  name: string;
  url: string;
  event_types: string[];
  status: string;
  secret_reference?: string | null;
}, allowLocalhost = false): ValidationResult {
  const errors: ValidationError[] = [];

  const nameResult = validateWebhookName(data.name);
  errors.push(...nameResult.errors);

  const urlResult = validateWebhookURL(data.url, allowLocalhost);
  errors.push(...urlResult.errors);

  const eventTypesResult = validateEventTypes(data.event_types);
  errors.push(...eventTypesResult.errors);

  const statusResult = validateWebhookStatus(data.status);
  errors.push(...statusResult.errors);

  const secretResult = validateSecretReference(data.secret_reference);
  errors.push(...secretResult.errors);

  return { valid: errors.length === 0, errors };
}

export function validateDeliveryStatus(status: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!status) {
    errors.push({ field: "status", message: "Status is required." });
  } else if (!VALID_DELIVERY_STATUSES.includes(status as any)) {
    errors.push({
      field: "status",
      message: `Delivery status must be one of: ${VALID_DELIVERY_STATUSES.join(", ")}.`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateSchoolId(schoolId: string | null): ValidationResult {
  const errors: ValidationError[] = [];

  if (schoolId !== null) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(schoolId)) {
        errors.push({ field: "school_id", message: "School ID must be a valid UUID." });
      }
    } catch {
      errors.push({ field: "school_id", message: "School ID is invalid." });
    }
  }

  return { valid: errors.length === 0, errors };
}
