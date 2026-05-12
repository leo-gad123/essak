import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db, isFirebaseConfigured } from "../firebase";

export function useRealtimeList<T>(path: string): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const r = ref(db, path);
    const unsub = onValue(r, (snap) => {
      const v = snap.val() as Record<string, Omit<T, "id">> | null;
      const items: T[] = v
        ? Object.entries(v).map(([id, val]) => ({ id, ...(val as object) }) as T)
        : [];
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [path]);
  return { data, loading };
}