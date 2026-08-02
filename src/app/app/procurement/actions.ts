"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function createPurchaseOrder(formData: FormData) {
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const supplierId = formData.get("supplier_id") as string;
  const orderDate = formData.get("order_date") as string;
  const expectedDeliveryDate = formData.get("expected_delivery_date") as string;
  const currencyCode = formData.get("currency_code") as string;
  const notes = formData.get("notes") as string;
  const postNow = formData.get("post_now") === "true";

  if (!supplierId || !orderDate) {
    redirect("/app/procurement/orders/new?error=Missing required fields");
  }

  const lines: any[] = [];
  let index = 0;
  while (formData.get(`item_${index}`)) {
    const item = formData.get(`item_${index}`) as string;
    const quantity = Number(formData.get(`quantity_${index}`));
    const unitPrice = Number(formData.get(`unit_price_${index}`));
    const tax = Number(formData.get(`tax_${index}`) || 0);
    const description = formData.get(`description_${index}`) as string;

    if (item && quantity > 0 && unitPrice >= 0) {
      lines.push({
        inventory_item_id: item,
        quantity,
        unit_price: unitPrice,
        tax_amount: tax,
        description: description || null,
      });
    }
    index++;
  }

  if (lines.length === 0) {
    redirect("/app/procurement/orders/new?error=At least one line item is required");
  }

  const orderData = {
    supplier_id: supplierId,
    order_date: orderDate,
    expected_delivery_date: expectedDeliveryDate || null,
    currency_code: currencyCode || "UGX",
    notes: notes || null,
  };

  const { error } = await supabase.rpc("create_purchase_order_with_items" as any, {
    target_school_id: context.active_school_id,
    order_data: orderData,
    lines: lines,
  } as any);

  if (error) {
    redirect(`/app/procurement/orders/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/procurement");
  redirect("/app/procurement?message=Purchase order created");
}

export async function setPurchaseOrderStatus(formData: FormData) {
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const orderId = formData.get("order_id") as string;
  const status = formData.get("status") as string;

  if (!orderId || !status) {
    redirect("/app/procurement?error=Invalid request");
  }

  const { error } = await supabase.rpc("set_purchase_order_status" as any, {
    target_purchase_order_id: orderId,
    target_status: status,
  } as any);

  if (error) {
    redirect(`/app/procurement/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/procurement");
  redirect(`/app/procurement/orders/${orderId}?message=Status updated`);
}

export async function createGoodsReceipt(formData: FormData) {
  const context = await requireUserContext("inventory.manage");
  const supabase = await createClient();
  
  const purchaseOrderId = formData.get("purchase_order_id") as string;
  const goodsReceiptNumber = formData.get("goods_receipt_number") as string;
  const deliveryNoteNumber = formData.get("delivery_note_number") as string;
  const inventoryLocationId = formData.get("inventory_location_id") as string;
  const receivedAt = formData.get("received_at") as string;
  const notes = formData.get("notes") as string;
  const postNow = formData.get("post_now") === "true";

  if (!purchaseOrderId || !inventoryLocationId || !receivedAt) {
    redirect("/app/procurement/receipts/new?error=Missing required fields");
  }

  const lines: any[] = [];
  let index = 0;
  while (formData.get(`item_${index}_id`)) {
    const itemId = formData.get(`item_${index}_id`) as string;
    const inventoryId = formData.get(`item_${index}_inventory_id`) as string;
    const quantity = Number(formData.get(`item_${index}_quantity`));
    const cost = Number(formData.get(`item_${index}_cost`));
    const condition = formData.get(`item_${index}_condition`) as string;
    const reason = formData.get(`item_${index}_reason`) as string;

    if (itemId && quantity > 0) {
      lines.push({
        purchase_order_item_id: itemId,
        inventory_item_id: inventoryId,
        quantity_received: quantity,
        unit_cost: cost,
        condition_status: condition || "accepted",
        rejection_reason: reason || null,
      });
    }
    index++;
  }

  if (lines.length === 0) {
    redirect("/app/procurement/receipts/new?error=At least one receipt item is required");
  }

  const receiptData = {
    goods_receipt_number: goodsReceiptNumber || null,
    delivery_note_number: deliveryNoteNumber || null,
    inventory_location_id: inventoryLocationId,
    received_at: receivedAt,
    notes: notes || null,
  };

  const { error } = await supabase.rpc("create_goods_receipt_with_items" as any, {
    target_school_id: context.active_school_id,
    receipt_data: receiptData,
    lines: lines,
    post_now: postNow,
  } as any);

  if (error) {
    redirect(`/app/procurement/receipts/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/procurement");
  redirect("/app/procurement?message=Goods receipt created");
}
