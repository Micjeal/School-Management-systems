"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations/providers";
import type { IntegrationProviderDefinition } from "@/lib/integrations/providers";

interface ProviderPickerProps {
  selectedProvider?: string;
}

export function ProviderPicker({ selectedProvider }: ProviderPickerProps) {
  const typeLabels: Record<IntegrationProviderDefinition["integrationType"], string> = {
    payments: "Payments",
    accounting: "Accounting",
    messaging: "Messaging",
    identity: "Identity",
    learning: "Learning",
    storage: "Storage",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {INTEGRATION_PROVIDERS.map((provider) => {
        const ProviderIcon = provider.icon;
        const isImplemented = provider.implemented;
        const isSelected = selectedProvider === provider.code;

        return (
          <Card
            key={provider.code}
            className={`transition-colors ${
              isSelected ? "border-primary" : ""
            } ${!isImplemented ? "opacity-60" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ProviderIcon className="h-5 w-5" />
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                </div>
                {!isImplemented && (
                  <Badge>Coming soon</Badge>
                )}
              </div>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Badge>{typeLabels[provider.integrationType]}</Badge>
                {provider.supportsOAuth && (
                  <Badge>OAuth</Badge>
                )}
              </div>
              {isImplemented && (
                <Link href={`/app/modules/integrations/new?provider=${provider.code}`}>
                  <Button
                    className="mt-4 w-full"
                    variant={isSelected ? "primary" : "secondary"}
                  >
                    {isSelected ? "Selected" : "Connect"}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
