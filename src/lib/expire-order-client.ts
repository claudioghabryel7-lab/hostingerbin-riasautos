"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isPaymentExpired } from "@/lib/payment-timeout";

export async function cancelExpiredOrderOnClient(orderId: string) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled",
    paymentStatus: "cancelled",
    cancelReason: "payment_timeout",
    updatedAt: Date.now(),
  });
}

/** Chama API e, se precisar, cancela no cliente. */
export async function expireOrderIfNeeded(order: {
  id: string;
  createdAt?: number;
  expiresAt?: number;
  paymentStatus?: string;
  status?: string;
}) {
  if (!isPaymentExpired(order)) {
    return { expired: false, cancelled: false };
  }

  const res = await fetch("/api/orders/expire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: order.id }),
  });
  const data = await res.json().catch(() => ({}));

  if (data.clientCancel || (!data.cancelled && data.expired)) {
    try {
      await cancelExpiredOrderOnClient(order.id);
      return { expired: true, cancelled: true };
    } catch (e) {
      console.warn("client cancel expired failed", e);
      return { expired: true, cancelled: false };
    }
  }

  return {
    expired: Boolean(data.expired),
    cancelled: Boolean(data.cancelled),
  };
}
