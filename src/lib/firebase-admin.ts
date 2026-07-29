import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

export function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "obinarias-68350";
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;

  try {
    if (sa) {
      adminApp = initializeApp({
        credential: cert(JSON.parse(sa)),
        projectId,
        storageBucket: "obinarias-68350.firebasestorage.app",
      });
    } else {
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
        storageBucket: "obinarias-68350.firebasestorage.app",
      });
    }
  } catch {
    adminApp = initializeApp({ projectId });
  }

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
