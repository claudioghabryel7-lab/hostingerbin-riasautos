import { NextRequest, NextResponse } from "next/server";
import {
  isPaymentExpired,
  PAYMENT_TIMEOUT_MS,
  paymentDeadline,
} from "@/lib/payment-timeout";

export const runtime = "nodejs";

async function cancelOrder(
  orderId: string,
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    const { getAdminDb } = await import("@/lib/firebase-admin");
    await getAdminDb()
      .collection("orders")
      .doc(orderId)
      .update({
        status: "cancelled",
        paymentStatus: "cancelled",
        cancelReason: "payment_timeout",
        updatedAt: Date.now(),
      });
    return true;
  } catch {
    // Sem Admin: cliente cancela via SDK (regras permitem se expirou)
    return false;
  }
}

/** Cancela pedidos aguardando pagamento há mais de 15 minutos. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId as string | undefined;

    // Modo single: verifica um pedido
    if (orderId) {
      const { getOrderFromFirestore } = await import("@/lib/orders-server");
      const order = (await getOrderFromFirestore(orderId)) as {
        id: string;
        createdAt?: number;
        expiresAt?: number;
        paymentStatus?: string;
        status?: string;
      } | null;

      if (!order) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
      }

      if (
        order.paymentStatus === "approved" ||
        order.status === "cancelled" ||
        order.status === "rejected"
      ) {
        return NextResponse.json({
          ok: true,
          expired: false,
          cancelled: false,
          orderId,
        });
      }

      if (!isPaymentExpired(order)) {
        const deadline =
          order.expiresAt ||
          paymentDeadline(order.createdAt || Date.now());
        return NextResponse.json({
          ok: true,
          expired: false,
          cancelled: false,
          orderId,
          expiresAt: deadline,
          remainingMs: Math.max(0, deadline - Date.now()),
        });
      }

      const updated = await cancelOrder(orderId, {});
      return NextResponse.json({
        ok: true,
        expired: true,
        cancelled: updated,
        clientCancel: !updated,
        orderId,
        reason: "payment_timeout",
      });
    }

    // Modo lote (Admin SDK)
    try {
      const { getAdminDb } = await import("@/lib/firebase-admin");
      const db = getAdminDb();
      const snap = await db
        .collection("orders")
        .where("paymentStatus", "==", "pending")
        .limit(100)
        .get();

      const now = Date.now();
      let cancelled = 0;
      for (const doc of snap.docs) {
        const data = doc.data();
        const createdAt = Number(data.createdAt || 0);
        const expiresAt = Number(data.expiresAt || createdAt + PAYMENT_TIMEOUT_MS);
        if (
          data.status === "awaiting_payment" ||
          data.paymentStatus === "pending"
        ) {
          if (now > expiresAt) {
            await doc.ref.update({
              status: "cancelled",
              paymentStatus: "cancelled",
              cancelReason: "payment_timeout",
              updatedAt: now,
            });
            cancelled += 1;
          }
        }
      }

      return NextResponse.json({
        ok: true,
        scanned: snap.size,
        cancelled,
        timeoutMinutes: 15,
      });
    } catch (e) {
      return NextResponse.json({
        ok: true,
        batchUnavailable: true,
        hint: "Passe orderId ou configure FIREBASE_SERVICE_ACCOUNT",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  } catch (e) {
    console.error("orders/expire", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao expirar" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
