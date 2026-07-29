"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { subscribeOrder } from "@/lib/store";
import { formatCurrency, orderStatusStep } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  type Order,
} from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STEPS = [
  { key: "received", label: "Pedido recebido" },
  { key: "preparing", label: "Sendo preparado" },
  { key: "out_for_delivery", label: "Saiu para entrega" },
  { key: "completed", label: "Entregue" },
] as const;

export function OrderTracker({
  orderId,
  paymentHint,
}: {
  orderId: string;
  paymentHint?: string | null;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    return subscribeOrder(orderId, setOrder);
  }, [orderId]);

  useEffect(() => {
    if (!order || order.paymentStatus === "approved") return;
    if (paymentHint !== "success" && !order.mpPreferenceId) return;

    let cancelled = false;
    const confirmPayment = async () => {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.clientUpdate && data.paymentStatus === "approved") {
        await updateDoc(doc(db, "orders", orderId), {
          status: "received",
          paymentStatus: "approved",
          mpPaymentId: data.paymentId ? String(data.paymentId) : null,
          updatedAt: Date.now(),
        });
      }
      return data;
    };

    (async () => {
      setConfirming(true);
      try {
        await confirmPayment();
      } catch {
        /* polling below */
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();

    const timer = setInterval(async () => {
      try {
        await confirmPayment();
      } catch {
        /* ignore */
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [order, orderId, paymentHint]);

  if (!order) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-[var(--rice-dim)]">Carregando pedido...</p>
      </div>
    );
  }

  const step = orderStatusStep(order.status);
  const rejected = order.status === "rejected" || order.status === "cancelled";

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 pattern-overlay" />
      <div className="relative mx-auto max-w-lg">
        <Link
          href="/"
          className="font-display text-2xl text-[var(--rice)] hover:text-[var(--salmon)]"
        >
          Frysuroll
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mt-8 rounded-3xl p-6"
        >
          <p className="text-sm text-[var(--rice-dim)]">Pedido #{order.id.slice(0, 8)}</p>
          <h1 className="font-display mt-2 text-3xl">
            {rejected
              ? "Pedido recusado"
              : ORDER_STATUS_LABELS[order.status]}
          </h1>
          <p className="mt-2 text-[var(--rice-dim)]">
            Olá, {order.customer.name}.{" "}
            {order.paymentStatus === "pending"
              ? confirming
                ? "Confirmando seu pagamento..."
                : "Aguardando confirmação do pagamento."
              : order.paymentStatus === "refunded"
                ? "O valor foi estornado automaticamente."
                : "Acompanhe em tempo real — sem precisar ligar."}
          </p>

          {!rejected && (
            <div className="mt-8">
              <div className="status-track">
                {STEPS.map((s, i) => (
                  <div
                    key={s.key}
                    className={`status-step ${step >= i + 1 ? "active" : ""}`}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-[var(--rice-dim)] sm:text-xs">
                {STEPS.map((s, i) => (
                  <span
                    key={s.key}
                    className={step >= i + 1 ? "text-[var(--salmon)]" : ""}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3 border-t border-white/8 pt-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-lg">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.quantity}x {item.name}
                  </p>
                </div>
                <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-1 text-sm">
            <div className="flex justify-between text-[var(--rice-dim)]">
              <span>Entrega</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-black/25 p-4 text-sm text-[var(--rice-dim)]">
            <p>{order.customer.address}</p>
            {order.customer.neighborhood && <p>{order.customer.neighborhood}</p>}
            <p className="mt-1">{order.customer.phone}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
