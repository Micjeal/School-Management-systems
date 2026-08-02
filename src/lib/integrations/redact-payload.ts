/**
 * Redact sensitive information from integration event payloads
 * before displaying them in the UI.
 */

const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "client_secret",
  "api_key",
  "apiSecret",
  "apiKey",
  "private_key",
  "privateKey",
  "national_id",
  "bank_account",
  "card_number",
  "cardNumber",
  "cvv",
  "ssn",
  "social_security",
  "medical_notes",
  "credit_card",
  "pin",
  "otp",
  "auth",
  "credential",
  "key",
];

const SENSITIVE_PATTERNS = [
  // Credit card numbers (basic pattern)
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // SSN-like patterns
  /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  // API key-like patterns
  /\b[A-Za-z0-9]{20,}\b/g,
];

export function redactPayload(payload: unknown): unknown {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === "string") {
    return redactString(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => redactPayload(item));
  }

  if (typeof payload === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactPayload(value);
      }
    }
    return redacted;
  }

  return payload;
}

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
}

function redactString(str: string): string {
  let redacted = str;

  // Apply pattern-based redaction
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }

  return redacted;
}

/**
 * Check if a payload contains any sensitive information
 */
export function containsSensitiveData(payload: unknown): boolean {
  if (typeof payload === "string") {
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(payload)) {
        return true;
      }
    }
    return false;
  }

  if (Array.isArray(payload)) {
    return payload.some((item) => containsSensitiveData(item));
  }

  if (typeof payload === "object" && payload !== null) {
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (isSensitiveKey(key) || containsSensitiveData(value)) {
        return true;
      }
    }
  }

  return false;
}
