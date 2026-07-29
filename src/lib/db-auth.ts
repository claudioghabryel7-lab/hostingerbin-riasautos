import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export type AccountRole = "customer" | "collaborator";

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string | null;
}

const SESSION_KEY = "frysushi_session_v1";
const DEFAULT_INVITE = "frysushi-admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapAuthError(err: unknown): Error {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";
  if (code === "auth/email-already-in-use") {
    return new Error("Este e-mail já está cadastrado. Faça login.");
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return new Error("E-mail ou senha incorretos.");
  }
  if (code === "auth/user-not-found") {
    return new Error("Conta não encontrada. Crie um cadastro.");
  }
  if (code === "auth/weak-password") {
    return new Error("A senha precisa ter no mínimo 6 caracteres.");
  }
  if (code === "auth/invalid-email") {
    return new Error("E-mail inválido.");
  }
  if (err instanceof Error && err.message) return err;
  return new Error("Não foi possível autenticar. Tente novamente.");
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function listenAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function loadProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    phone: String(data.phone ?? ""),
    address: data.address ? String(data.address) : undefined,
    complement: data.complement ? String(data.complement) : undefined,
    neighborhood: data.neighborhood ? String(data.neighborhood) : undefined,
    city: data.city ? String(data.city) : "Goiânia",
    couponPercent:
      typeof data.couponPercent === "number" ? data.couponPercent : undefined,
    welcomeCouponClaimed: Boolean(data.welcomeCouponClaimed),
    createdAt:
      typeof data.createdAt === "number"
        ? data.createdAt
        : Date.now(),
    updatedAt:
      typeof data.updatedAt === "number" ? data.updatedAt : undefined,
  };
}

export async function loadIsCollaborator(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "collaborators", uid));
  return snap.exists();
}

export async function loginAccount(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password
    );
    const [profile, isAdmin] = await Promise.all([
      loadProfile(credential.user.uid),
      loadIsCollaborator(credential.user.uid),
    ]);
    return { user: credential.user, profile, isAdmin };
  } catch (err) {
    throw mapAuthError(err);
  }
}

export async function logoutAccount() {
  clearSession();
  await signOut(auth);
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}) {
  if (!input.address?.trim()) {
    throw new Error("Informe seu endereço em Goiânia para criar a conta.");
  }
  if (input.password.length < 6) {
    throw new Error("A senha precisa ter no mínimo 6 caracteres.");
  }

  try {
    const email = normalizeEmail(input.email);
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password
    );
    const uid = credential.user.uid;
    await updateProfile(credential.user, {
      displayName: input.name.trim(),
    });

    const now = Date.now();
    const profileData = {
      uid,
      email: input.email.trim(),
      emailLower: email,
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: "Goiânia",
      role: "customer" as const,
      couponPercent: 10,
      welcomeCouponClaimed: true,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", uid), profileData);

    const profile = await loadProfile(uid);
    return { user: credential.user, profile };
  } catch (err) {
    throw mapAuthError(err);
  }
}

export async function registerCollaborator(input: {
  email: string;
  password: string;
  name?: string;
  inviteCode?: string;
}) {
  if (input.password.length < 6) {
    throw new Error("A senha precisa ter no mínimo 6 caracteres.");
  }

  const expected =
    process.env.NEXT_PUBLIC_ADMIN_INVITE?.trim() || DEFAULT_INVITE;
  const invite = (input.inviteCode || "").trim() || expected;

  try {
    const email = normalizeEmail(input.email);
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password
    );
    const uid = credential.user.uid;
    const displayName =
      input.name?.trim() || "Colaborador Fry Sushi";
    await updateProfile(credential.user, { displayName });

    const setupRef = doc(db, "meta", "storeSetup");
    const setupSnap = await getDoc(setupRef);
    const isFirst = !setupSnap.exists();

    if (!isFirst) {
      const storedInvite = String(setupSnap.data()?.inviteCode || "");
      if (invite !== storedInvite && invite !== expected) {
        await deleteUser(credential.user).catch(() => undefined);
        throw new Error(
          "Código de convite inválido. Peça ao responsável da loja."
        );
      }
    }

    const now = Date.now();
    await setDoc(doc(db, "collaborators", uid), {
      uid,
      email: input.email.trim(),
      name: displayName,
      inviteCode: isFirst ? expected : invite,
      createdAt: now,
    });

    if (isFirst) {
      await setDoc(setupRef, {
        inviteCode: expected,
        createdAt: serverTimestamp(),
        createdBy: uid,
      });
    }

    await setDoc(doc(db, "users", uid), {
      uid,
      email: input.email.trim(),
      emailLower: email,
      name: displayName,
      phone: "(62) 99504-5038",
      city: "Goiânia",
      role: "collaborator",
      createdAt: now,
      updatedAt: now,
    });

    return { user: credential.user };
  } catch (err) {
    throw mapAuthError(err);
  }
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
        k !== "createdAt" &&
        k !== "couponPercent" &&
        k !== "welcomeCouponClaimed"
    )
  );
  await updateDoc(doc(db, "users", uid), {
    ...clean,
    updatedAt: Date.now(),
  });
  return loadProfile(uid);
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
