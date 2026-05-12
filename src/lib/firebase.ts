import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.databaseURL && config.projectId,
);

const stubApp = { name: "stub" } as unknown as FirebaseApp;

export const firebaseApp: FirebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : stubApp;

export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : (null as unknown as ReturnType<typeof getAuth>);
export const db = isFirebaseConfigured ? getDatabase(firebaseApp) : (null as unknown as ReturnType<typeof getDatabase>);

// Secondary app for admin user creation (so it doesn't sign out current admin)
export function getSecondaryApp(): FirebaseApp {
  const name = "secondary";
  const existing = getApps().find((a) => a.name === name);
  if (existing) return existing;
  return initializeApp(config, name);
}

export { config as firebaseConfig };