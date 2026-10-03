import { redirect } from "next/navigation";
export default async function DormitoryPage({ params }: { params: Promise<{ hostelId: string }> }) { const { hostelId } = await params; redirect(`/app/modules/hostels/${hostelId}`); }
