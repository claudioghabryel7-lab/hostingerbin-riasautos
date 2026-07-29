"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  ensureStoreSeeded,
  subscribeActiveOrders,
  subscribeOrderHistory,
  updateOrderStatus,
} from "@/lib/store";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/types";

export function AdminOrdersPage() {
  const [active, setActive] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"ativos" | "historico">("ativos");

  useEffect(() => {
    ensureStoreSeeded().catch(() => {});
    const a = subscribeActiveOrders(setActive);
    const h = subscribeOrderHistory(setHistory);
    return () => {
      a();
      h();
    };
  }, []);

  const act = async (order: Order, status: OrderStatus, refund = false) => {
    setBusy(order.id);
    try {
      if (refund || status === "rejected") {
        const res = await fetch("/api/orders/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            paymentId: order.mpPaymentId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha no estorno");
        if (data.clientUpdate) {
          const updatedAt = Number(new Date());
          await updateDoc(doc(db, "orders", order.id), {
            ...data.clientUpdate,
            updatedAt,
          });
        } else {
          await updateOrderStatus(order.id, "rejected");
        }
      } else {
        await updateOrderStatus(order.id, status);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(null);
    }
  };

  const list = tab === "ativos" ? active : history;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Pedidos</h1>
          <p className="mt-1 text-[var(--rice-dim)]">
            Aceite, prepare, entregue — ou recuse com estorno automático.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "ativos" ? "default" : "secondary"}
            onClick={() => setTab("ativos")}
          >
            Ativos ({active.length})
          </Button>
          <Button
            variant={tab === "historico" ? "default" : "secondary"}
            onClick={() => setTab("historico")}
          >
            Histórico
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-[var(--rice-dim)]">
            Nenhum pedido por aqui.
          </p>
        )}
        {list.map((order) => (
          <article
            key={order.id}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--rice-dim)]">
                  #{order.id.slice(0, 8)} ·{" "}
                  {new Date(order.createdAt).toLocaleString("pt-BR")}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{order.customer.name}</h2>
                <p className="text-sm text-[var(--rice-dim)]">
                  {order.customer.phone}
                </p>
                <p className="mt-1 text-sm">{order.customer.address}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--salmon)]">
                  {order.fulfillment === "pickup" ? "Retirada" : "Entrega"}
                </p>
                {order.customer.notes && (
                  <p className="mt-1 text-sm text-amber-200">
                    Obs: {order.customer.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">
                  {formatCurrency(order.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--salmon)]">
                  {ORDER_STATUS_LABELS[order.status]}
                </p>
                <p className="text-xs text-[var(--rice-dim)]">
                  Pagamento: {order.paymentStatus}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-white/8 pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="relative size-10 overflow-hidden rounded-lg">
                    <Image src={item.imageUrl} alt="" fill className="object-cover" />
                  </div>
                  <span className="flex-1">
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {tab === "ativos" && order.paymentStatus === "approved" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === "received" && (
                  <Button
                    disabled={busy === order.id}
                    onClick={() => act(order, "preparing")}
                  >
                    Aceitar / Preparar
                  </Button>
                )}
                {(order.status === "preparing" || order.status === "received") && (
                  <Button
                    variant="secondary"
                    disabled={busy === order.id}
                    onClick={() =>
                      act(
                        order,
                        order.fulfillment === "pickup"
                          ? "ready_for_pickup"
                          : "out_for_delivery"
                      )
                    }
                  >
                    {order.fulfillment === "pickup"
                      ? "Pronto para retirada"
                      : "Saiu para entrega"}
                  </Button>
                )}
                {(order.status === "out_for_delivery" ||
                  order.status === "ready_for_pickup") && (
                  <Button
                    disabled={busy === order.id}
                    onClick={() => act(order, "completed")}
                  >
                    Finalizar
                  </Button>
                )}
                {["received", "preparing"].includes(order.status) && (
                  <Button
                    variant="danger"
                    disabled={busy === order.id}
                    onClick={() => {
                      if (
                        confirm(
                          "Recusar este pedido? O valor será estornado no Mercado Pago."
                        )
                      ) {
                        act(order, "rejected", true);
                      }
                    }}
                  >
                    Recusar + Estornar
                  </Button>
                )}
              </div>
            )}
            {tab === "ativos" && order.paymentStatus === "pending" && (
              <p className="mt-4 text-sm text-amber-200">
                Aguardando pagamento do cliente...
              </p>
            )}
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
