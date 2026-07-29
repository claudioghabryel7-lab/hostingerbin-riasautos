import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPaymentApi } from "@/lib/mercadopago";
import { getOrderFromFirestore, patchOrder } from "@/lib/orders-server";
import { markOrderPaidAdmin } from "@/lib/order-paid";

export const runtime = "nodejs";

type BrickFormData = Record<string, unknown> & {
  transaction_amount?: number;
  payment_method_id?: string;
  token?: string;
  installments?: number;
  issuer_id?: number | string;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
    first_name?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId as string | undefined;
    const formData = (body.formData || body) as BrickFormData;

    if (!orderId) {
      return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });
    }

    const order = (await getOrderFromFirestore(orderId)) as {
      id: string;
      total?: number;
      paymentStatus?: string;
      status?: string;
      createdAt?: number;
      expiresAt?: number;
      customer?: { name?: string; email?: string; phone?: string };
    } | null;

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.paymentStatus === "approved") {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        status: "approved",
        orderId,
      });
    }

    if (
      order.status === "cancelled" ||
      order.paymentStatus === "cancelled" ||
      order.paymentStatus === "rejected"
    ) {
      return NextResponse.json(
        { error: "Este pedido foi cancelado. Faça um novo pedido." },
        { status: 410 }
      );
    }

    const { isPaymentExpired } = await import("@/lib/payment-timeout");
    if (isPaymentExpired(order as { createdAt?: number; expiresAt?: number; paymentStatus?: string; status?: string })) {
      return NextResponse.json(
        {
          error:
            "Tempo esgotado (15 min). O pedido foi cancelado por falta de pagamento.",
          expired: true,
        },
        { status: 410 }
      );
    }

    const amount = Number(Number(order.total || 0).toFixed(2));
    if (!(amount > 0)) {
      return NextResponse.json({ error: "Total do pedido inválido" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";

    const payerEmail =
      formData.payer?.email ||
      order.customer?.email ||
      `pedido.${orderId.slice(0, 8)}@frysushi.cliente`;

  // Limpa formData do Brick — evita campos extras que quebram a API
  const allowed = [
    "transaction_amount",
    "token",
    "description",
    "installments",
    "payment_method_id",
    "issuer_id",
    "payer",
    "additional_info",
    "binary_mode",
    "campaign_id",
    "coupon_amount",
    "differential_pricing_id",
  ] as const;

  const cleanedForm: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in formData && formData[key] !== undefined) {
      cleanedForm[key] = formData[key];
    }
  }

  const paymentBody: Record<string, unknown> = {
    ...cleanedForm,
    transaction_amount: amount,
    description: `Fry Sushi #${orderId.slice(0, 8)}`,
    external_reference: orderId,
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    metadata: { orderId },
    payer: {
      ...(typeof formData.payer === "object" && formData.payer
        ? formData.payer
        : {}),
      email: payerEmail,
      first_name:
        formData.payer?.first_name ||
        order.customer?.name?.split(" ")[0] ||
        "Cliente",
    },
  };

    const paymentApi = getPaymentApi();
    const result = await paymentApi.create({
      body: paymentBody as never,
      requestOptions: {
        idempotencyKey: randomUUID(),
      },
    });

    const paymentId = String(result.id || "");
    const status = String(result.status || "pending");
    const tx =
      (
        result as {
          point_of_interaction?: {
            transaction_data?: {
              qr_code?: string;
              qr_code_base64?: string;
              ticket_url?: string;
            };
          };
        }
      ).point_of_interaction?.transaction_data || {};

    await patchOrder(orderId, {
      mpPaymentId: paymentId,
      updatedAt: Date.now(),
      ...(status === "approved"
        ? { paymentStatus: "approved", status: "received" }
        : {}),
    });

    if (status === "approved" && paymentId) {
      await markOrderPaidAdmin(orderId, paymentId).catch(() => false);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      paymentId,
      status,
      statusDetail: result.status_detail,
      qrCode: tx.qr_code || null,
      qrCodeBase64: tx.qr_code_base64 || null,
      ticketUrl: tx.ticket_url || null,
      // Sem Admin SDK o patchOrder pode falhar — cliente grava
      clientUpdate: status === "approved",
    });
  } catch (e) {
    console.error("payments/create", e);
    const message =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: string }).message)
        : e instanceof Error
          ? e.message
          : "Erro ao criar pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
