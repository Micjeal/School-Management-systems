import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
async function sign(secret: string, payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

Deno.serve(async (request) => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token || token !== serviceKey) return new Response("Forbidden", { status: 403 });
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: events, error } = await db.from("outbox_events").select("id,school_id,event_type,payload,created_at,attempt_count").eq("status", "pending").lte("available_at", new Date().toISOString()).limit(30);
    if (error) throw error;
    let delivered = 0;
    let failed = 0;
    for (const event of events ?? []) {
      const { data: claim } = await db.from("outbox_events").update({ status: "processing", attempt_count: event.attempt_count + 1 }).eq("id", event.id).eq("status", "pending").select("id").maybeSingle();
      if (!claim) continue;
      const { data: endpoints } = await db.from("webhook_endpoints").select("id,school_id,url,secret_reference").eq("status", "active").contains("event_types", [event.event_type]).or(`school_id.is.null,school_id.eq.${event.school_id}`);
      let eventFailed = false;
      for (const endpoint of endpoints ?? []) {
        const body = JSON.stringify({ id: event.id, type: event.event_type, school_id: event.school_id, created_at: event.created_at, data: event.payload });
        const secret = endpoint.secret_reference ? Deno.env.get(endpoint.secret_reference) ?? "" : "";
        try {
          const response = await fetch(endpoint.url, { method: "POST", headers: { "Content-Type": "application/json", "X-SchoolDB-Event": event.event_type, "X-SchoolDB-Signature": secret ? await sign(secret, body) : "" }, body });
          await db.from("webhook_deliveries").insert({ school_id: event.school_id, webhook_endpoint_id: endpoint.id, outbox_event_id: event.id, status: response.ok ? "delivered" : "failed", attempt_count: 1, response_status: response.status, response_body: (await response.text()).slice(0, 4000), delivered_at: response.ok ? new Date().toISOString() : null });
          if (!response.ok) eventFailed = true;
        } catch (deliveryError) {
          eventFailed = true;
          await db.from("webhook_deliveries").insert({ school_id: event.school_id, webhook_endpoint_id: endpoint.id, outbox_event_id: event.id, status: "failed", attempt_count: 1, error_message: deliveryError instanceof Error ? deliveryError.message.slice(0, 1000) : "Delivery failed" });
        }
      }
      await db.from("outbox_events").update({ status: eventFailed ? "failed" : "processed", processed_at: eventFailed ? null : new Date().toISOString(), last_error: eventFailed ? "One or more webhook deliveries failed" : null }).eq("id", event.id).eq("status", "processing");
      eventFailed ? failed++ : delivered++;
    }
    return Response.json({ processed: delivered + failed, delivered, failed });
  } catch (error) {
    console.error(JSON.stringify({ worker: "webhook", error: error instanceof Error ? error.message : "Unknown error" }));
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
});
