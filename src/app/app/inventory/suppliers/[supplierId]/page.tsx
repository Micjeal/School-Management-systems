import { redirect } from "next/navigation";
export default async function SupplierPage({ params }: { params: Promise<{ supplierId: string }> }) { const { supplierId } = await params; redirect(`/app/modules/suppliers/${supplierId}`); }
