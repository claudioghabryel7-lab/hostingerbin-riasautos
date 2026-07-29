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

function approvedResponse(
  orderId: string,
  paymentId: string,
  updated: boolean
) {
  return NextResponse.json({
    ok: true,
    orderId,
    paymentId,
    updated,
    // Sem FIREBASE_SERVICE_ACCOUNT o Admin falha — cliente precisa gravar
    clientUpdate: !updated,
    paymentStatus: "approved",
    status: "received",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId as string | undefined;
    let paymentId = body.paymentId as string | undefined;

    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    const paymentApi = getPaymentApi();

    if (!paymentId && topic === "payment" && id) {
      paymentId = id;
    }

    if (paymentId) {
      const payment = await paymentApi.get({ id: paymentId });
      const ref = String(payment.external_reference || orderId || "");
      if (payment.status === "approved" && ref) {
        const ok = await markPaid(ref, String(payment.id));
        return approvedResponse(ref, String(payment.id), ok);
      }
      return NextResponse.json({
        ok: true,
        status: payment.status,
        paymentStatus: payment.status,
        updated: false,
        pending: payment.status === "pending" || payment.status === "in_process",
        paymentId: String(payment.id || paymentId),
        orderId: ref || orderId,
      });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId ou paymentId obrigatório" },
        { status: 400 }
      );
    }

    // 1) Tenta pelo mpPaymentId já salvo no pedido (via REST/Admin)
    try {
      const { getOrderFromFirestore } = await import("@/lib/orders-server");
      const order = (await getOrderFromFirestore(orderId)) as {
        mpPaymentId?: string;
        paymentStatus?: string;
      } | null;
      if (order?.paymentStatus === "approved") {
        return approvedResponse(orderId, String(order.mpPaymentId || ""), true);
      }
      if (order?.mpPaymentId) {
        const payment = await paymentApi.get({ id: String(order.mpPaymentId) });
        if (payment.status === "approved") {
          const ok = await markPaid(orderId, String(payment.id));
          return approvedResponse(orderId, String(payment.id), ok);
        }
      }
    } catch (e) {
      console.warn("order lookup for confirm failed", e);
    }

    // 2) Busca pagamentos pelo external_reference
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
      return approvedResponse(orderId, String(approved.id), ok);
    }

    const pending = results.find(
      (p) => p.status === "pending" || p.status === "in_process"
    );

    return NextResponse.json({
      ok: true,
      orderId,
      updated: false,
      pending: true,
      paymentStatus: pending?.status || "pending",
      paymentId: pending?.id ? String(pending.id) : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao confirmar" },
      { status: 500 }
    );
  }
}
