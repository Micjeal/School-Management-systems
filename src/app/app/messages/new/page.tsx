import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createConversation } from "@/app/app/messages/actions";

export default async function NewConversationPage() {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  
  const { data: members } = await (supabase.from("school_memberships") as any)
    .select("user_id,profiles(first_name,last_name)")
    .eq("school_id", context.active_school_id)
    .eq("status", "active")
    .neq("user_id", context.user_id);

  return (
    <div>
      <PageHeader 
        title="New Conversation" 
        description="Start a new conversation with school members"
        backHref="/app/messages"
      />
      <Card>
        <CardContent>
          <form action={createConversation} className="space-y-4">
            <div>
              <Label>Conversation Type</Label>
              <Select name="conversation_type" required defaultValue="direct">
                <option value="direct">Direct (1-on-1)</option>
                <option value="group">Group</option>
                <option value="class">Class</option>
                <option value="support">Support</option>
              </Select>
            </div>
            <div>
              <Label>Title (optional)</Label>
              <Input name="title" placeholder="Conversation title" />
            </div>
            <div>
              <Label>Members</Label>
              <Select name="member_user_ids" multiple required>
                <option value="">Select members</option>
                {(members ?? []).map((m: any) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profiles?.first_name} {m.profiles?.last_name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-slate-500 mt-1">For direct conversations, select exactly one member</p>
            </div>
            <Button type="submit">Create Conversation</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
