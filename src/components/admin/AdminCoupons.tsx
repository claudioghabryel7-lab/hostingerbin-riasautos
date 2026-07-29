"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { createCoupon, subscribeCoupons, subscribeUsers } from "@/lib/store";
import type { Coupon } from "@/types";

export function AdminCouponsPage() {
  const [users, setUsers] = useState<
    { id: string; email: string; name: string; couponPercent?: number }[]
  >([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userId, setUserId] = useState("");
  const [percent, setPercent] = useState("10");
  const [code, setCode] = useState("FRY10");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u1 = subscribeUsers(setUsers);
    const u2 = subscribeCoupons(setCoupons);
    return () => {
      u1();
      u2();
    };
  }, []);

  const grant = async () => {
    if (!userId) {
      alert("Selecione um usuário cadastrado.");
      return;
    }
    const pct = Number(percent);
    if (!pct || pct <= 0 || pct > 100) {
      alert("Percentual inválido.");
      return;
    }
    setBusy(true);
    try {
      const user = users.find((u) => u.id === userId);
      await createCoupon({
        code: code.trim().toUpperCase() || `FRY${pct}`,
        percent: pct,
        userId,
        userEmail: user?.email,
        note: `Cupom concedido pelo colaborador`,
        active: true,
      });
      alert(`Cupom de ${pct}% aplicado na conta de ${user?.name || user?.email}.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Cupons</h1>
        <p className="mt-1 text-[var(--rice-dim)]">
          Cadastro ganha 10% automático. Aqui você concede cupons extras aos
          clientes registrados.
        </p>
      </div>

      <div className="glass-panel max-w-xl space-y-3 rounded-2xl p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Cliente</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} {u.couponPercent ? `(já ${u.couponPercent}%)` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Código</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Desconto (%)</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={percent}
            onChange={(e) => setPercent(e.target.value.replace(/\D/g, "").slice(0, 3))}
          />
        </label>
        <Button onClick={grant} disabled={busy}>
          Conceder cupom
        </Button>
      </div>

      <div className="mt-8 space-y-2">
        <h2 className="font-display text-2xl">Histórico</h2>
        {coupons.length === 0 && (
          <p className="text-[var(--rice-dim)]">Nenhum cupom concedido ainda.</p>
        )}
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm"
          >
            <span>
              <strong>{c.code}</strong> · {c.percent}% · {c.userEmail || c.userId}
            </span>
            <span className="text-[var(--rice-dim)]">
              {new Date(c.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
