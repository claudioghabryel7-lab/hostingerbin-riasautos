import { NextRequest, NextResponse } from "next/server";
import { getPreferenceApi } from "@/lib/mercadopago";

export const runtime = "nodejs";

async function getOrderFromFirestore(orderId: string) {
  // Client-readable via REST with project rules; prefer Admin if available
  try {
    const { getAdminDb } = await import("@/lib/firebase-admin");
    const snap = await getAdminDb().collection("orders").doc(orderId).get();
    if (snap.exists) return { id: snap.id, ...snap.data() };
  } catch {
    /* fallback below */
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "obinarias-68350";
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return firestoreDocToObject(orderId, data.fields);
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
    const fields = (o.mapValue as { fields?: Record<string, unknown> })?.fields || {};
    const mapped: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) mapped[k] = decodeField(val);
    return mapped;
  }
  return null;
}

async function patchOrder(orderId: string, data: Record<string, unknown>) {
  try {
    const { getAdminDb } = await import("@/lib/firebase-admin");
    await getAdminDb().collection("orders").doc(orderId).update(data);
    return true;
  } catch {
    // Fallback: client SDK cannot run well here without auth; return false
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });
    }

    const order = (await getOrderFromFirestore(orderId)) as {
      id: string;
      total?: number;
      items?: { name: string; quantity: number; price: number }[];
      customer?: { name?: string; email?: string };
      status?: string;
    } | null;

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";

    const preference = getPreferenceApi();
    const result = await preference.create({
      body: {
        external_reference: orderId,
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${baseUrl}/pedido/${orderId}?payment=success`,
          failure: `${baseUrl}/pedido/${orderId}?payment=failure`,
          pending: `${baseUrl}/pedido/${orderId}?payment=pending`,
        },
        auto_return: "approved",
        statement_descriptor: "FRYSUROLL",
        items: (order.items || []).map((item) => ({
          id: item.name,
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: "BRL",
        })).concat(
          Number(order.total) >
            (order.items || []).reduce(
              (a, i) => a + i.price * i.quantity,
              0
            )
            ? [
                {
                  id: "delivery",
                  title: "Taxa de entrega",
                  quantity: 1,
                  unit_price:
                    Number(order.total) -
                    (order.items || []).reduce(
                      (a, i) => a + i.price * i.quantity,
                      0
                    ),
                  currency_id: "BRL",
                },
              ]
            : []
        ),
        payer: {
          name: order.customer?.name,
        },
        metadata: { orderId },
      },
    });

    const preferenceId = result.id;
    const initPoint = result.init_point || result.sandbox_init_point;

    await patchOrder(orderId, {
      mpPreferenceId: preferenceId,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      preferenceId,
      initPoint,
      // Client also writes preference id if admin SDK unavailable
      orderId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro no checkout" },
      { status: 500 }
    );
  }
}
