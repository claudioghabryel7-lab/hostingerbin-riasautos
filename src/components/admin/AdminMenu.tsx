"use client";

import { useEffect, useState } from "react";
import { DbImage } from "@/components/ui/DbImage";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  createMenuItem,
  deleteMenuItem,
  ensureStoreSeeded,
  subscribeMenu,
  updateMenuItem,
  uploadImage,
} from "@/lib/store";
import { formatCurrency, formatPriceBR, maskPriceInput, parsePriceBR } from "@/lib/utils";
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
  const [priceText, setPriceText] = useState("");
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
      alert(e instanceof Error ? e.message : "Falha no upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const price = parsePriceBR(priceText);
    if (!form.name.trim() || price <= 0) {
      alert("Nome e preço são obrigatórios. Ex.: 32,90");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price };
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem({ ...payload, orderCount: 0 });
      }
      setForm(EMPTY);
      setPriceText("");
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
    setPriceText(formatPriceBR(item.price));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (item: MenuItem) => {
    if (!confirm(`Excluir "${item.name}" do cardápio?`)) return;
    try {
      await deleteMenuItem(item.id);
      if (editingId === item.id) {
        setEditingId(null);
        setForm(EMPTY);
        setPriceText("");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Cardápio</h1>
        <p className="mt-1 text-[var(--rice-dim)]">
          Adicione, edite ou exclua itens. Preço no formato brasileiro (ex.: 32,90).
        </p>
      </div>

      <div className="glass-panel mb-8 grid gap-4 rounded-2xl p-5 md:grid-cols-[180px_1fr]">
        <label className="relative block aspect-square cursor-pointer overflow-hidden rounded-2xl bg-black/30">
          <DbImage src={form.imageUrl} alt="" fill className="object-cover" />
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
            <span className="mb-1 block text-[var(--rice-dim)]">
              Preço (R$) — use vírgula
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="text-[var(--rice-dim)]">R$</span>
              <input
                inputMode="numeric"
                placeholder="0,00"
                className="w-full bg-transparent outline-none"
                value={priceText}
                onChange={(e) => setPriceText(maskPriceInput(e.target.value))}
              />
            </div>
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
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button onClick={save} disabled={saving || uploading}>
              {editingId ? "Atualizar item" : "Adicionar ao cardápio"}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                  setPriceText("");
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
              <DbImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
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
                <Button size="sm" variant="danger" onClick={() => remove(item)}>
                  Excluir
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
