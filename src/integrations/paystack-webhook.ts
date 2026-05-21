import crypto from "crypto";
import { supabaseAdmin } from "./supabase/client.server";
import type { PaystackWebhookPayload } from "./paystack-types";

export async function handlePaystackWebhook(
  body: string,
  signature: string | null
): Promise<{ success: boolean; message: string }> {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return { success: false, message: "Missing signature or secret" };
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha512", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return { success: false, message: "Invalid signature" };
  }

  try {
    const event: PaystackWebhookPayload = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event);
        break;
      case "transfer.success":
        await handleTransferSuccess(event);
        break;
      case "transfer.failed":
        await handleTransferFailed(event);
        break;
      case "refund.processed":
        await handleRefundProcessed(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return { success: true, message: "Webhook processed successfully" };
  } catch (error) {
    console.error("Webhook error:", error);
    return { success: false, message: "Internal server error" };
  }
}

async function handleChargeSuccess(event: PaystackWebhookPayload) {
  const { data } = event;
  const reference = data.reference;

  // Update order status based on payment
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "confirmed", payment_status: "paid" })
    .eq("payment_reference", reference);

  if (error) {
    console.error("Error updating order:", error);
  }

  // Update loyalty points if applicable
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("customer_id, total_amount")
    .eq("payment_reference", reference)
    .single();

  if (order) {
    const pointsEarned = Math.floor(Number(order.total_amount) / 100); // 1 point per 100 Naira

    await supabaseAdmin.from("loyalty_points").upsert({
      customer_id: order.customer_id,
      balance: pointsEarned,
    });
  }
}

async function handleTransferSuccess(event: PaystackWebhookPayload) {
  const { data } = event;
  // Update payout status
  const { error } = await supabaseAdmin
    .from("payouts")
    .update({ status: "completed" })
    .eq("transfer_reference", data.reference);

  if (error) {
    console.error("Error updating payout:", error);
  }
}

async function handleTransferFailed(event: PaystackWebhookPayload) {
  const { data } = event;
  // Update payout status
  const { error } = await supabaseAdmin
    .from("payouts")
    .update({ status: "failed" })
    .eq("transfer_reference", data.reference);

  if (error) {
    console.error("Error updating payout:", error);
  }
}

async function handleRefundProcessed(event: PaystackWebhookPayload) {
  const { data } = event;
  // Update refund status
  const { error } = await supabaseAdmin
    .from("disputes")
    .update({ status: "resolved" })
    .eq("refund_reference", data.reference);

  if (error) {
    console.error("Error updating dispute:", error);
  }
}
