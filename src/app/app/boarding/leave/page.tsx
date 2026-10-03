import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
export default async function BoardingLeavePage() { await requireUserContext("boarding.manage"); return <div><PageHeader title="Boarding leave" description="Student exeat and leave records" /><EmptyState title="This feature is not yet configured." description="The current database schema has no boarding leave persistence model." /></div>; }
