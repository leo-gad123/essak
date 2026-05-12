import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { ref, onValue, set, get } from "firebase/database";
import { auth, db, isFirebaseConfigured } from "./firebase";

export type Role = "admin" | "standard";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  bootstrapAdmin: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fu) => {
      setFirebaseUser(fu);
      if (!fu) {
        setUser(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!firebaseUser || !isFirebaseConfigured) return;
    const r = ref(db, `users/${firebaseUser.uid}`);
    const unsub = onValue(r, (snap) => {
      const v = snap.val() as { email?: string; role?: Role; displayName?: string } | null;
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: v?.displayName ?? firebaseUser.displayName ?? null,
        role: v?.role ?? "standard",
      });
      setLoading(false);
    });
    return unsub;
  }, [firebaseUser]);

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    configured: isFirebaseConfigured,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOutUser: async () => {
      await signOut(auth);
    },
    bootstrapAdmin: async (email, password, displayName) => {
      const usersSnap = await get(ref(db, "users"));
      const isFirst = !usersSnap.exists();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `users/${cred.user.uid}`), {
        email,
        displayName,
        role: isFirst ? "admin" : "standard",
        createdAt: Date.now(),
      });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}