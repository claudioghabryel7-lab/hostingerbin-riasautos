import { FieldValue } from "firebase-admin/firestore";

/** Marca pedido pago e incrementa contadores do cardápio (Admin SDK). */
export async function markOrderPaidAdmin(orderId: string, paymentId: string) {
  const { getAdminDb } = await import("@/lib/firebase-admin");
  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) return false;

  const data = snap.data() || {};
  if (data.paymentStatus === "approved") {
    return true;
  }

  await orderRef.update({
    status: "received",
    paymentStatus: "approved",
    mpPaymentId: String(paymentId),
    updatedAt: Date.now(),
  });

  const items = (data.items || []) as { id?: string; quantity?: number }[];
  await Promise.all(
    items
      .filter((i) => i.id && !String(i.id).startsWith("local-"))
      .map((i) =>
        db
          .collection("menuItems")
          .doc(String(i.id))
          .update({
            orderCount: FieldValue.increment(Number(i.quantity) || 1),
            updatedAt: Date.now(),
          })
          .catch(() => undefined)
      )
  );

  return true;
}
