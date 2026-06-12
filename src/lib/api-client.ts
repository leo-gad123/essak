const API_BASE = (import.meta.env.VITE_API_BASE as string) ?? "/api";

export const api = {
  // Categories
  categories: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
  },

  // Suppliers
  suppliers: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/suppliers`);
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create supplier");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update supplier");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete supplier");
      return res.json();
    },
  },

  // Items
  items: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
  },

  // Stock Movements
  stockMovements: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/stock-movements`);
      if (!res.ok) throw new Error("Failed to fetch stock movements");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/stock-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create stock movement");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/stock-movements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete stock movement");
      return res.json();
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create notification");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update notification");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      return res.json();
    },
  },

  // Users
  users: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
  },

  // Settings
  settings: {
    get: async () => {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    save: async (data: any) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
  },
};
