import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ref, push, set, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRealtimeList } from "@/lib/db/hooks";
import { nullify, type Item, type Category, type Supplier, type UnitType } from "@/lib/db/types";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/items")({
  component: ItemsPage,
});

function ItemsPage() {
  const { user } = useAuth();
  const { data: items } = useRealtimeList<Item>("items");
  const { data: categories } = useRealtimeList<Category>("categories");
  const { data: suppliers } = useRealtimeList<Supplier>("suppliers");

  const [editing, setEditing] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);

  const adjustStock = async (item: Item, delta: number) => {
    const next = Math.max(0, item.remaining + delta);
    const usedDelta = item.remaining - next;
    await update(ref(db, `items/${item.id}`), {
      remaining: next,
      quantityUsed: Math.max(0, item.quantityUsed + usedDelta),
      quantityAdded: delta > 0 ? item.quantityAdded + delta : item.quantityAdded,
    });
    if (next <= 0.25 * (item.quantityAdded + (delta > 0 ? delta : 0))) {
      await push(ref(db, "notifications"), {
        itemId: item.id,
        itemName: item.name,
        remaining: next,
        threshold: Math.floor(0.25 * item.quantityAdded),
        createdAt: Date.now(),
        read: false,
      });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await remove(ref(db, `items/${id}`));
    toast.success("Item deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Manage inventory items and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/categories"><FolderTree className="mr-2 h-4 w-4" />Categories</Link>
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New item</Button>
            </DialogTrigger>
            <ItemDialog
              item={editing}
              categories={categories}
              suppliers={suppliers}
              onClose={() => { setOpen(false); setEditing(null); }}
              createdBy={user?.uid ?? "unknown"}
            />
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No items yet. Click "New item" to add your first.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-3">Name</th>
                    <th className="px-2 py-3">Category</th>
                    <th className="px-2 py-3">Supplier</th>
                    <th className="px-2 py-3">Unit</th>
                    <th className="px-2 py-3">Added</th>
                    <th className="px-2 py-3">Used</th>
                    <th className="px-2 py-3">Remaining</th>
                    <th className="px-2 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => {
                    const low = i.remaining <= 0.25 * i.quantityAdded;
                    return (
                      <tr key={i.id} className="border-b border-border last:border-0">
                        <td className="px-2 py-3 font-medium">{i.name}</td>
                        <td className="px-2 py-3 text-muted-foreground">
                          {categories.find((c) => c.id === i.categoryId)?.name ?? "—"}
                        </td>
                        <td className="px-2 py-3 text-muted-foreground">
                          {suppliers.find((s) => s.id === i.supplierId)?.name ?? "—"}
                        </td>
                        <td className="px-2 py-3">{i.unitType}</td>
                        <td className="px-2 py-3">{i.quantityAdded}</td>
                        <td className="px-2 py-3">{i.quantityUsed}</td>
                        <td className="px-2 py-3">
                          <Badge variant={low ? "destructive" : "secondary"}>{i.remaining}</Badge>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(i, 1)} aria-label="Add stock">
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(i, -1)} aria-label="Remove stock">
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setOpen(true); }} aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => onDelete(i.id)} aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ItemDialog({
  item, categories, suppliers, onClose, createdBy,
}: {
  item: Item | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  createdBy: string;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState<string>(item?.categoryId ?? "");
  const [supplierId, setSupplierId] = useState<string>(item?.supplierId ?? "");
  const [unitType, setUnitType] = useState<UnitType>(item?.unitType ?? "pieces");
  const [quantityAdded, setQuantityAdded] = useState(String(item?.quantityAdded ?? 0));
  const [size, setSize] = useState(item?.size ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantityAdded);
    const payload = nullify({
      name,
      categoryId: categoryId || null,
      supplierId: supplierId || null,
      unitType,
      quantityAdded: qty,
      quantityUsed: item?.quantityUsed ?? 0,
      remaining: item ? item.remaining + (qty - item.quantityAdded) : qty,
      size,
      notes,
      createdBy,
    });
    if (item) {
      await update(ref(db, `items/${item.id}`), payload);
      toast.success("Item updated");
    } else {
      const r = push(ref(db, "items"));
      await set(r, payload);
      toast.success("Item created");
    }
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{item ? "Edit item" : "New item"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Unit type</Label>
            <Select value={unitType} onValueChange={(v) => setUnitType(v as UnitType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="liters">Liters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={0} value={quantityAdded} onChange={(e) => setQuantityAdded(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Size (optional)</Label>
          <Input value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="submit">{item ? "Save" : "Create"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}