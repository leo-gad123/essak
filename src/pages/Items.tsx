import { useMemo, useState } from "react";
import { ref, push, set, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRealtimeList } from "@/lib/db/hooks";
import { nullify, type Item, type Category, type Supplier, type StockMovement, type UnitType } from "@/lib/db/types";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Pencil, Trash2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Items() {
  const { user } = useAuth();
  const { data: items } = useRealtimeList<Item>("items");
  const { data: categories } = useRealtimeList<Category>("categories");
  const { data: suppliers } = useRealtimeList<Supplier>("suppliers");
  const { data: movements } = useRealtimeList<StockMovement>("stock_movements");

  const [editing, setEditing] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  const [adjusting, setAdjusting] = useState<Item | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await remove(ref(db, `items/${id}`));
    toast.success("Item deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">Items</h1>
          <p className="text-muted-foreground">Inventory items, categories, and stock movements.</p>
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="movement">Stock movement</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 pt-4">
          <div className="flex justify-end">
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
          <Card>
            <CardHeader><CardTitle>All items ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No items yet.</p>
              ) : (
                <>
                <div className="hidden md:block overflow-x-auto">
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
                            <td className="px-2 py-3"><Badge variant={low ? "destructive" : "secondary"}>{i.remaining}</Badge></td>
                            <td className="px-2 py-3">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => setAdjusting(i)} aria-label="Adjust stock"><PackagePlus className="h-4 w-4 text-primary" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => onDelete(i.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {items.map((i) => {
                    const low = i.remaining <= 0.25 * i.quantityAdded;
                    return (
                      <div key={i.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{i.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {categories.find((c) => c.id === i.categoryId)?.name ?? "—"} · {suppliers.find((s) => s.id === i.supplierId)?.name ?? "—"}
                            </p>
                          </div>
                          <Badge variant={low ? "destructive" : "secondary"}>{i.remaining} {i.unitType}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Added</span><p className="font-medium">{i.quantityAdded}</p></div>
                          <div><span className="text-muted-foreground">Used</span><p className="font-medium">{i.quantityUsed}</p></div>
                          <div><span className="text-muted-foreground">Unit</span><p className="font-medium">{i.unitType}</p></div>
                        </div>
                        <div className="flex justify-end gap-1 pt-1 border-t border-border">
                          <Button size="sm" variant="ghost" onClick={() => setAdjusting(i)}><PackagePlus className="h-4 w-4 mr-1 text-primary" />Adjust</Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setOpen(true); }} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => onDelete(i.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="pt-4">
          <MovementTab items={items} movements={movements} userId={user?.uid ?? "unknown"} />
        </TabsContent>

        <TabsContent value="categories" className="pt-4">
          <CategoriesTab createdBy={user?.uid ?? "unknown"} />
        </TabsContent>
      </Tabs>

      <AdjustStockDialog item={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  );
}

function AdjustStockDialog({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const [mode, setMode] = useState<"in" | "out">("in");
  const [qty, setQty] = useState("1");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter a positive quantity");
    if (mode === "out" && n > item.remaining) return toast.error(`Only ${item.remaining} ${item.unitType} available`);

    if (mode === "in") {
      await update(ref(db, `items/${item.id}`), {
        remaining: item.remaining + n,
        quantityAdded: item.quantityAdded + n,
      });
      toast.success(`Stocked in +${n} ${item.unitType}`);
    } else {
      const next = item.remaining - n;
      await update(ref(db, `items/${item.id}`), {
        remaining: next,
        quantityUsed: item.quantityUsed + n,
      });
      if (next <= 0.25 * item.quantityAdded) {
        await push(ref(db, "notifications"), {
          itemId: item.id, itemName: item.name, remaining: next,
          threshold: Math.floor(0.25 * item.quantityAdded),
          createdAt: Date.now(), read: false,
        });
      }
      toast.success(`Removed −${n} ${item.unitType}`);
    }
    setQty("1");
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock {item ? `— ${item.name}` : ""}</DialogTitle>
        </DialogHeader>
        {item && (
          <form onSubmit={submit} className="space-y-3">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Current remaining</span><span className="font-semibold">{item.remaining} {item.unitType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total added</span><span>{item.quantityAdded}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total used</span><span>{item.quantityUsed}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={mode === "in" ? "default" : "outline"} onClick={() => setMode("in")}>
                <Plus className="mr-2 h-4 w-4" />Stock in
              </Button>
              <Button type="button" variant={mode === "out" ? "default" : "outline"} onClick={() => setMode("out")}>
                <Minus className="mr-2 h-4 w-4" />Stock out
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Quantity ({item.unitType})</Label>
              <Input type="number" min={1} step="any" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                {mode === "in" ? `Add +${qty || 0}` : `Remove −${qty || 0}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({
  item, categories, suppliers, onClose, createdBy,
}: {
  item: Item | null; categories: Category[]; suppliers: Supplier[]; onClose: () => void; createdBy: string;
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
      unitType, quantityAdded: qty,
      quantityUsed: item?.quantityUsed ?? 0,
      remaining: item ? item.remaining + (qty - item.quantityAdded) : qty,
      size, notes, createdBy,
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
      <DialogHeader><DialogTitle>{item ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
        <div className="space-y-2"><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="space-y-2"><Label>Size (optional)</Label><Input value={size} onChange={(e) => setSize(e.target.value)} /></div>
        <div className="space-y-2"><Label>Notes (optional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="submit" className="w-full sm:w-auto">{item ? "Save" : "Create"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function MovementTab({ items, movements, userId }: { items: Item[]; movements: StockMovement[]; userId: string }) {
  const [itemId, setItemId] = useState("");
  const [mode, setMode] = useState<"in" | "out">("out");
  const [quantity, setQuantity] = useState("1");
  const [takenBy, setTakenBy] = useState("");
  const [newPerson, setNewPerson] = useState("");
  const [adding, setAdding] = useState(false);
  const [notes, setNotes] = useState("");

  const peopleNames = useMemo(() => {
    const set = new Set<string>();
    movements.forEach((m) => m.takenBy && set.add(m.takenBy));
    return Array.from(set).sort();
  }, [movements]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === itemId);
    if (!item) return toast.error("Pick an item");
    const qty = Number(quantity);
    if (qty <= 0) return toast.error("Quantity must be > 0");

    if (mode === "out") {
      if (qty > item.remaining) return toast.error(`Only ${item.remaining} ${item.unitType} available`);
      const finalTakenBy = (adding ? newPerson : takenBy).trim();
      if (!finalTakenBy) return toast.error("Specify who took it");
      const next = item.remaining - qty;
      await update(ref(db, `items/${item.id}`), {
        remaining: next, quantityUsed: item.quantityUsed + qty,
      });
      const r = push(ref(db, "stock_movements"));
      await set(r, nullify({
        itemId: item.id, quantity: qty, takenBy: finalTakenBy, notes,
        createdAt: Date.now(), createdBy: userId,
      }));
      if (next <= 0.25 * item.quantityAdded) {
        await push(ref(db, "notifications"), {
          itemId: item.id, itemName: item.name, remaining: next,
          threshold: Math.floor(0.25 * item.quantityAdded),
          createdAt: Date.now(), read: false,
        });
      }
      toast.success(`Stock out −${qty} ${item.unitType}`);
    } else {
      await update(ref(db, `items/${item.id}`), {
        remaining: item.remaining + qty,
        quantityAdded: item.quantityAdded + qty,
      });
      const r = push(ref(db, "stock_movements"));
      await set(r, nullify({
        itemId: item.id, quantity: qty, takenBy: `+ Restock${notes ? `: ${notes}` : ""}`, notes,
        createdAt: Date.now(), createdBy: userId,
      }));
      toast.success(`Stock in +${qty} ${item.unitType}`);
    }
    setQuantity("1"); setNotes(""); setNewPerson(""); setAdding(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Record stock movement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={mode === "in" ? "default" : "outline"} onClick={() => setMode("in")}>
                <Plus className="mr-2 h-4 w-4" />Stock in
              </Button>
              <Button type="button" variant={mode === "out" ? "default" : "outline"} onClick={() => setMode("out")}>
                <Minus className="mr-2 h-4 w-4" />Stock out
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name} ({i.remaining} {i.unitType} left)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            {mode === "out" && <div className="space-y-2">
              <Label>Taken by</Label>
              {adding ? (
                <div className="flex gap-2">
                  <Input placeholder="New person name" value={newPerson} onChange={(e) => setNewPerson(e.target.value)} />
                  <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={takenBy} onValueChange={setTakenBy}>
                    <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                    <SelectContent>
                      {peopleNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setAdding(true)} className="sm:w-auto">+ New</Button>
                </div>
              )}
            </div>}
            <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button type="submit" className="w-full">
              {mode === "in" ? "Add stock" : "Record stock-out"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent movements</CardTitle></CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movements yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {[...movements].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12).map((m) => {
                const item = items.find((i) => i.id === m.itemId);
                return (
                  <div key={m.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{item?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{m.takenBy} · {format(m.createdAt, "PP p")}</p>
                    </div>
                    <Badge variant="secondary">−{m.quantity}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesTab({ createdBy }: { createdBy: string }) {
  const { data } = useRealtimeList<Category>("categories");
  const [name, setName] = useState("");

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const r = push(ref(db, "categories"));
    await set(r, { name: name.trim(), createdAt: Date.now(), createdBy });
    setName("");
    toast.success("Category added");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" className="sm:w-auto"><Plus className="mr-2 h-4 w-4" />Add</Button>
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