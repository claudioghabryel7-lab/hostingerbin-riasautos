"use client";

import { useEffect, useState } from "react";
import { DbImage } from "@/components/ui/DbImage";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  ensureStoreSeeded,
  subscribeSettings,
  updateSettings,
  uploadImage,
} from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/data/defaults";
import type { StoreSettings } from "@/types";

export function AdminSettingsPage() {
  const [form, setForm] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    ensureStoreSeeded().catch(() => {});
    return subscribeSettings(setForm);
  }, []);

  const onUpload = async (file: File | null, field: "heroImageUrl" | "logoUrl") => {
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, "store");
      setForm((f) => ({ ...f, [field]: url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      alert("Configurações salvas. A loja já atualizou.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Configurações</h1>
        <p className="mt-1 text-[var(--rice-dim)]">
          Autonomia total: imagens, taxa, mensagem de fechamento e identidade.
        </p>
      </div>

      <div className="glass-panel max-w-3xl space-y-5 rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Nome da loja</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.storeName}
              onChange={(e) =>
                setForm((f) => ({ ...f, storeName: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Telefone</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Frase da vitrine</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={form.accentNote || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, accentNote: e.target.value }))
            }
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Taxa de entrega (R$)</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.deliveryFee}
              onChange={(e) =>
                setForm((f) => ({ ...f, deliveryFee: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Pedido mínimo (R$)</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.minOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))
              }
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Cidade</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={form.city || "Goiânia"}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">
            Endereço / ponto de retirada
          </span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={form.pickupAddress || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, pickupAddress: e.target.value }))
            }
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">
            Aviso quando a loja estiver fechada
          </span>
          <textarea
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            rows={2}
            value={form.closedMessage}
            onChange={(e) =>
              setForm((f) => ({ ...f, closedMessage: e.target.value }))
            }
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--rice-dim)]">Horário de reabertura</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            value={form.reopenAt}
            onChange={(e) =>
              setForm((f) => ({ ...f, reopenAt: e.target.value }))
            }
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-[var(--rice-dim)]">Imagem hero (vitrine)</p>
            <label className="relative block h-40 cursor-pointer overflow-hidden rounded-2xl">
              <DbImage src={form.heroImageUrl} alt="" fill className="object-cover" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onUpload(e.target.files?.[0] || null, "heroImageUrl")
                }
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-xs">
                {uploading === "heroImageUrl" ? "Enviando..." : "Trocar hero"}
              </span>
            </label>
          </div>
          <div>
            <p className="mb-2 text-sm text-[var(--rice-dim)]">Logo</p>
            <label className="relative mx-auto block size-40 cursor-pointer overflow-hidden rounded-2xl">
              <DbImage src={form.logoUrl} alt="" fill className="object-cover" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0] || null, "logoUrl")}
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-xs">
                {uploading === "logoUrl" ? "Enviando..." : "Trocar logo"}
              </span>
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isOpen}
            onChange={(e) =>
              setForm((f) => ({ ...f, isOpen: e.target.checked }))
            }
          />
          Loja aberta para pedidos
        </label>

        <Button onClick={save} disabled={saving || !!uploading}>
          Salvar configurações
        </Button>
      </div>
    </AdminShell>
  );
}
