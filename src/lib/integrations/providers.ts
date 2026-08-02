import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calculator,
  Mail,
  MessageSquare,
  ShieldCheck,
  Cloud,
  GraduationCap,
} from "lucide-react";

export type IntegrationProviderDefinition = {
  code: string;
  name: string;
  description: string;
  integrationType:
    | "payments"
    | "accounting"
    | "messaging"
    | "identity"
    | "learning"
    | "storage";
  icon: LucideIcon;
  implemented: boolean;
  supportsOAuth: boolean;
  supportsInbound: boolean;
  supportsOutbound: boolean;
};

export const INTEGRATION_PROVIDERS: readonly IntegrationProviderDefinition[] = [
  {
    code: "example_payment",
    name: "Example Payment Provider",
    description: "Receive and reconcile payments.",
    integrationType: "payments",
    icon: Banknote,
    implemented: true,
    supportsOAuth: false,
    supportsInbound: true,
    supportsOutbound: true,
  },
  {
    code: "example_accounting",
    name: "Example Accounting Provider",
    description: "Sync financial data with accounting systems.",
    integrationType: "accounting",
    icon: Calculator,
    implemented: false,
    supportsOAuth: false,
    supportsInbound: true,
    supportsOutbound: true,
  },
  {
    code: "example_sms",
    name: "Example SMS Provider",
    description: "Send SMS notifications and alerts.",
    integrationType: "messaging",
    icon: MessageSquare,
    implemented: false,
    supportsOAuth: false,
    supportsInbound: false,
    supportsOutbound: true,
  },
  {
    code: "example_email",
    name: "Example Email Provider",
    description: "Transactional email delivery.",
    integrationType: "messaging",
    icon: Mail,
    implemented: false,
    supportsOAuth: false,
    supportsInbound: false,
    supportsOutbound: true,
  },
  {
    code: "example_identity",
    name: "Example Identity Provider",
    description: "Single sign-on and user authentication.",
    integrationType: "identity",
    icon: ShieldCheck,
    implemented: false,
    supportsOAuth: true,
    supportsInbound: true,
    supportsOutbound: false,
  },
  {
    code: "example_learning",
    name: "Example Learning Platform",
    description: "Sync courses and student progress.",
    integrationType: "learning",
    icon: GraduationCap,
    implemented: false,
    supportsOAuth: false,
    supportsInbound: true,
    supportsOutbound: true,
  },
  {
    code: "example_storage",
    name: "Example Cloud Storage",
    description: "Secure document and file storage.",
    integrationType: "storage",
    icon: Cloud,
    implemented: false,
    supportsOAuth: true,
    supportsInbound: false,
    supportsOutbound: true,
  },
];

export function getProviderByCode(code: string): IntegrationProviderDefinition | undefined {
  return INTEGRATION_PROVIDERS.find((p) => p.code === code);
}

export function getProvidersByType(type: IntegrationProviderDefinition["integrationType"]): IntegrationProviderDefinition[] {
  return INTEGRATION_PROVIDERS.filter((p) => p.integrationType === type);
}

export function getImplementedProviders(): IntegrationProviderDefinition[] {
  return INTEGRATION_PROVIDERS.filter((p) => p.implemented);
}
