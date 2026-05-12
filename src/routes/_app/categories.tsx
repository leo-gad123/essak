import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ref, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRealtimeList } from "@/lib/db/hooks";
import type { Category } from "@/lib/db/types";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { user } = useAuth();
  const { data } = useRealtimeList<Category>("categories");
  const [name, setName] = useState("");

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const r = push(ref(db, "categories"));
    await set(r, { name: name.trim(), createdAt: Date.now(), createdBy: user?.uid ?? "unknown" });
    setName("");
    toast.success("Category added");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Group items by type for easier reporting.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="flex gap-2">
            <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit"><Plus className="mr-2 h-4 w-4" />Add</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>All categories ({data.length})</CardTitle></CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <Button size="icon" variant="ghost" onClick={async () => { await remove(ref(db, `categories/${c.id}`)); toast.success("Removed"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}