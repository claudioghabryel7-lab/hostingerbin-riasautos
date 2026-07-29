import { NextRequest, NextResponse } from "next/server";
import { getRefundApi, getPaymentApi } from "@/lib/mercadopago";

export const runtime = "nodejs";

/**
 * Estorna no Mercado Pago. A atualização do Firestore fica a cargo do painel admin
 * autenticado (autonomia sem exigir service account no servidor).
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId: givenPaymentId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });
    }

    let paymentId = givenPaymentId as string | undefined;

    if (!paymentId) {
      const search = await getPaymentApi().search({
        options: {
          external_reference: orderId,
          criteria: "desc",
          sort: "date_created",
          range: "date_created",
          begin_date: "NOW-30DAYS",
          end_date: "NOW",
        },
      });
      const approved = (search.results || []).find((p) => p.status === "approved");
      paymentId = approved?.id ? String(approved.id) : undefined;
    }

    if (!paymentId) {
      return NextResponse.json({
        ok: true,
        refunded: false,
        clientUpdate: {
          status: "rejected",
          paymentStatus: "cancelled",
        },
        message: "Sem pagamento aprovado encontrado. Pedido marcado como recusado.",
      });
    }

    const refund = await getRefundApi().create({
      payment_id: paymentId,
    });

    return NextResponse.json({
      ok: true,
      refunded: true,
      refundId: refund?.id ? String(refund.id) : undefined,
      paymentId,
      clientUpdate: {
        status: "rejected",
        paymentStatus: "refunded",
        refundId: refund?.id ? String(refund.id) : undefined,
        mpPaymentId: paymentId,
      },
      message: "Valor estornado no Mercado Pago.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro no estorno" },
      { status: 500 }
    );
  }
}
