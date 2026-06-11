import { useCallback, useEffect, useState } from "react";
import { api } from "../api-client";

export function useRealtimeList<T>(
  path: string
): { data: T[]; loading: boolean; refetch: () => Promise<void> } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let result: T[] = [];

      if (path === "categories") {
        result = await api.categories.getAll();
      } else if (path === "suppliers") {
        result = await api.suppliers.getAll();
      } else if (path === "items") {
        result = await api.items.getAll();
      } else if (path === "stock-movements" || path === "stock_movements") {
        result = await api.stockMovements.getAll();
      } else if (path === "notifications") {
        result = await api.notifications.getAll();
      } else if (path === "users") {
        result = await api.users.getAll();
      }

      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}