"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { subscribeActiveOrders, updateSettings, subscribeSettings, ensureStoreSeeded } from "@/lib/store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/data/defaults";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [newCount, setNewCount] = useState(0);
  const knownIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const primed = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace("/admin/login");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    return subscribeSettings(setSettings);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/new-order.wav");
    audioRef.current.preload = "auto";
    ensureStoreSeeded().catch(() => {});

    const prime = () => {
      primed.current = true;
      window.removeEventListener("pointerdown", prime);
    };
    window.addEventListener("pointerdown", prime);

    return subscribeActiveOrders((orders) => {
      const paid = orders.filter(
        (o) => o.paymentStatus === "approved" && o.status === "received"
      );
      setNewCount(paid.length);

      for (const order of paid) {
        if (!knownIds.current.has(order.id) && primed.current) {
          audioRef.current?.play().catch(() => {});
          if (typeof Notification !== "undefined") {
            if (Notification.permission === "granted") {
              new Notification("Novo pedido Frysuroll", {
                body: `${order.customer.name} — R$ ${order.total.toFixed(2)}`,
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission();
            }
          }
        }
        knownIds.current.add(order.id);
      }
    });
  }, []);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
        Carregando painel...
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/8 bg-[var(--ink-soft)] md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <div>
            <p className="font-display text-2xl">Fry Sushi</p>
            <p className="text-xs text-[var(--rice-dim)]">Centro de comando · Goiânia</p>
          </div>
          <Button
            size="sm"
            variant={settings.isOpen ? "default" : "secondary"}
            className="md:mt-4"
            onClick={() => updateSettings({ isOpen: !settings.isOpen })}
          >
            <Store className="size-4" />
            {settings.isOpen ? "Loja Aberta" : "Loja Fechada"}
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition",
                  active
                    ? "bg-[var(--salmon)] text-[var(--ink)]"
                    : "text-[var(--rice-dim)] hover:bg-white/6 hover:text-[var(--rice)]"
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {item.href === "/admin/pedidos" && newCount > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--ink)] px-2 py-0.5 text-[10px] text-[var(--rice)]">
                    {newCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--rice-dim)] hover:bg-white/6"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </nav>
      </aside>
      <main className="px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
