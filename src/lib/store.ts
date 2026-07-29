import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fileToDbImage, saveImageToDb } from "@/lib/db-auth";
import { DEFAULT_MENU, DEFAULT_SETTINGS } from "@/data/defaults";
import type { MenuItem, Order, OrderStatus, StoreSettings } from "@/types";

export const SETTINGS_PATH = "store/settings";

function normalizeSettings(data?: Partial<StoreSettings> | null): StoreSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
  if (!merged.phone || merged.phone.includes("99999") || merged.phone.includes("(11)")) {
    merged.phone = DEFAULT_SETTINGS.phone;
  }
  if (!merged.city) merged.city = DEFAULT_SETTINGS.city;
  if (!merged.address || merged.address === "Delivery de sushi quentinho") {
    merged.address = DEFAULT_SETTINGS.address;
  }
  if (!merged.logoUrl || merged.logoUrl.includes("logo-mark.svg")) {
    merged.logoUrl = DEFAULT_SETTINGS.logoUrl;
  }
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

/** Comprime e grava a imagem no Firestore (sem Storage / sem Auth). */
export async function uploadImage(file: File, folder = "menu") {
  const dataUrl = await fileToDbImage(file);
  return saveImageToDb(dataUrl, folder);
}

export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "updatedAt">
) {
  const now = Date.now();
  const refDoc = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: now,
    updatedAt: now,
  });
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
  await updateDoc(doc(db, "orders", id), {
    status: "received",
    paymentStatus: "approved",
    mpPaymentId,
    updatedAt: Date.now(),
  });
}
