import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fileToDbImage, saveImageToDb } from "@/lib/db-auth";
import { DEFAULT_MENU, DEFAULT_SETTINGS } from "@/data/defaults";
import type { Coupon, MenuItem, Order, OrderStatus, Review, StoreSettings } from "@/types";

export const SETTINGS_PATH = "store/settings";

/** Remove undefined (Firestore rejeita). */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = stripUndefined(v as Record<string, unknown>);
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        item && typeof item === "object"
          ? stripUndefined(item as Record<string, unknown>)
          : item
      );
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

function normalizeSettings(data?: Partial<StoreSettings> | null): StoreSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
  if (!merged.phone || merged.phone.includes("99999") || merged.phone.includes("(11)")) {
    merged.phone = DEFAULT_SETTINGS.phone;
  }
  if (!merged.city) merged.city = DEFAULT_SETTINGS.city;
  if (!merged.address || merged.address === "Delivery de sushi quentinho") {
    merged.address = DEFAULT_SETTINGS.address;
  }
  // Sempre força a logo Fry Sushi (evita ícone antigo / de outro app)
  merged.logoUrl = DEFAULT_SETTINGS.logoUrl;
  if (!merged.storeName || merged.storeName === "Frysuroll") {
    merged.storeName = DEFAULT_SETTINGS.storeName;
  }
  if (
    !merged.accentNote ||
    merged.accentNote.includes("Big Hots crocantes, feitos na hora")
  ) {
    merged.accentNote = DEFAULT_SETTINGS.accentNote;
  }
  if (!merged.pickupAddress) {
    merged.pickupAddress = DEFAULT_SETTINGS.pickupAddress;
  }
  return merged;
}

function localMenu(): MenuItem[] {
  return DEFAULT_MENU.map((item, i) => ({
    ...item,
    id: `local-${i}`,
  }));
}

/** Tenta gravar seed (só funciona logado como admin). Público só lê. */
export async function ensureStoreSeeded() {
  try {
    const settingsRef = doc(db, SETTINGS_PATH);
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: Date.now(),
      });
    } else {
      const current = normalizeSettings(snap.data() as StoreSettings);
      await setDoc(
        settingsRef,
        { ...current, updatedAt: Date.now() },
        { merge: true }
      );
    }

    const menuSnap = await getDocs(collection(db, "menuItems"));
    if (menuSnap.empty) {
      const now = Date.now();
      await Promise.all(
        DEFAULT_MENU.map((item) =>
          addDoc(collection(db, "menuItems"), {
            ...item,
            createdAt: now,
            updatedAt: now,
          })
        )
      );
    }
  } catch {
    // Sem permissão de escrita no público — normal
  }
}

export function subscribeSettings(
  cb: (settings: StoreSettings) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SETTINGS_PATH),
    (snap) => {
      if (snap.exists()) cb(normalizeSettings(snap.data() as StoreSettings));
      else cb(DEFAULT_SETTINGS);
    },
    () => cb(DEFAULT_SETTINGS)
  );
}

export async function updateSettings(partial: Partial<StoreSettings>) {
  await setDoc(
    doc(db, SETTINGS_PATH),
    { ...partial, updatedAt: Date.now() },
    { merge: true }
  );
}

export function subscribeMenu(
  cb: (items: MenuItem[]) => void,
  onlyAvailable = false
): Unsubscribe {
  const apply = (items: MenuItem[]) => {
    const sorted = [...items].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
    cb(onlyAvailable ? sorted.filter((i) => i.available) : sorted);
  };

  const mapSnap = (snap: {
    empty: boolean;
    docs: { id: string; data: () => Record<string, unknown> }[];
  }) => {
    if (snap.empty) {
      apply(localMenu());
      return;
    }
    apply(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)));
  };

  return onSnapshot(
    query(collection(db, "menuItems"), orderBy("sortOrder", "asc")),
    (snap) => mapSnap(snap),
    () =>
      onSnapshot(
        collection(db, "menuItems"),
        (snap) => mapSnap(snap),
        () => apply(localMenu())
      )
  );
}

export async function createMenuItem(
  data: Omit<MenuItem, "id" | "createdAt" | "updatedAt">
) {
  const now = Date.now();
  const refDoc = await addDoc(collection(db, "menuItems"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return refDoc.id;
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  await updateDoc(doc(db, "menuItems", id), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteMenuItem(id: string) {
  await deleteDoc(doc(db, "menuItems", id));
}

/** Comprime e grava a imagem no Firestore (sem Storage / sem Auth). */
export async function uploadImage(file: File, folder = "menu") {
  const dataUrl = await fileToDbImage(file);
  return saveImageToDb(dataUrl, folder);
}

export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "updatedAt" | "expiresAt">
) {
  const now = Date.now();
  const { PAYMENT_TIMEOUT_MS } = await import("@/lib/payment-timeout");
  const payload = stripUndefined({
    ...order,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + PAYMENT_TIMEOUT_MS,
  } as Record<string, unknown>);
  const refDoc = await addDoc(collection(db, "orders"), payload);
  return refDoc.id;
}

export function subscribeOrder(
  id: string,
  cb: (order: Order | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "orders", id), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb({ id: snap.id, ...snap.data() } as Order);
  });
}

export function subscribeActiveOrders(cb: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const active = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Order))
        .filter((o) =>
          [
            "awaiting_payment",
            "received",
            "preparing",
            "out_for_delivery",
            "ready_for_pickup",
          ].includes(o.status)
          && !(
            o.status === "awaiting_payment" &&
            o.paymentStatus === "pending" &&
            (o.expiresAt || o.createdAt + 15 * 60 * 1000) < Date.now()
          )
        );
      cb(active);
    },
    () => cb([])
  );
}

export function subscribeOrderHistory(cb: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const done = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Order))
        .filter((o) =>
          ["completed", "rejected", "cancelled"].includes(o.status)
        );
      cb(done);
    },
    () => cb([])
  );
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), {
    status,
    updatedAt: Date.now(),
  });
}

export async function markOrderPaid(id: string, mpPaymentId: string) {
  const orderRef = doc(db, "orders", id);
  const snap = await getDoc(orderRef);
  await updateDoc(orderRef, {
    status: "received",
    paymentStatus: "approved",
    mpPaymentId,
    updatedAt: Date.now(),
  });
  if (snap.exists()) {
    const order = snap.data() as Order;
    await incrementMenuOrderCounts(order.items || []);
  }
}

export async function incrementMenuOrderCounts(
  items: { id: string; quantity: number }[]
) {
  await Promise.all(
    items
      .filter((i) => i.id && !String(i.id).startsWith("local-"))
      .map((i) =>
        updateDoc(doc(db, "menuItems", i.id), {
          orderCount: increment(i.quantity || 1),
          updatedAt: Date.now(),
        }).catch(() => undefined)
      )
  );
}

export async function confirmCustomerDelivery(orderId: string) {
  await updateDoc(doc(db, "orders", orderId), {
    customerConfirmedDelivery: true,
    status: "completed",
    updatedAt: Date.now(),
  });
}

export async function createReview(data: Omit<Review, "id" | "createdAt" | "visible">) {
  const refDoc = await addDoc(collection(db, "reviews"), {
    ...data,
    visible: true,
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, "orders", data.orderId), {
    reviewed: true,
    updatedAt: Date.now(),
  });
  return refDoc.id;
}

export function subscribeReviews(cb: (reviews: Review[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, "reviews"), orderBy("createdAt", "desc")),
    (snap) => {
      cb(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Review))
          .filter((r) => r.visible !== false)
          .slice(0, 12)
      );
    },
    () => cb([])
  );
}

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt">) {
  const payload = stripUndefined({
    ...data,
    createdAt: Date.now(),
  } as Record<string, unknown>);
  const refDoc = await addDoc(collection(db, "coupons"), payload);
  if (data.userId) {
    await setDoc(
      doc(db, "users", data.userId),
      stripUndefined({
        couponPercent: data.percent,
        updatedAt: Date.now(),
      }),
      { merge: true }
    );
  }
  return refDoc.id;
}

export function subscribeCoupons(cb: (coupons: Coupon[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, "coupons"),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Coupon))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      cb(list);
    },
    () => cb([])
  );
}

export function subscribeUsers(cb: (users: { id: string; email: string; name: string; phone: string; couponPercent?: number }[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      cb(
        snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              email: String(data.email || ""),
              name: String(data.name || ""),
              phone: String(data.phone || ""),
              couponPercent: data.couponPercent as number | undefined,
              role: data.role as string | undefined,
            };
          })
          .filter((u) => u.role !== "collaborator" && u.email)
      );
    },
    () => cb([])
  );
}

export function rememberGuestOrder(orderId: string, guestToken: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("frysushi_guest_orders");
    const list: { orderId: string; guestToken: string }[] = raw
      ? JSON.parse(raw)
      : [];
    list.unshift({ orderId, guestToken });
    localStorage.setItem(
      "frysushi_guest_orders",
      JSON.stringify(list.slice(0, 20))
    );
  } catch {
    /* ignore */
  }
}

export function getGuestTokenForOrder(orderId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("frysushi_guest_orders");
    const list: { orderId: string; guestToken: string }[] = raw
      ? JSON.parse(raw)
      : [];
    return list.find((x) => x.orderId === orderId)?.guestToken || null;
  } catch {
    return null;
  }
}
