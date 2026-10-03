import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (request) => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token || token !== serviceKey) return new Response("Forbidden", { status: 403 });
    const service = createClient(url, serviceKey, { auth: { persistSession: false } });
    const now = new Date().toISOString();
    const { data: jobs, error } = await service.from("notification_deliveries").select("id,school_id,notification_id,recipient_user_id,channel,recipient_address,status,attempt_count,last_attempt_at").in("status", ["queued", "retry"]).or(`last_attempt_at.is.null,last_attempt_at.lte.${now}`).limit(50);
    if (error) throw error;
    const endpoint = Deno.env.get("NOTIFICATION_PROVIDER_URL");
    const apiKey = Deno.env.get("NOTIFICATION_PROVIDER_KEY");
    let delivered = 0;
    let failed = 0;
    for (const job of jobs ?? []) {
      const { data: claimed } = await service.from("notification_deliveries").update({ status: "processing", attempt_count: job.attempt_count + 1, last_attempt_at: new Date().toISOString() }).eq("id", job.id).in("status", ["queued", "retry"]).select("id").maybeSingle();
      if (!claimed) continue;
      try {
        if (job.channel === "in_app") {
          await service.from("notification_deliveries").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", job.id).eq("status", "processing");
          delivered++;
          continue;
        }
        if (!endpoint) throw new Error("Notification provider not configured");
        const { data: notification, error: notificationError } = await service.from("notifications").select("title,body,data").eq("id", job.notification_id).eq("school_id", job.school_id).maybeSingle();
        if (notificationError || !notification) throw new Error("Notification content not found");
        const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) }, body: JSON.stringify({ channel: job.channel, recipient: job.recipient_address, notification }) });
        if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
        const result = await response.json().catch(() => ({}));
        await service.from("notification_deliveries").update({ status: "delivered", delivered_at: new Date().toISOString(), provider_message_id: typeof result.id === "string" ? result.id : null }).eq("id", job.id).eq("status", "processing");
        delivered++;
      } catch (deliveryError) {
        failed++;
        await service.from("notification_deliveries").update({ status: "failed", failed_at: new Date().toISOString(), error_message: deliveryError instanceof Error ? deliveryError.message.slice(0, 1000) : "Delivery failed" }).eq("id", job.id).eq("status", "processing");
      }
    }
    return Response.json({ processed: delivered + failed, delivered, failed });
  } catch (error) {
    console.error(JSON.stringify({ worker: "notification", error: error instanceof Error ? error.message : "Unknown error" }));
    return Response.json({ error: "Notification processing failed" }, { status: 500 });
  }
});
