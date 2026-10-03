import { redirect } from "next/navigation";
export default async function VehiclePage({ params }: { params: Promise<{ vehicleId: string }> }) { const { vehicleId } = await params; redirect(`/app/modules/vehicles/${vehicleId}`); }
