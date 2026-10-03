import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
const reports = [["students","Student register"],["attendance","Attendance summary"],["finance","Finance summary"]] as const;
export default async function ReportsPage() { await requireUserContext("reports.read"); return <div><PageHeader title="Reports" description="Allowlisted school reports with domain-specific authorization."/><div className="grid gap-4 sm:grid-cols-3">{reports.map(([href,label]) => <Link key={href} href={`/app/reports/${href}`}><Card className="h-full hover:shadow-md"><CardContent><h2 className="font-semibold">{label}</h2></CardContent></Card></Link>)}</div></div>; }
