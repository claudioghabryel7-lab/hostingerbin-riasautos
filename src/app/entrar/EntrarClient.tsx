"use client";

import { FormEvent, useEffect, useState } from "react";
import { DbImage } from "@/components/ui/DbImage";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";

export default function EntrarClient() {
  const {
    user,
    profile,
    isAdmin,
    loading,
    login,
    registerCustomer,
    logout,
    updateCustomerProfile,
  } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    queueMicrotask(() => {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    });
  }, [profile]);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, user, isAdmin, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (res.isAdmin) {
          router.push("/admin");
          return;
        }
        router.push("/");
      } else {
        if (!address.trim()) {
          throw new Error("Informe o endereço para criar a conta e ganhar 10% OFF.");
        }
        await registerCustomer({
          email,
          password,
          name,
          phone,
          address,
        });
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!address.trim()) throw new Error("Informe o endereço.");
      await updateCustomerProfile({
        name,
        phone,
        address,
        city: "Goiânia",
      });
      if (!profile?.welcomeCouponClaimed && !profile?.couponPercent) {
        sessionStorage.setItem("frysushi_welcome_coupon", "10");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
        Carregando...
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
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
              <p className="font-display text-2xl">Minha conta</p>
              <p className="text-sm text-[var(--rice-dim)]">{user.email}</p>
              {profile?.couponPercent ? (
                <p className="mt-1 text-xs text-emerald-300">
                  Cupom ativo: {profile.couponPercent}% OFF
                </p>
              ) : null}
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-3">
            <Field label="Nome" value={name} onChange={setName} required />
            <Field
              label="Telefone"
              value={phone}
              onChange={(v) => setPhone(formatPhone(v))}
              required
            />
            <Field
              label="Endereço em Goiânia"
              value={address}
              onChange={setAddress}
              required
            />
            {error && <p className="text-sm text-amber-200">{error}</p>}
            <Button className="w-full" disabled={busy}>
              Salvar dados
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-2">
            <Link href="/" className="text-center text-sm text-[var(--salmon)]">
              Voltar ao cardápio
            </Link>
            <button
              className="text-sm text-[var(--rice-dim)] underline"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-[var(--rice-dim)]">
              {mode === "register"
                ? "Crie sua conta e ganhe 10% OFF"
                : "Login do cliente"}
            </p>
          </div>
        </div>

        {mode === "register" && (
          <div className="mb-4 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
            Ao se cadastrar, sua conta recebe <strong>10% de desconto</strong>{" "}
            automaticamente nos pedidos.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <Field label="Nome completo" value={name} onChange={setName} required />
              <Field
                label="Telefone / WhatsApp"
                value={phone}
                onChange={(v) => setPhone(formatPhone(v))}
                required
              />
              <Field
                label="Endereço em Goiânia"
                value={address}
                onChange={setAddress}
                required
              />
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
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta e ganhar 10% OFF"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-[var(--rice-dim)] underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tenho conta"}
        </button>

        <p className="mt-6 text-center text-xs text-[var(--rice-dim)]">
          Colaborador?{" "}
          <Link href="/admin/login" className="text-[var(--salmon)]">
            Acessar o painel
          </Link>
        </p>
        <Link
          href="/"
          className="mt-3 block text-center text-sm text-[var(--salmon)]"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--rice-dim)]">{label}</span>
      <input
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
