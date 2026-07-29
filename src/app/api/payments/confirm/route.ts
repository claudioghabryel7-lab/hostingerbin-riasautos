import { NextRequest, NextResponse } from "next/server";
import { getPaymentApi } from "@/lib/mercadopago";

export const runtime = "nodejs";

async function markPaid(orderId: string, paymentId: string) {
  try {
    const { markOrderPaidAdmin } = await import("@/lib/order-paid");
    return await markOrderPaidAdmin(orderId, paymentId);
  } catch (e) {
    console.warn("Admin DB update failed", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId as string | undefined;
    let paymentId = body.paymentId as string | undefined;

    // Also support Mercado Pago query-style notifications forwarded here
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    const paymentApi = getPaymentApi();

    if (!paymentId && topic === "payment" && id) {
      paymentId = id;
    }

    if (paymentId) {
      const payment = await paymentApi.get({ id: paymentId });
      const ref = String(payment.external_reference || "");
      if (payment.status === "approved" && ref) {
        const ok = await markPaid(ref, String(payment.id));
        return NextResponse.json({
          ok: true,
          orderId: ref,
          updated: ok,
          status: payment.status,
        });
      }
      return NextResponse.json({
        ok: true,
        status: payment.status,
        updated: false,
      });
    }

    if (!orderId) {
      return NextResponse.json({ error: "orderId ou paymentId obrigatório" }, { status: 400 });
    }

    // Search payments by external_reference
    const search = await paymentApi.search({
      options: {
        criteria: "desc",
        sort: "date_created",
        range: "date_created",
        begin_date: "NOW-7DAYS",
        end_date: "NOW",
        external_reference: orderId,
      },
    });

    const results = search.results || [];
    const approved = results.find((p) => p.status === "approved");
    if (approved?.id) {
      const ok = await markPaid(orderId, String(approved.id));
      return NextResponse.json({
        ok: true,
        orderId,
        updated: ok,
        paymentId: approved.id,
        // Instruct client to update if server couldn't
        clientUpdate: !ok,
        paymentStatus: "approved",
        status: "received",
      });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      updated: false,
      pending: true,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao confirmar" },
      { status: 500 }
    );
  }
}
