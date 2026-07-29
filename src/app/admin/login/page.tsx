"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DbImage } from "@/components/ui/DbImage";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { ensureStoreSeeded } from "@/lib/store";

export default function AdminLoginPage() {
  const { login, register, user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      ensureStoreSeeded().finally(() => router.replace("/admin"));
    }
  }, [loading, user, isAdmin, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name, inviteCode);
      await ensureStoreSeeded();
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Verifique e-mail/senha."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 pattern-overlay" />
      <div className="glass-panel relative w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <DbImage
            src="/images/logo-fry-sushi.png"
            alt="Fry Sushi"
            width={56}
            height={56}
            className="rounded-full"
          />
          <div>
            <p className="font-display text-3xl">Fry Sushi</p>
            <p className="text-sm text-[var(--rice-dim)]">Painel do colaborador</p>
            <p className="mt-1 text-[11px] text-[var(--rice-dim)]">
              Login via Firebase Authentication (não pelo banco)
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--rice-dim)]">Nome</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[var(--rice-dim)]">
                  Código de convite (se já existir admin)
                </span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="frysushi-admin"
                />
              </label>
            </>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">E-mail</span>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-amber-200">{error}</p>}
          <Button className="w-full" size="lg" disabled={busy}>
            {busy
              ? "Entrando..."
              : mode === "login"
                ? "Entrar como colaborador"
                : "Criar acesso de colaborador"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-[var(--rice-dim)] underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Primeiro acesso? Criar conta de colaborador"
            : "Já tenho conta"}
        </button>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-[var(--salmon)]"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
