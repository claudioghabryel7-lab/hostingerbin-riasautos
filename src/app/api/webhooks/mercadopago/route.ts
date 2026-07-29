import { NextRequest, NextResponse } from "next/server";
import { getPaymentApi } from "@/lib/mercadopago";

export const runtime = "nodejs";

async function markPaid(orderId: string, paymentId: string) {
  try {
    const { markOrderPaidAdmin } = await import("@/lib/order-paid");
    return await markOrderPaidAdmin(orderId, paymentId);
  } catch (e) {
    console.warn("Webhook Firestore update failed:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      paymentId =
        paymentId ||
        body?.data?.id ||
        body?.id ||
        (body?.resource ? String(body.resource).split("/").pop() : undefined);
    } else {
      // query notification already handled
      await req.text().catch(() => "");
    }

    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type") ||
      "payment";

    if ((topic === "payment" || topic === "payment.created" || !topic) && paymentId) {
      const payment = await getPaymentApi().get({ id: String(paymentId) });
      const orderId = String(payment.external_reference || "");
      if (payment.status === "approved" && orderId) {
        await markPaid(orderId, String(payment.id));
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error", e);
    // Always 200 to avoid MP retry storms on our bugs — log for debug
    return NextResponse.json({ received: true, warning: String(e) });
  }
}

export async function GET(req: NextRequest) {
  // MP sometimes sends GET query notifications
  return POST(req);
}
