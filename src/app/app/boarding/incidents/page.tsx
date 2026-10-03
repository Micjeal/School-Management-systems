import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
export default async function BoardingIncidentsPage() { await requireUserContext("boarding.manage"); return <div><PageHeader title="Boarding incidents" description="Boarding welfare and discipline incidents" /><EmptyState title="This feature is not yet configured." description="The current database schema has no boarding incidents table." /></div>; }
