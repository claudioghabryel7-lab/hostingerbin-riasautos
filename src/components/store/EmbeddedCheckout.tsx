"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { DbImage } from "@/components/ui/DbImage";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { subscribeOrder } from "@/lib/store";
import {
  confirmPaymentOnClient,
  markOrderPaidOnClient,
  savePaymentIdOnClient,
} from "@/lib/confirm-payment-client";
import {
  formatCountdown,
  isPaymentExpired,
  remainingPaymentMs,
} from "@/lib/payment-timeout";
import { expireOrderIfNeeded } from "@/lib/expire-order-client";
import type { Order } from "@/types";

const LOGO = "/images/logo-fry-sushi.png";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";

type PayResult = {
  paymentId: string;
  status: string;
  qrCode?: string | null;
  qrCodeBase64?: string | null;
};

let mpInitialized = false;

function ensureMp() {
  if (!PUBLIC_KEY || mpInitialized) return Boolean(PUBLIC_KEY);
  initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  mpInitialized = true;
  return true;
}

export function EmbeddedCheckout({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(() =>
    PUBLIC_KEY
      ? ""
      : "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada na Vercel."
  );
  const [payResult, setPayResult] = useState<PayResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [remainMs, setRemainMs] = useState(0);
  const ready = ensureMp();

  useEffect(() => {
    return subscribeOrder(orderId, setOrder);
  }, [orderId]);

  // Countdown + cancelamento automático (15 min)
  useEffect(() => {
    if (!order) return;
    if (order.paymentStatus === "approved") return;
    if (order.status === "cancelled") return;

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
    if (order?.paymentStatus === "approved") {
      router.replace(`/pedido/${orderId}`);
    }
  }, [order, orderId, router]);

  // Polling Pix / cartão em análise
  useEffect(() => {
    if (!payResult?.paymentId) return;
    if (order?.paymentStatus === "approved") return;

    let cancelled = false;

    const tick = async () => {
      try {
        setChecking(true);
        const data = await confirmPaymentOnClient(
          orderId,
          payResult.paymentId
        );
        if (cancelled) return;
        if (
          data.paymentStatus === "approved" ||
          data.status === "approved" ||
          data.clientApplied
        ) {
          router.replace(`/pedido/${orderId}`);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    tick();
    const timer = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [payResult, orderId, router, order?.paymentStatus]);

  const amount = useMemo(
    () => Number(Number(order?.total || 0).toFixed(2)),
    [order?.total]
  );

  const goToTrackingAfterPaid = async (paymentId: string) => {
    try {
      await markOrderPaidOnClient(orderId, paymentId);
    } catch (e) {
      console.warn("mark paid client", e);
      // tenta via API (Admin) + fallback
      await confirmPaymentOnClient(orderId, paymentId).catch(() => undefined);
    }
    router.replace(`/pedido/${orderId}`);
  };

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
        Carregando pagamento...
      </div>
    );
  }

  if (order.paymentStatus === "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
        Pagamento confirmado. Abrindo acompanhamento...
      </div>
    );
  }

  if (
    order.status === "cancelled" ||
    order.paymentStatus === "cancelled" ||
    isPaymentExpired(order)
  ) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center">
          <DbImage
            src={LOGO}
            alt="Fry Sushi"
            width={56}
            height={56}
            className="mx-auto rounded-full"
          />
          <h1 className="font-display mt-4 text-2xl">Pedido cancelado</h1>
          <p className="mt-2 text-sm text-[var(--rice-dim)]">
            O pagamento não foi concluído em 15 minutos. Faça um novo pedido no
            cardápio.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-[var(--salmon)] px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Voltar ao cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-8">
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
          <span className="font-display text-2xl">Fry Sushi</span>
        </Link>

        <div className="glass-panel mt-6 rounded-3xl p-5 sm:p-6">
          <p className="text-sm text-[var(--rice-dim)]">
            Pedido #{orderId.slice(0, 8)}
          </p>
          <h1 className="font-display mt-1 text-3xl">Pagar no site</h1>
          <p className="mt-2 text-sm text-[var(--rice-dim)]">
            Pix com QR Code ou cartão — tudo aqui, sem sair da Fry Sushi. Depois
            do pagamento você acompanha o pedido e joga o Sushi Catch.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/25 px-4 py-3">
            <span className="text-sm text-[var(--rice-dim)]">Total</span>
            <span className="font-display text-2xl text-[var(--salmon)]">
              {formatCurrency(amount)}
            </span>
          </div>

          <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Tempo para pagar:{" "}
            <strong className="font-display text-lg tracking-wide">
              {formatCountdown(remainMs)}
            </strong>
            <span className="mt-1 block text-xs text-amber-100/80">
              Sem pagamento em 15 minutos o pedido é cancelado automaticamente.
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
              {error}
            </p>
          )}

          {payResult ? (
            <div className="mt-6 space-y-4">
              {(payResult.qrCodeBase64 || payResult.qrCode) && (
                <div className="rounded-2xl bg-white p-4 text-center text-black">
                  <p className="mb-3 text-sm font-semibold">
                    Escaneie o QR Code Pix
                  </p>
                  {payResult.qrCodeBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${payResult.qrCodeBase64}`}
                      alt="QR Code Pix"
                      className="mx-auto size-56"
                    />
                  ) : null}
                  {payResult.qrCode ? (
                    <div className="mt-3 space-y-2">
                      <p className="break-all rounded-lg bg-black/5 p-2 text-left text-[11px]">
                        {payResult.qrCode}
                      </p>
                      <Button
                        type="button"
                        className="w-full"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            payResult.qrCode || ""
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? "Código copiado!" : "Copiar código Pix"}
                      </Button>
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs text-black/60">
                    {checking
                      ? "Verificando pagamento..."
                      : "Assim que o Pix for confirmado, abrimos o acompanhamento automaticamente."}
                  </p>
                </div>
              )}

              {ready && payResult.paymentId && (
                <div className="overflow-hidden rounded-2xl bg-white p-2">
                  <StatusScreen
                    initialization={{ paymentId: payResult.paymentId }}
                    customization={{
                      visual: {
                        hideStatusDetails: false,
                        hideTransactionDate: true,
                      },
                    }}
                    onError={(err) => console.warn("StatusScreen", err)}
                  />
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                disabled={checking}
                onClick={async () => {
                  setChecking(true);
                  setError("");
                  try {
                    const data = await confirmPaymentOnClient(
                      orderId,
                      payResult.paymentId
                    );
                    if (
                      data.paymentStatus === "approved" ||
                      data.status === "approved" ||
                      data.clientApplied
                    ) {
                      router.replace(`/pedido/${orderId}`);
                      return;
                    }
                    setError(
                      "Ainda não identificamos o pagamento. Aguarde alguns segundos e toque de novo."
                    );
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Não foi possível confirmar agora."
                    );
                  } finally {
                    setChecking(false);
                  }
                }}
              >
                {checking ? "Confirmando..." : "Já paguei — confirmar agora"}
              </Button>
            </div>
          ) : ready && amount > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl bg-white p-2 text-black">
              <Payment
                initialization={{
                  amount,
                  payer: {
                    email: order.customer.email || undefined,
                  },
                }}
                customization={{
                  paymentMethods: {
                    creditCard: "all",
                    debitCard: "all",
                    bankTransfer: "all",
                    maxInstallments: 12,
                  },
                  visual: {
                    style: {
                      theme: "default",
                    },
                  },
                }}
                onSubmit={async (param) => {
                  setError("");
                  const formData = param.formData as unknown as Record<
                    string,
                    unknown
                  >;
                  const res = await fetch("/api/payments/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, formData }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setError(data.error || "Falha no pagamento");
                    throw new Error(data.error || "Falha no pagamento");
                  }

                  const paymentId = String(data.paymentId || "");
                  if (paymentId) {
                    await savePaymentIdOnClient(orderId, paymentId).catch(
                      () => undefined
                    );
                  }

                  if (
                    (data.status === "approved" || data.alreadyPaid) &&
                    paymentId
                  ) {
                    await goToTrackingAfterPaid(paymentId);
                    return;
                  }

                  setPayResult({
                    paymentId,
                    status: String(data.status || "pending"),
                    qrCode: data.qrCode,
                    qrCodeBase64: data.qrCodeBase64,
                  });
                }}
                onError={(err) => {
                  console.error(err);
                  setError(
                    "Não foi possível carregar o pagamento. Tente de novo."
                  );
                }}
                onReady={() => undefined}
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-[var(--rice-dim)]">
              Preparando checkout...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
