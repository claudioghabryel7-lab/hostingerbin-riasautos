import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Máscara de preço BR enquanto digita (centavos). Ex: 3290 → "32,90" */
export function maskPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  const cents = Number(digits);
  const reais = Math.floor(cents / 100);
  const cent = String(cents % 100).padStart(2, "0");
  return `${reais},${cent}`;
}

export function parsePriceBR(masked: string): number {
  if (!masked.trim()) return 0;
  const normalized = masked.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export function formatPriceBR(value: number): string {
  if (!value && value !== 0) return "";
  return value.toFixed(2).replace(".", ",");
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function orderStatusStep(status: OrderStatus): number {
  const map: Partial<Record<OrderStatus, number>> = {
    awaiting_payment: 0,
    received: 1,
    preparing: 2,
    out_for_delivery: 3,
    ready_for_pickup: 3,
    completed: 4,
  };
  return map[status] ?? -1;
}
