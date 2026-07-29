"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ensureStoreSeeded,
  subscribeActiveOrders,
  subscribeMenu,
  subscribeSettings,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/data/defaults";
import type { MenuItem, Order, StoreSettings } from "@/types";

export function AdminDashboard() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    ensureStoreSeeded().catch(() => {});
    const u1 = subscribeSettings(setSettings);
    const u2 = subscribeActiveOrders(setOrders);
    const u3 = subscribeMenu(setMenu, false);
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const paid = orders.filter((o) => o.paymentStatus === "approved");
  const revenue = paid.reduce((acc, o) => acc + o.total, 0);

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Painel</h1>
      <p className="mt-1 text-[var(--rice-dim)]">
        Torre de controle da {settings.storeName}. Atualiza sozinho, sem F5.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Status da loja"
          value={settings.isOpen ? "Aberta" : "Fechada"}
          hint={settings.isOpen ? "Recebendo pedidos" : settings.closedMessage}
        />
        <Stat
          label="Pedidos ativos"
          value={String(paid.length)}
          hint={`${orders.filter((o) => o.paymentStatus === "pending").length} aguardando pagamento`}
        />
        <Stat
          label="Em produção (valor)"
          value={formatCurrency(revenue)}
          hint={`${menu.filter((m) => m.available).length} itens no cardápio`}
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <QuickLink href="/admin/pedidos" title="Gestão de pedidos" desc="Aceitar, entregar, recusar + estorno" />
        <QuickLink href="/admin/cardapio" title="Galeria do cardápio" desc="Subir foto, preço e estoque" />
        <QuickLink href="/admin/configuracoes" title="Configurações" desc="Hero, taxa, abertura e marca" />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl">Últimos pedidos pagos</h2>
        <div className="mt-4 space-y-3">
          {paid.slice(0, 5).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{o.customer.name}</p>
                <p className="text-sm text-[var(--rice-dim)]">{o.status}</p>
              </div>
              <p className="font-semibold">{formatCurrency(o.total)}</p>
            </div>
          ))}
          {paid.length === 0 && (
            <p className="text-[var(--rice-dim)]">Nenhum pedido pago ainda.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-sm text-[var(--rice-dim)]">{label}</p>
      <p className="font-display mt-2 text-3xl">{value}</p>
      <p className="mt-2 text-xs text-[var(--rice-dim)]">{hint}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-[var(--ink-soft)] p-5 transition hover:border-[var(--salmon)]/50"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-[var(--rice-dim)]">{desc}</p>
    </Link>
  );
}
