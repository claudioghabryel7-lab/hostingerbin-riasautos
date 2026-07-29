"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

/** Contador isolado — não remonta o Brick do MP */
function PaymentCountdown({
  createdAt,
  expiresAt,
  onExpired,
}: {
  createdAt: number;
  expiresAt?: number;
  onExpired: () => void;
}) {
  const [remainMs, setRemainMs] = useState(() =>
    remainingPaymentMs({ createdAt, expiresAt })
  );
  const expiredRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const left = remainingPaymentMs({ createdAt, expiresAt });
      setRemainMs(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [createdAt, expiresAt, onExpired]);

  return (
    <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      Tempo para pagar:{" "}
      <strong className="font-display text-lg tracking-wide">
        {formatCountdown(remainMs)}
      </strong>
      <span className="mt-1 block text-xs text-amber-100/80">
        Sem pagamento em 15 minutos o pedido é cancelado automaticamente.
      </span>
    </div>
  );
}

const PAYMENT_CUSTOMIZATION = {
  paymentMethods: {
    creditCard: "all" as const,
    debitCard: "all" as const,
    bankTransfer: "all" as const,
    maxInstallments: 12,
  },
  visual: {
    style: {
      theme: "default" as const,
    },
  },
};

/** Brick isolado com memo — só remonta se amount/email mudarem de verdade */
const StablePaymentBrick = memo(function StablePaymentBrick({
  amount,
  email,
  orderId,
  onPending,
  onApproved,
  onFail,
}: {
  amount: number;
  email?: string;
  orderId: string;
  onPending: (result: PayResult) => void;
  onApproved: (paymentId: string) => void;
  onFail: (message: string) => void;
}) {
  const onPendingRef = useRef(onPending);
  const onApprovedRef = useRef(onApproved);
  const onFailRef = useRef(onFail);

  useEffect(() => {
    onPendingRef.current = onPending;
    onApprovedRef.current = onApproved;
    onFailRef.current = onFail;
  }, [onPending, onApproved, onFail]);

  const initialization = useMemo(
    () => ({
      amount,
      ...(email ? { payer: { email } } : {}),
    }),
    [amount, email]
  );

  const onSubmit = useCallback(
    async (param: { formData: unknown }) => {
      const formData = param.formData as Record<string, unknown>;
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, formData }),
      });
      const data = await res.json();
      if (!res.ok) {
        onFailRef.current(data.error || "Falha no pagamento");
        throw new Error(data.error || "Falha no pagamento");
      }

      const paymentId = String(data.paymentId || "");
      if (paymentId) {
        await savePaymentIdOnClient(orderId, paymentId).catch(() => undefined);
      }

      if ((data.status === "approved" || data.alreadyPaid) && paymentId) {
        onApprovedRef.current(paymentId);
        return;
      }

      onPendingRef.current({
        paymentId,
        status: String(data.status || "pending"),
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
      });
    },
    [orderId]
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white p-2 text-black">
      <Payment
        initialization={initialization}
        customization={PAYMENT_CUSTOMIZATION}
        onSubmit={onSubmit}
        onError={(err) => {
          console.error(err);
          onFailRef.current(
            "Não foi possível carregar o pagamento. Tente de novo."
          );
        }}
        onReady={() => undefined}
      />
    </div>
  );
});

const StableStatusScreen = memo(function StableStatusScreen({
  paymentId,
}: {
  paymentId: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white p-2">
      <StatusScreen
        initialization={{ paymentId }}
        customization={{
          visual: {
            hideStatusDetails: false,
            hideTransactionDate: true,
          },
        }}
        onError={(err) => console.warn("StatusScreen", err)}
      />
    </div>
  );
});

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
  const [timedOut, setTimedOut] = useState(false);
  const ready = ensureMp();

  useEffect(() => {
    return subscribeOrder(orderId, (next) => {
      setOrder((prev) => {
        // Evita re-render inútil se nada relevante mudou
        if (
          prev &&
          prev.paymentStatus === next?.paymentStatus &&
          prev.status === next?.status &&
          prev.total === next?.total &&
          prev.mpPaymentId === next?.mpPaymentId &&
          prev.customer?.email === next?.customer?.email
        ) {
          return prev;
        }
        return next;
      });
    });
  }, [orderId]);

  useEffect(() => {
    if (order?.paymentStatus === "approved") {
      router.replace(`/pedido/${orderId}`);
    }
  }, [order?.paymentStatus, orderId, router]);

  // Polling só depois do Pix/cartão gerado — sem setChecking no loop (evita flicker)
  useEffect(() => {
    if (!payResult?.paymentId) return;
    if (order?.paymentStatus === "approved") return;

    let cancelled = false;
    const tick = async () => {
      try {
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
      }
    };

    tick();
    const timer = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [payResult?.paymentId, orderId, router, order?.paymentStatus]);

  const amount = useMemo(
    () => Number(Number(order?.total || 0).toFixed(2)),
    [order?.total]
  );

  const payerEmail = order?.customer?.email || undefined;

  const handleExpired = useCallback(() => {
    setTimedOut(true);
    if (order) {
      expireOrderIfNeeded(order).catch(() => undefined);
    }
  }, [order]);

  const handlePending = useCallback((result: PayResult) => {
    setPayResult(result);
  }, []);

  const handleApproved = useCallback(
    async (paymentId: string) => {
      try {
        await markOrderPaidOnClient(orderId, paymentId);
      } catch {
        await confirmPaymentOnClient(orderId, paymentId).catch(() => undefined);
      }
      router.replace(`/pedido/${orderId}`);
    },
    [orderId, router]
  );

  const handleFail = useCallback((message: string) => {
    setError(message);
  }, []);

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
    timedOut ||
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

          <PaymentCountdown
            createdAt={order.createdAt}
            expiresAt={order.expiresAt}
            onExpired={handleExpired}
          />

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
                    Assim que o Pix for confirmado, abrimos o acompanhamento
                    automaticamente.
                  </p>
                </div>
              )}

              {ready && payResult.paymentId ? (
                <StableStatusScreen paymentId={payResult.paymentId} />
              ) : null}

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
            <StablePaymentBrick
              amount={amount}
              email={payerEmail}
              orderId={orderId}
              onPending={handlePending}
              onApproved={handleApproved}
              onFail={handleFail}
            />
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
