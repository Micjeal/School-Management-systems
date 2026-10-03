import { redirect } from "next/navigation";
export default async function RoutePage({ params }: { params: Promise<{ routeId: string }> }) { const { routeId } = await params; redirect(`/app/modules/transport-routes/${routeId}`); }
