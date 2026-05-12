import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const config = {
  apiKey: "AIzaSyAueb8nNqYmHy2yU-z6MKNBhg1SvMKI00A",
  authDomain: "home-d9fb3.firebaseapp.com",
  databaseURL: "https://home-d9fb3-default-rtdb.firebaseio.com",
  projectId: "home-d9fb3",
  storageBucket: "home-d9fb3.firebasestorage.app",
  messagingSenderId: "739425830376",
  appId: "1:739425830376:web:9d2379d1ddd0c579e4905d",
  measurementId: "G-XNR673SZVD",
};

export const isFirebaseConfigured = true;

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(config);

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);

// Secondary app for admin user creation (so it doesn't sign out current admin)
export function getSecondaryApp(): FirebaseApp {
  const name = "secondary";
  const existing = getApps().find((a) => a.name === name);
  if (existing) return existing;
  return initializeApp(config, name);
}

export { config as firebaseConfig };