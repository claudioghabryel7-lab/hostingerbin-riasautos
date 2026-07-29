"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  createMenuItem,
  ensureStoreSeeded,
  subscribeMenu,
  updateMenuItem,
  uploadImage,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type MenuCategory,
  type MenuItem,
} from "@/types";

const EMPTY = {
  name: "",
  description: "",
  price: 0,
  category: "big-hots" as MenuCategory,
  imageUrl: "/images/big-hot-1.jpg",
  available: true,
  featured: false,
  sortOrder: 99,
};

export function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureStoreSeeded().catch(() => {});
    return subscribeMenu(setItems, false);
  }, []);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "menu");
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Falha no upload. Verifique as regras do Firebase Storage."
      );
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim() || form.price <= 0) {
      alert("Nome e preço são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateMenuItem(editingId, form);
      } else {
        await createMenuItem(form);
      }
      setForm(EMPTY);
      setEditingId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
      featured: !!item.featured,
      sortOrder: item.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Cardápio</h1>
        <p className="mt-1 text-[var(--rice-dim)]">
          Suba foto, nome e preço — aparece na loja na hora. Imagens são
          100% editáveis por você.
        </p>
      </div>

      <div className="glass-panel mb-8 grid gap-4 rounded-2xl p-5 md:grid-cols-[180px_1fr]">
        <label className="relative block aspect-square cursor-pointer overflow-hidden rounded-2xl bg-black/30">
          <Image src={form.imageUrl} alt="" fill className="object-cover" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-xs">
            {uploading ? "Enviando..." : "Trocar foto"}
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[var(--rice-dim)]">Nome</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[var(--rice-dim)]">Descrição</span>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Preço</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--rice-dim)]">Categoria</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as MenuCategory,
                }))
              }
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
            />
            Destaque na home
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm((f) => ({ ...f, available: e.target.checked }))
              }
            />
            Disponível
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save} disabled={saving || uploading}>
              {editingId ? "Atualizar item" : "Adicionar ao cardápio"}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-white/8 bg-[var(--ink-soft)]"
          >
            <div className="relative h-40">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              {!item.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm">
                  Invisível na loja
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-[var(--salmon)]">
                {CATEGORY_LABELS[item.category]}
              </p>
              <h3 className="mt-1 font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-[var(--rice-dim)] line-clamp-2">
                {item.description}
              </p>
              <p className="mt-2 font-semibold">{formatCurrency(item.price)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => startEdit(item)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant={item.available ? "outline" : "default"}
                  onClick={() =>
                    updateMenuItem(item.id, { available: !item.available })
                  }
                >
                  {item.available ? "Esgotar" : "Reativar"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
