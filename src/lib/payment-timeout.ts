import type { Order } from "@/types";

export const PAYMENT_TIMEOUT_MS = 15 * 60 * 1000;

export function paymentDeadline(createdAt: number) {
  return createdAt + PAYMENT_TIMEOUT_MS;
}

export function isPaymentExpired(order: {
  createdAt?: number;
  expiresAt?: number;
  paymentStatus?: string;
  status?: string;
}) {
  if (order.paymentStatus === "approved") return false;
  if (order.status === "cancelled" || order.status === "rejected") return false;
  if (order.paymentStatus !== "pending" && order.status !== "awaiting_payment") {
    return false;
  }
  const deadline =
    order.expiresAt ||
    (order.createdAt ? paymentDeadline(order.createdAt) : 0);
  return deadline > 0 && Date.now() > deadline;
}

export function remainingPaymentMs(order: {
  createdAt?: number;
  expiresAt?: number;
}) {
  const deadline =
    order.expiresAt ||
    (order.createdAt ? paymentDeadline(order.createdAt) : Date.now());
  return Math.max(0, deadline - Date.now());
}

export function formatCountdown(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type ExpirableOrder = Pick<
  Order,
  "id" | "createdAt" | "expiresAt" | "paymentStatus" | "status"
>;
