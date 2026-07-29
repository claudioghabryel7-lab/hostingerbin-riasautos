/** Helpers de pedido no servidor (Admin SDK + fallback REST público). */

export async function getOrderFromFirestore(orderId: string) {
  try {
    const { getAdminDb } = await import("@/lib/firebase-admin");
    const snap = await getAdminDb().collection("orders").doc(orderId).get();
    if (snap.exists) return { id: snap.id, ...snap.data() };
  } catch {
    /* fallback */
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "gestorfinan-88c9c";
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return firestoreDocToObject(orderId, data.fields);
}

export async function patchOrder(orderId: string, data: Record<string, unknown>) {
  try {
    const { getAdminDb } = await import("@/lib/firebase-admin");
    await getAdminDb().collection("orders").doc(orderId).update(data);
    return true;
  } catch {
    return false;
  }
}

function firestoreDocToObject(id: string, fields: Record<string, unknown>) {
  const out: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(fields || {})) {
    out[k] = decodeField(v);
  }
  return out;
}

function decodeField(v: unknown): unknown {
  if (!v || typeof v !== "object") return v;
  const o = v as Record<string, unknown>;
  if ("stringValue" in o) return o.stringValue;
  if ("integerValue" in o) return Number(o.integerValue);
  if ("doubleValue" in o) return Number(o.doubleValue);
  if ("booleanValue" in o) return o.booleanValue;
  if ("timestampValue" in o) return o.timestampValue;
  if ("arrayValue" in o) {
    const values = (o.arrayValue as { values?: unknown[] })?.values || [];
    return values.map(decodeField);
  }
  if ("mapValue" in o) {
    const fields =
      (o.mapValue as { fields?: Record<string, unknown> })?.fields || {};
    const mapped: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) mapped[k] = decodeField(val);
    return mapped;
  }
  return null;
}
