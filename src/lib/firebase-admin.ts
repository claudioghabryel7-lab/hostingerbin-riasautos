import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "gestorfinan-88c9c";
const STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET || "gestorfinan-88c9c.firebasestorage.app";

export function getAdminApp() {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;

  try {
    if (sa) {
      adminApp = initializeApp({
        credential: cert(JSON.parse(sa)),
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET,
      });
    } else {
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET,
      });
    }
  } catch {
    adminApp = initializeApp({ projectId: PROJECT_ID });
  }

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
