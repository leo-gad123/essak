export interface Category {
  id: string;
  name: string;
  createdAt: number;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  supplies: string | null;
}

export type UnitType = "kg" | "liters" | "pieces";

export interface Item {
  id: string;
  name: string;
  categoryId: string | null;
  supplierId: string | null;
  quantityAdded: number;
  quantityUsed: number;
  remaining: number;
  unitType: UnitType;
  size: string | null;
  notes: string | null;
}

export interface StockMovement {
  id: string;
  itemId: string;
  quantity: number;
  takenBy: string;
  notes: string | null;
  createdAt: number;
  createdBy: string;
}

export interface Notification {
  id: string;
  itemId: string;
  itemName: string;
  remaining: number;
  threshold: number;
  createdAt: number;
  read: boolean;
}

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "standard";
}

export interface UserSettings {
  journalRangeDays?: number;
}

export function nullify<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as Record<string, unknown>;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[k] = v === undefined || v === "" ? null : v;
  }
  return out as T;
}