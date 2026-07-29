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
  deleteField,
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

/** Campos proibidos — senha só no Firebase Authentication */
const FORBIDDEN_USER_FIELDS = new Set([
  "password",
  "passwordHash",
  "salt",
  "sessionToken",
  "hash",
]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function stripSecrets<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (FORBIDDEN_USER_FIELDS.has(k)) continue;
    out[k] = v;
  }
  return out as T;
}

function mapAuthError(err: unknown): Error {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "";
  if (code === "auth/email-already-in-use") {
    return new Error("Este e-mail já está no Authentication. Faça login.");
  }
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-login-credentials"
  ) {
    return new Error(
      "E-mail ou senha incorretos no Authentication. Se você cadastrou no modo antigo (só banco), crie de novo em “Primeiro acesso” ou peça reset."
    );
  }
  if (code === "auth/user-not-found") {
    return new Error(
      "Conta não existe no Authentication. Use “Criar acesso de colaborador”."
    );
  }
  if (code === "auth/weak-password") {
    return new Error("A senha precisa ter no mínimo 6 caracteres.");
  }
  if (code === "auth/invalid-email") {
    return new Error("E-mail inválido.");
  }
  if (code === "auth/operation-not-allowed") {
    return new Error(
      "E-mail/senha não está ativo no Firebase Authentication. Ative em Authentication → Sign-in method."
    );
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
      typeof data.createdAt === "number" ? data.createdAt : Date.now(),
    updatedAt:
      typeof data.updatedAt === "number" ? data.updatedAt : undefined,
  };
}

export async function loadIsCollaborator(uid: string): Promise<boolean> {
  const collab = await getDoc(doc(db, "collaborators", uid));
  if (collab.exists()) return true;
  // Fallback: perfil com role (migração)
  const user = await getDoc(doc(db, "users", uid));
  return user.exists() && user.data()?.role === "collaborator";
}

async function ensureCollaboratorDocs(input: {
  uid: string;
  email: string;
  name: string;
  inviteCode: string;
  isFirst: boolean;
}) {
  const now = Date.now();
  await setDoc(
    doc(db, "collaborators", input.uid),
    stripSecrets({
      uid: input.uid,
      email: input.email,
      name: input.name,
      inviteCode: input.isFirst ? input.inviteCode : input.inviteCode,
      createdAt: now,
    }),
    { merge: true }
  );

  if (input.isFirst) {
    await setDoc(
      doc(db, "meta", "storeSetup"),
      {
        inviteCode: input.inviteCode,
        createdAt: serverTimestamp(),
        createdBy: input.uid,
      },
      { merge: true }
    );
  }

  await setDoc(
    doc(db, "users", input.uid),
    stripSecrets({
      uid: input.uid,
      email: input.email,
      emailLower: normalizeEmail(input.email),
      name: input.name,
      phone: "(62) 99504-5038",
      city: "Goiânia",
      role: "collaborator" as const,
      createdAt: now,
      updatedAt: now,
      passwordHash: deleteField(),
      salt: deleteField(),
      sessionToken: deleteField(),
    }),
    { merge: true }
  );
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
    await setDoc(
      doc(db, "users", uid),
      stripSecrets({
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
      })
    );

    const profile = await loadProfile(uid);
    return { user: credential.user, profile };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    // E-mail já no Auth → faz login e atualiza perfil (migração do banco antigo)
    if (code === "auth/email-already-in-use") {
      const logged = await loginAccount(input.email, input.password);
      const uid = logged.user.uid;
      const now = Date.now();
      await setDoc(
        doc(db, "users", uid),
        stripSecrets({
          uid,
          email: input.email.trim(),
          emailLower: normalizeEmail(input.email),
          name: input.name.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          city: "Goiânia",
          role: "customer" as const,
          couponPercent: logged.profile?.couponPercent ?? 10,
          welcomeCouponClaimed: true,
          updatedAt: now,
          createdAt: logged.profile?.createdAt || now,
          passwordHash: deleteField(),
          salt: deleteField(),
          sessionToken: deleteField(),
        }),
        { merge: true }
      );
      const profile = await loadProfile(uid);
      return { user: logged.user, profile };
    }
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
  const displayName = input.name?.trim() || "Colaborador Fry Sushi";
  const email = normalizeEmail(input.email);

  const setupRef = doc(db, "meta", "storeSetup");

  const finishWithUser = async (user: User) => {
    const setupSnap = await getDoc(setupRef);
    const isFirst = !setupSnap.exists();

    if (!isFirst) {
      const storedInvite = String(setupSnap.data()?.inviteCode || "");
      if (invite !== storedInvite && invite !== expected) {
        throw new Error(
          "Código de convite inválido. Peça ao responsável da loja."
        );
      }
    }

    await ensureCollaboratorDocs({
      uid: user.uid,
      email: input.email.trim(),
      name: displayName,
      inviteCode: isFirst ? expected : invite,
      isFirst,
    });

    return { user };
  };

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password
    );
    await updateProfile(credential.user, { displayName });
    try {
      return await finishWithUser(credential.user);
    } catch (err) {
      await deleteUser(credential.user).catch(() => undefined);
      throw err;
    }
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";

    // Já existe no Authentication → entra e garante docs de colaborador
    if (code === "auth/email-already-in-use") {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        input.password
      );
      await updateProfile(credential.user, { displayName }).catch(() => undefined);
      return finishWithUser(credential.user);
    }

    throw mapAuthError(err);
  }
}

export async function updateAccountProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  const clean = stripSecrets(
    Object.fromEntries(
      Object.entries(data).filter(
        ([k, v]) =>
          v !== undefined &&
          k !== "uid" &&
          k !== "email" &&
          k !== "createdAt" &&
          k !== "couponPercent" &&
          k !== "welcomeCouponClaimed"
      )
    ) as Record<string, unknown>
  );
  await updateDoc(doc(db, "users", uid), {
    ...clean,
    updatedAt: Date.now(),
    passwordHash: deleteField(),
    salt: deleteField(),
    sessionToken: deleteField(),
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
