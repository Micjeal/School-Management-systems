/**
 * Payload redaction utilities for integration events
 * Safely redacts sensitive information from event payloads
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "client_secret",
  "api_key",
  "national_id",
  "bank_account",
  "account_number",
  "card_number",
  "cvv",
  "medical_notes",
  "counselling_notes",
  "ssn",
  "social_security_number",
  "credit_card",
  "pin",
  "private_key",
  "auth_token",
  "bearer_token",
  "session_token",
  "csrf_token",
  "jwt",
  "oauth_token",
]);

const SENSITIVE_PATTERNS = [
  // Credit card numbers (basic pattern)
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  // API keys (common patterns)
  /[a-zA-Z0-9]{32,}/g,
  // Email addresses (partial redaction)
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
];

/**
 * Recursively redacts sensitive keys from a value
 */
export function redactPayload(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactPayload);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? "[REDACTED]"
        : redactPayload(child);
    }
    return result;
  }

  return value;
}

/**
 * Redacts sensitive patterns from strings
 */
function redactString(str: string): string {
  let result = str;

  // Redact credit card-like patterns
  result = result.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[REDACTED]");

  // Redact long alphanumeric strings that might be API keys
  result = result.replace(/[a-zA-Z0-9]{32,}/g, (match) => {
    // Only redact if it looks like an API key (no spaces, mixed case)
    if (!match.includes(" ") && /[a-z]/.test(match) && /[A-Z]/.test(match) && /\d/.test(match)) {
      return "[REDACTED]";
    }
    return match;
  });

  // Partially redact email addresses
  result = result.replace(/\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+)\.([A-Z|a-z]{2,})\b/g, (match, local, domain, tld) => {
    const localPart = local.length > 2 ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1] : "***";
    return `${localPart}@${domain}.${tld}`;
  });

  return result;
}

/**
 * Checks if a key name is sensitive
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

/**
 * Gets a list of all sensitive keys found in an object
 */
export function findSensitiveKeys(value: unknown): string[] {
  const keys = new Set<string>();

  function traverse(obj: unknown) {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }

    if (typeof obj === "object") {
      for (const [key, child] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          keys.add(key);
        }
        traverse(child);
      }
    }
  }

  traverse(value);
  return Array.from(keys);
}
