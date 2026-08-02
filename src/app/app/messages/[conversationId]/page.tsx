import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { sendMessage, markConversationRead, closeConversation } from "@/app/app/messages/actions";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const { data: conversation } = await (supabase.from("conversations") as any)
    .select("*,conversation_members(role,left_at)")
    .eq("id", conversationId)
    .eq("school_id", context.active_school_id)
    .single();
    
  if (!conversation) notFound();

  const { data: messages } = await (supabase.from("messages") as any)
    .select("*,sender_user_id,sender_profiles:profiles!sender_user_id(first_name,last_name)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHeader 
        title={conversation.title || conversation.conversation_type}
        description={conversation.conversation_type}
        backHref="/app/messages"
      />
      <Card className="mb-4">
        <CardContent className="max-h-96 overflow-y-auto space-y-3 p-4">
          {messages && messages.length > 0 ? (
            messages.map((msg: any) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender_user_id === context.user_id ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs rounded-lg p-3 ${
                  msg.sender_user_id === context.user_id 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 text-slate-900"
                }`}>
                  <p className="text-xs font-medium">
                    {msg.sender_user_id === context.user_id 
                      ? "You" 
                      : `${msg.sender_profiles?.first_name} ${msg.sender_profiles?.last_name}`}
                  </p>
                  <p className="mt-1 text-sm">{msg.body}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500">No messages yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form action={sendMessage} className="flex gap-2">
            <input type="hidden" name="conversation_id" value={conversationId} />
            <Textarea 
              name="body" 
              placeholder="Type your message..." 
              className="flex-1"
              rows={2}
              required
            />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>

      {conversation.conversation_members?.[0]?.role === "owner" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <form action={markConversationRead}>
                <input type="hidden" name="conversation_id" value={conversationId} />
                <Button variant="secondary" size="sm">Mark as Read</Button>
              </form>
              <form action={closeConversation}>
                <input type="hidden" name="conversation_id" value={conversationId} />
                <input type="hidden" name="closed" value="true" />
                <Button variant="danger" size="sm">Close Conversation</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
