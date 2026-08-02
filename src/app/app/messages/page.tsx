import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function MessagesPage() {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const { data: conversations } = await (supabase.from("conversations") as any)
    .select("*,conversation_members!inner(user_id,last_read_at,left_at)")
    .eq("school_id", context.active_school_id)
    .eq("conversation_members.user_id", context.user_id)
    .eq("conversation_members.left_at", null)
    .order("updated_at", { ascending: false });
    
  if (!conversations || conversations.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Messages" 
          description="Conversations and internal communications"
          actionHref="/app/messages/new"
          actionLabel="New Conversation"
        />
        <div className="mt-6 text-center py-12 text-slate-500">
          No conversations yet. Start a new conversation to get started.
        </div>
      </div>
    );
  }

  const columns = ["title", "conversation_type", "updated_at"];
  const rows = conversations.map((conv: any) => ({
    ...conv,
    title: conv.title || conv.conversation_type,
    updated_at: new Date(conv.updated_at).toLocaleDateString(),
    __recordKey: conv.id,
  }));

  return (
    <div>
      <PageHeader 
        title="Messages" 
        description="Conversations and internal communications"
        actionHref="/app/messages/new"
        actionLabel="New Conversation"
      />
      <DataTable 
        rows={rows} 
        columns={columns} 
        detailBase="/app/messages"
      />
    </div>
  );
}
