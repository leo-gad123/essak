import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import { api } from "./api-client";

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
    const loadUserData = async () => {
      try {
        const users = await api.users.getAll();
        const userRecord = users.find((u: any) => u.email === firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: userRecord?.displayName ?? firebaseUser.displayName ?? null,
          role: userRecord?.role ?? "standard",
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName ?? null,
          role: "standard",
        });
      }
      setLoading(false);
    };
    loadUserData();
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
      const users = await api.users.getAll();
      const isFirst = users.length === 0;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await api.users.create({
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