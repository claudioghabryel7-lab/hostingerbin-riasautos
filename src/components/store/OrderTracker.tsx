"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DbImage } from "@/components/ui/DbImage";
import { Button } from "@/components/ui/button";
import { SushiGame } from "@/components/store/SushiGame";
import {
  confirmCustomerDelivery,
  createReview,
  getGuestTokenForOrder,
  incrementMenuOrderCounts,
  rememberGuestOrder,
  subscribeOrder,
} from "@/lib/store";
import { formatCurrency, orderStatusStep } from "@/lib/utils";
import {
  formatCountdown,
  isPaymentExpired,
  remainingPaymentMs,
} from "@/lib/payment-timeout";
import { expireOrderIfNeeded } from "@/lib/expire-order-client";
import { ORDER_STATUS_LABELS, type Order } from "@/types";

const STEPS_DELIVERY = [
  { key: "received", label: "Pedido recebido" },
  { key: "preparing", label: "Sendo preparado" },
  { key: "out_for_delivery", label: "Saiu para entrega" },
  { key: "completed", label: "Entregue" },
] as const;

const STEPS_PICKUP = [
  { key: "received", label: "Pedido recebido" },
  { key: "preparing", label: "Sendo preparado" },
  { key: "ready_for_pickup", label: "Pronto para retirada" },
  { key: "completed", label: "Retirado" },
] as const;

const LOGO = "/images/logo-fry-sushi.png";

export function OrderTracker({
  orderId,
  paymentHint,
}: {
  orderId: string;
  paymentHint?: string | null;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [remainMs, setRemainMs] = useState(0);

  useEffect(() => {
    return subscribeOrder(orderId, setOrder);
  }, [orderId]);

  // Garante sessão temporária de visitante neste aparelho
  useEffect(() => {
    if (!order?.isGuest || !order.guestToken) return;
    const existing = getGuestTokenForOrder(orderId);
    if (!existing) {
      rememberGuestOrder(orderId, order.guestToken);
    }
  }, [order, orderId]);

  // Expira pedido sem pagamento em 15 min
  useEffect(() => {
    if (!order) return;
    if (order.paymentStatus === "approved") return;
    if (order.status === "cancelled" || order.status === "rejected") return;
    if (order.paymentStatus !== "pending") return;

    const tick = async () => {
      setRemainMs(remainingPaymentMs(order));
      if (isPaymentExpired(order)) {
        await expireOrderIfNeeded(order);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [order]);

  useEffect(() => {
    if (!order || order.paymentStatus === "approved") return;
    if (order.status === "cancelled") return;
    // Embutido usa mpPaymentId; checkout antigo usava mpPreferenceId
    const canPoll =
      paymentHint === "success" ||
      Boolean(order.mpPaymentId) ||
      Boolean(order.mpPreferenceId) ||
      order.paymentStatus === "pending";
    if (!canPoll) return;

    let cancelled = false;
    const confirmPayment = async () => {
      const { confirmPaymentOnClient } = await import(
        "@/lib/confirm-payment-client"
      );
      const data = await confirmPaymentOnClient(
        orderId,
        order.mpPaymentId || undefined
      );
      if (
        data.clientUpdate &&
        data.paymentStatus === "approved" &&
        !data.clientApplied &&
        data.paymentId
      ) {
        await incrementMenuOrderCounts(order.items || []).catch(() => undefined);
      }
      return data;
    };

    (async () => {
      setConfirming(true);
      try {
        await confirmPayment();
      } catch {
        /* polling */
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
    }, 4000);

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

  const guestOk =
    !order.isGuest ||
    !order.guestToken ||
    getGuestTokenForOrder(orderId) === order.guestToken;

  const step = orderStatusStep(order.status);
  const rejected = order.status === "rejected" || order.status === "cancelled";
  const steps =
    order.fulfillment === "pickup" ? STEPS_PICKUP : STEPS_DELIVERY;

  const paid = order.paymentStatus === "approved";
  const waitingFlow =
    paid &&
    !rejected &&
    !order.customerConfirmedDelivery &&
    order.status !== "completed";

  const canConfirmDelivery =
    guestOk &&
    waitingFlow &&
    ["out_for_delivery", "ready_for_pickup", "preparing", "received"].includes(
      order.status
    );

  const canReview =
    guestOk &&
    (order.customerConfirmedDelivery || order.status === "completed") &&
    !order.reviewed &&
    !reviewDone;

  const onConfirmDelivery = async () => {
    setBusy(true);
    try {
      await confirmCustomerDelivery(orderId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  };

  const onReview = async () => {
    if (!comment.trim()) {
      alert("Escreva um comentário curto.");
      return;
    }
    setBusy(true);
    try {
      await createReview({
        orderId,
        customerName: order.customer.name,
        rating,
        comment: comment.trim(),
      });
      setReviewDone(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao avaliar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 pattern-overlay" />
      <div className="relative mx-auto max-w-lg">
        <Link href="/" className="inline-flex items-center gap-3">
          <DbImage
            src={LOGO}
            alt="Fry Sushi"
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
          <span className="font-display text-2xl text-[var(--rice)]">
            Fry Sushi
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mt-8 rounded-3xl p-6"
        >
          <p className="text-sm text-[var(--rice-dim)]">
            Pedido #{order.id.slice(0, 8)}
            {order.isGuest ? " · acesso temporário neste aparelho" : ""}
          </p>
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
                : waitingFlow
                  ? "Acompanhe o status e jogue enquanto espera. Quando receber, confirme abaixo."
                  : "Pedido concluído — obrigado!"}
          </p>

          {order.paymentStatus === "pending" &&
            order.status === "awaiting_payment" && (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Tempo restante para pagar:{" "}
                <strong>{formatCountdown(remainMs)}</strong>
                <span className="mt-1 block text-xs opacity-80">
                  Após 15 minutos sem pagamento o pedido é cancelado.
                </span>
              </div>
            )}

          {order.paymentStatus === "pending" && order.status !== "cancelled" && (
            <div className="mt-4">
              <Link
                href={`/pedido/${orderId}/pagar`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--salmon)] px-5 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                Pagar agora no site (Pix ou cartão)
              </Link>
            </div>
          )}

          {order.cancelReason === "payment_timeout" && (
            <p className="mt-4 text-sm text-amber-200">
              Cancelado automaticamente por falta de pagamento (15 minutos).
            </p>
          )}

          {!rejected && (
            <div className="mt-8">
              <div className="status-track">
                {steps.map((s, i) => (
                  <div
                    key={s.key}
                    className={`status-step ${step >= i + 1 ? "active" : ""}`}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-[var(--rice-dim)] sm:text-xs">
                {steps.map((s, i) => (
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

          <SushiGame
            active={waitingFlow}
            subtitle={
              order.fulfillment === "pickup"
                ? "Sushi Crush enquanto espera a retirada — combine 3 iguais!"
                : "Sushi Crush enquanto a entrega chega — combine 3 iguais!"
            }
          />

          <div className="mt-8 space-y-3 border-t border-white/8 pt-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-lg">
                  <DbImage
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.quantity}x {item.name}
                  </p>
                </div>
                <p className="text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-1 text-sm">
            {(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discountAmount || 0)}</span>
              </div>
            )}
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
            <p className="mb-1 text-[var(--salmon)]">
              {order.fulfillment === "pickup" ? "Retirada" : "Entrega"}
            </p>
            <p>{order.customer.address}</p>
            {order.customer.neighborhood && <p>{order.customer.neighborhood}</p>}
            <p className="mt-1">{order.customer.phone}</p>
          </div>

          {canConfirmDelivery && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-[var(--rice-dim)]">
                Recebeu o pedido? Confirme para finalizar e avaliar.
              </p>
              <Button
                className="w-full"
                size="lg"
                disabled={busy}
                onClick={onConfirmDelivery}
              >
                Confirmar que recebi o pedido
              </Button>
            </div>
          )}

          {order.customerConfirmedDelivery && !canReview && !reviewDone && (
            <p className="mt-6 text-sm text-emerald-300">
              Entrega confirmada. Obrigado!
            </p>
          )}

          {canReview && (
            <div className="mt-6 space-y-3 border-t border-white/8 pt-6">
              <h2 className="font-display text-xl">Avalie seu pedido</h2>
              <p className="text-sm text-[var(--rice-dim)]">
                Seu acesso temporário neste aparelho permite avaliar sem login.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "text-amber-300" : "text-white/20"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                rows={3}
                placeholder="Conte como foi..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button className="w-full" disabled={busy} onClick={onReview}>
                Enviar avaliação
              </Button>
            </div>
          )}

          {(reviewDone || order.reviewed) && (
            <p className="mt-6 text-sm text-emerald-300">
              Avaliação enviada — aparece na página inicial. Obrigado!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
