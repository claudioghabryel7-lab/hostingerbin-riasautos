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
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { DEFAULT_MENU, DEFAULT_SETTINGS } from "@/data/defaults";
import type { MenuItem, Order, OrderStatus, StoreSettings } from "@/types";

export const SETTINGS_PATH = "store/settings";

export async function ensureStoreSeeded() {
  const settingsRef = doc(db, SETTINGS_PATH);
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) {
    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      updatedAt: Date.now(),
    });
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
}

export function subscribeSettings(
  cb: (settings: StoreSettings) => void
): Unsubscribe {
  return onSnapshot(doc(db, SETTINGS_PATH), (snap) => {
    if (snap.exists()) {
      cb(snap.data() as StoreSettings);
    } else {
      cb(DEFAULT_SETTINGS);
    }
  });
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
  const q = query(collection(db, "menuItems"), orderBy("sortOrder", "asc"));
  return onSnapshot(q, (snap) => {
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
    if (onlyAvailable) items = items.filter((i) => i.available);
    cb(items);
  });
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

export async function uploadImage(file: File, folder = "menu") {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${safe}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
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
  return onSnapshot(q, (snap) => {
    const active = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Order))
      .filter((o) =>
        ["awaiting_payment", "received", "preparing", "out_for_delivery"].includes(
          o.status
        )
      );
    cb(active);
  });
}

export function subscribeOrderHistory(cb: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const done = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Order))
      .filter((o) =>
        ["completed", "rejected", "cancelled"].includes(o.status)
      );
    cb(done);
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), {
    status,
    updatedAt: Date.now(),
  });
}

export async function markOrderPaid(
  id: string,
  mpPaymentId: string
) {
  await updateDoc(doc(db, "orders", id), {
    status: "received",
    paymentStatus: "approved",
    mpPaymentId,
    updatedAt: Date.now(),
  });
}

