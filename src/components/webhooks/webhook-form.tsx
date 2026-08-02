"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { WEBHOOK_EVENT_TYPES } from "@/lib/webhooks/event-types";
import { createWebhookEndpointAction, updateWebhookEndpointAction } from "@/app/app/modules/webhooks/actions";

interface WebhookFormProps {
  endpoint?: {
    id: string;
    name: string;
    url: string;
    event_types: string[];
    status: string;
    secret_reference: string | null;
    version: number;
    school_id: string | null;
  };
  isPlatformAdmin: boolean;
  activeSchoolId: string | null;
  schools?: Array<{ id: string; name: string }>;
}

export function WebhookForm({ endpoint, isPlatformAdmin, activeSchoolId, schools = [] }: WebhookFormProps) {
  const router = useRouter();
  const isEditing = !!endpoint;

  const [name, setName] = useState(endpoint?.name || "");
  const [url, setUrl] = useState(endpoint?.url || "");
  const [eventTypes, setEventTypes] = useState<string[]>(endpoint?.event_types || []);
  const [status, setStatus] = useState(endpoint?.status || "active");
  const [secretReference, setSecretReference] = useState(endpoint?.secret_reference || "");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    endpoint?.school_id || (isPlatformAdmin ? null : activeSchoolId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEventTypeToggle = (code: string) => {
    setEventTypes((prev) =>
      prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]
    );
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        formData.set("version", String(endpoint?.version || 0));
        await updateWebhookEndpointAction(endpoint!.id, formData);
      } else {
        await createWebhookEndpointAction(formData);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Form submission error:", error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Accounting system"
          required
          minLength={2}
          maxLength={100}
        />
        <p className="text-sm text-slate-500">2-100 characters</p>
      </div>

      {isPlatformAdmin && (
        <div className="space-y-2">
          <Label htmlFor="school_id">Scope</Label>
          <Select
            id="school_id"
            name="school_id"
            value={selectedSchoolId || "__platform__"}
            onChange={(e) => setSelectedSchoolId(e.target.value === "__platform__" ? null : e.target.value)}
          >
            <option value="__platform__">Platform-wide</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </Select>
          <p className="text-sm text-slate-500">
            Platform-wide endpoints receive events from all schools.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/hooks/schooldb"
          required
        />
        <p className="text-sm text-slate-500">
          Must use HTTPS. Cannot point to localhost or private networks.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Event Types</Label>
        <div className="space-y-2 border rounded-md p-4">
          {WEBHOOK_EVENT_TYPES.map((eventType) => (
            <div key={eventType.code} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`event-${eventType.code}`}
                name="event_types"
                value={eventType.code}
                checked={eventTypes.includes(eventType.code)}
                onChange={() => handleEventTypeToggle(eventType.code)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label
                htmlFor={`event-${eventType.code}`}
                className="text-sm font-normal cursor-pointer"
              >
                {eventType.label}
                <span className="ml-2 text-xs text-slate-500">({eventType.scope})</span>
              </Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Select which events this endpoint should receive.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="disabled">Disabled</option>
        </Select>
        <p className="text-sm text-slate-500">
          Active endpoints will receive events. Paused endpoints retain configuration but stop deliveries.
        </p>
      </div>

      {isPlatformAdmin && (
        <div className="space-y-2">
          <Label htmlFor="secret_reference">Signing Secret Reference</Label>
          <Input
            id="secret_reference"
            name="secret_reference"
            value={secretReference}
            onChange={(e) => setSecretReference(e.target.value)}
            placeholder="WEBHOOK_SECRET_ACCOUNTING_SYSTEM"
          />
          <p className="text-sm text-slate-500">
            Environment variable name containing the signing secret. Only platform administrators may configure this.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Endpoint" : "Create Endpoint"}
        </Button>
      </div>
    </form>
  );
}
