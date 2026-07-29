import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export type AccountRole = "customer" | "collaborator";

export interface DbAccount extends UserProfile {
  emailLower: string;
  passwordHash: string;
  salt: string;
  role: AccountRole;
  sessionToken?: string;
}

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string | null;
}

export interface SessionPayload {
  uid: string;
  email: string;
  role: AccountRole;
  token: string;
}

const SESSION_KEY = "frysushi_session_v1";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string, salt: string) {
  return sha256(`${salt}::${password}::fry-sushi`);
}

export function readSession(): SessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export function writeSession(session: SessionPayload) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function findAccountByEmail(email: string) {
  const emailLower = normalizeEmail(email);
  try {
    const q = query(
      collection(db, "users"),
      where("emailLower", "==", emailLower),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0]!;
      return { id: d.id, ...(d.data() as DbAccount) };
    }
  } catch {
    // fallback se índice ainda não existir
    const snap = await getDocs(collection(db, "users"));
    const found = snap.docs.find((d) => {
      const data = d.data() as DbAccount;
      return (data.emailLower || data.email?.toLowerCase()) === emailLower;
    });
    if (found) return { id: found.id, ...(found.data() as DbAccount) };
  }
  return null;
}

export async function getAccount(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DbAccount) };
}

export async function countCollaborators() {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", "collaborator"),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.filter((d) => (d.data() as DbAccount).role === "collaborator")
      .length;
  }
}

export async function registerAccount(input: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: AccountRole;
  inviteCode?: string;
  address?: string;
}) {
  const emailLower = normalizeEmail(input.email);
  if (!emailLower || input.password.length < 6) {
    throw new Error("E-mail e senha (mín. 6 caracteres) são obrigatórios.");
  }

  const existing = await findAccountByEmail(emailLower);
  if (existing) {
    throw new Error("Este e-mail já está cadastrado. Faça login.");
  }

  if (input.role === "collaborator") {
    const hasCollab = (await countCollaborators()) > 0;
    const expected = process.env.NEXT_PUBLIC_ADMIN_INVITE || "frysushi-admin";
    if (hasCollab && input.inviteCode !== expected) {
      throw new Error(
        "Código de convite inválido. Peça ao responsável da loja."
      );
    }
  }

  const uid = randomId();
  const salt = randomId();
  const passwordHash = await hashPassword(input.password, salt);
  const sessionToken = randomId();
  const now = Date.now();

  const account: DbAccount = {
    uid,
    email: input.email.trim(),
    emailLower,
    name: input.name.trim() || (input.role === "collaborator" ? "Colaborador" : "Cliente"),
    phone: input.phone || "",
    city: "Goiânia",
    address: input.address || "",
    passwordHash,
    salt,
    role: input.role,
    sessionToken,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "users", uid), account);

  const session: SessionPayload = {
    uid,
    email: account.email,
    role: account.role,
    token: sessionToken,
  };
  writeSession(session);
  return { account, session };
}

export async function loginAccount(email: string, password: string) {
  const account = await findAccountByEmail(email);
  if (!account) {
    throw new Error("Conta não encontrada. Crie um cadastro.");
  }
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) {
    throw new Error("Senha incorreta.");
  }
  const sessionToken = randomId();
  await updateDoc(doc(db, "users", account.id), {
    sessionToken,
    updatedAt: Date.now(),
  });
  const session: SessionPayload = {
    uid: account.uid || account.id,
    email: account.email,
    role: account.role || "customer",
    token: sessionToken,
  };
  writeSession(session);
  return { account, session };
}

export async function restoreSession() {
  const session = readSession();
  if (!session) return null;
  const account = await getAccount(session.uid);
  if (!account || account.sessionToken !== session.token) {
    clearSession();
    return null;
  }
  return { account, session };
}

export async function updateAccountProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(
      ([k, v]) =>
        v !== undefined &&
        k !== "uid" &&
        k !== "email" &&
        k !== "createdAt"
    )
  );
  await updateDoc(doc(db, "users", uid), {
    ...clean,
    updatedAt: Date.now(),
  });
  return getAccount(uid);
}

/** Comprime imagem e devolve data URL para gravar no Firestore */
export async function fileToDbImage(
  file: File,
  maxWidth = 1000,
  quality = 0.68
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie apenas imagens.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  // Se ainda grande demais pro Firestore (~900KB seguros), reduz qualidade
  let q = quality;
  while (dataUrl.length > 900_000 && q > 0.4) {
    q -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", q);
  }
  if (dataUrl.length > 950_000) {
    throw new Error(
      "Imagem ainda muito grande. Use uma foto mais leve (até ~1MB)."
    );
  }
  return dataUrl;
}

export async function saveImageToDb(dataUrl: string, folder: string) {
  const id = randomId();
  await setDoc(doc(db, "images", id), {
    id,
    folder,
    dataUrl,
    createdAt: Date.now(),
  });
  return dataUrl;
}
