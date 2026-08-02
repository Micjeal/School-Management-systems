import { z } from "zod";
import { INTEGRATION_PROVIDERS } from "./providers";
import type { IntegrationStatus } from "./types";

export const integrationStatusSchema = z.enum([
  "inactive",
  "active",
  "error",
  "disabled",
]) satisfies z.ZodType<IntegrationStatus>;

export const integrationNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters");

export const providerCodeSchema = z.string().refine(
  (code) => INTEGRATION_PROVIDERS.some((p) => p.code === code),
  { message: "Invalid provider code" },
);

// Payment configuration schema
export const paymentConfigurationSchema = z.object({
  environment: z.enum(["sandbox", "production"]),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  merchantId: z.string().min(2).max(100),
  callbackMode: z.enum(["webhook", "polling"]).optional(),
}).strict();

// Accounting configuration schema
export const accountingConfigurationSchema = z.object({
  environment: z.enum(["sandbox", "production"]),
  companyId: z.string().min(2).max(100),
  syncMode: z.enum(["manual", "scheduled"]).optional(),
  autoSync: z.boolean().optional(),
}).strict();

// Messaging configuration schema
export const messagingConfigurationSchema = z.object({
  senderName: z.string().min(2).max(50),
  defaultCountry: z.string().length(2).optional(),
  deliveryCallbackEnabled: z.boolean().optional(),
}).strict();

// Identity configuration schema
export const identityConfigurationSchema = z.object({
  clientId: z.string().min(2).max(200),
  domain: z.string().url(),
  scopes: z.array(z.string()).optional(),
}).strict();

// Learning configuration schema
export const learningConfigurationSchema = z.object({
  institutionId: z.string().min(2).max(100),
  syncStudents: z.boolean().optional(),
  syncCourses: z.boolean().optional(),
  syncEnrollments: z.boolean().optional(),
}).strict();

// Storage configuration schema
export const storageConfigurationSchema = z.object({
  bucketName: z.string().min(3).max(63),
  region: z.string().min(2).max(50),
  accessLevel: z.enum(["private", "public-read"]).optional(),
}).strict();

// Generic configuration schema for unknown providers
export const genericConfigurationSchema = z.object({}).strict();

export function getConfigurationSchema(providerCode: string): z.ZodSchema {
  const provider = INTEGRATION_PROVIDERS.find((p) => p.code === providerCode);

  if (!provider) {
    return genericConfigurationSchema;
  }

  switch (provider.integrationType) {
    case "payments":
      return paymentConfigurationSchema;
    case "accounting":
      return accountingConfigurationSchema;
    case "messaging":
      return messagingConfigurationSchema;
    case "identity":
      return identityConfigurationSchema;
    case "learning":
      return learningConfigurationSchema;
    case "storage":
      return storageConfigurationSchema;
    default:
      return genericConfigurationSchema;
  }
}

export function validateIntegrationConnection(data: unknown) {
  const schema = z.object({
    name: integrationNameSchema,
    provider: providerCodeSchema,
    status: integrationStatusSchema.optional(),
  });

  return schema.safeParse(data);
}

export function validateConfiguration(providerCode: string, configuration: unknown) {
  const schema = getConfigurationSchema(providerCode);
  return schema.safeParse(configuration);
}

export function sanitizeConfiguration(
  providerCode: string,
  configuration: Record<string, unknown>,
): Record<string, unknown> {
  const schema = getConfigurationSchema(providerCode);
  const result = schema.safeParse(configuration);

  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }

  // Strip unknown keys by parsing through the strict schema
  return result.data as Record<string, unknown>;
}

// Check for secret values in configuration (should not be stored here)
export function containsSecretValues(configuration: Record<string, unknown>): boolean {
  const secretKeys = [
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
  ];

  const keys = Object.keys(configuration).map((k) => k.toLowerCase());

  return secretKeys.some((secretKey) => keys.includes(secretKey));
}
