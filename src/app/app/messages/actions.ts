"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function createConversation(formData: FormData) {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const title = formData.get("title") as string;
  const conversationType = formData.get("conversation_type") as string;
  const memberUserIds = formData.getAll("member_user_ids") as string[];

  if (!conversationType || !memberUserIds || memberUserIds.length === 0) {
    redirect("/app/messages/new?error=Missing required fields");
  }

  const { error } = await supabase.rpc("create_conversation_with_members" as any, {
    target_school_id: context.active_school_id,
    target_title: title || null,
    target_conversation_type: conversationType,
    target_member_user_ids: memberUserIds,
  } as any);

  if (error) {
    redirect(`/app/messages/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/messages");
  redirect("/app/messages?message=Conversation created");
}

export async function sendMessage(formData: FormData) {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const conversationId = formData.get("conversation_id") as string;
  const body = formData.get("body") as string;

  if (!conversationId || !body?.trim()) {
    redirect("/app/messages?error=Invalid request");
  }

  const { error } = await supabase.rpc("send_conversation_message" as any, {
    target_conversation_id: conversationId,
    target_body: body,
  } as any);

  if (error) {
    redirect(`/app/messages/${conversationId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/messages/${conversationId}`);
  redirect(`/app/messages/${conversationId}`);
}

export async function markConversationRead(formData: FormData) {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const conversationId = formData.get("conversation_id") as string;

  if (!conversationId) {
    redirect("/app/messages?error=Invalid request");
  }

  const { error } = await supabase.rpc("mark_conversation_read" as any, {
    target_conversation_id: conversationId,
  } as any);

  if (error) {
    redirect(`/app/messages/${conversationId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/messages");
  redirect("/app/messages");
}

export async function closeConversation(formData: FormData) {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const conversationId = formData.get("conversation_id") as string;
  const closed = formData.get("closed") === "true";

  if (!conversationId) {
    redirect("/app/messages?error=Invalid request");
  }

  const { error } = await supabase.rpc("set_conversation_closed" as any, {
    target_conversation_id: conversationId,
    target_closed: closed,
  } as any);

  if (error) {
    redirect(`/app/messages/${conversationId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/messages");
  redirect("/app/messages");
}
