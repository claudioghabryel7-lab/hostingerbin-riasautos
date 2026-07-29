"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Confirma pagamento no Firestore pelo cliente (quando Admin SDK não está na Vercel). */
export async function markOrderPaidOnClient(
  orderId: string,
  paymentId: string
) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "received",
    paymentStatus: "approved",
    mpPaymentId: String(paymentId),
    updatedAt: Date.now(),
  });
}

export async function savePaymentIdOnClient(
  orderId: string,
  paymentId: string
) {
  await updateDoc(doc(db, "orders", orderId), {
    mpPaymentId: String(paymentId),
    updatedAt: Date.now(),
  });
}

/** Consulta a API e, se aprovado, grava no Firestore (servidor ou cliente). */
export async function confirmPaymentOnClient(orderId: string, paymentId?: string) {
  const res = await fetch("/api/payments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      ...(paymentId ? { paymentId } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Falha ao confirmar pagamento");
  }

  const approved =
    data.paymentStatus === "approved" || data.status === "approved";
  const pid = data.paymentId ? String(data.paymentId) : paymentId;

  if (approved && pid) {
    // Sempre tenta gravar no cliente se o servidor pediu fallback OU se updated=false
    if (data.clientUpdate || data.updated === false) {
      try {
        await markOrderPaidOnClient(orderId, pid);
        data.clientApplied = true;
      } catch (e) {
        console.warn("client mark paid failed", e);
      }
    }
  }

  return data as {
    ok?: boolean;
    paymentStatus?: string;
    status?: string;
    paymentId?: string | number;
    updated?: boolean;
    clientUpdate?: boolean;
    clientApplied?: boolean;
    pending?: boolean;
    error?: string;
  };
}
