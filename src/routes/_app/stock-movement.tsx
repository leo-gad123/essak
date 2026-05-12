import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ref, push, set, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRealtimeList } from "@/lib/db/hooks";
import { nullify, type Item, type StockMovement } from "@/lib/db/types";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { generateMovementsReport } from "@/lib/pdf";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";

export const Route = createFileRoute("/_app/stock-movement")({
  component: MovementPage,
});

function MovementPage() {
  const { user } = useAuth();
  const { data: items } = useRealtimeList<Item>("items");
  const { data: movements } = useRealtimeList<StockMovement>("stock_movements");

  const [itemId, setItemId] = useState("");
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
    if (qty > item.remaining) return toast.error(`Only ${item.remaining} ${item.unitType} available`);
    const finalTakenBy = (adding ? newPerson : takenBy).trim();
    if (!finalTakenBy) return toast.error("Specify who took it");

    const next = item.remaining - qty;
    await update(ref(db, `items/${item.id}`), {
      remaining: next,
      quantityUsed: item.quantityUsed + qty,
    });
    const r = push(ref(db, "stock_movements"));
    await set(r, nullify({
      itemId: item.id,
      quantity: qty,
      takenBy: finalTakenBy,
      notes,
      createdAt: Date.now(),
      createdBy: user?.uid ?? "unknown",
    }));

    if (next <= 0.25 * item.quantityAdded) {
      await push(ref(db, "notifications"), {
        itemId: item.id,
        itemName: item.name,
        remaining: next,
        threshold: Math.floor(0.25 * item.quantityAdded),
        createdAt: Date.now(),
        read: false,
      });
    }

    toast.success("Movement recorded");
    setQuantity("1"); setNotes(""); setNewPerson(""); setAdding(false);
  };

  const exportRange = (preset: "day" | "week" | "month") => {
    const now = new Date();
    const start = preset === "day" ? startOfDay(now) : preset === "week" ? startOfWeek(now) : startOfMonth(now);
    const filtered = movements.filter((m) => m.createdAt >= start.getTime());
    generateMovementsReport({
      title: `${preset === "day" ? "Daily" : preset === "week" ? "Weekly" : "Monthly"} report`,
      rangeLabel: `${format(start, "PP")} – ${format(now, "PP")}`,
      movements: filtered,
      items,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
          <p className="text-muted-foreground">Record stock-out and export reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportRange("day")}><Download className="mr-2 h-4 w-4" />Daily PDF</Button>
          <Button variant="outline" onClick={() => exportRange("week")}><Download className="mr-2 h-4 w-4" />Weekly</Button>
          <Button variant="outline" onClick={() => exportRange("month")}><Download className="mr-2 h-4 w-4" />Monthly</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Record stock-out</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Item</Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} ({i.remaining} {i.unitType} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Taken by</Label>
                {adding ? (
                  <div className="flex gap-2">
                    <Input placeholder="New person name" value={newPerson} onChange={(e) => setNewPerson(e.target.value)} />
                    <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select value={takenBy} onValueChange={setTakenBy}>
                      <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                      <SelectContent>
                        {peopleNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setAdding(true)}>+ New</Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Record movement</Button>
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
                        <p className="text-xs text-muted-foreground">
                          {m.takenBy} · {format(m.createdAt, "PP p")}
                        </p>
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
    </div>
  );
}