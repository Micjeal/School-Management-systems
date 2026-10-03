import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
const links = [["vehicles","Vehicles"],["routes","Routes"],["stops","Stops"],["assignments","Student assignments"]] as const;
export default async function TransportPage() { await requireUserContext("transport.manage"); return <div><PageHeader title="Transport" description="Manage fleet, routes, stops, and student transport assignments."/><div className="grid gap-4 sm:grid-cols-2">{links.map(([href,label]) => <Link key={href} href={`/app/transport/${href}`}><Card className="h-full hover:shadow-md"><CardContent><h2 className="font-semibold">{label}</h2></CardContent></Card></Link>)}</div></div>; }
