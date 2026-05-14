import { useState } from "react";
import { ref, push, set, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRealtimeList } from "@/lib/db/hooks";
import { nullify, type Supplier } from "@/lib/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Save, X, Download } from "lucide-react";
import { toast } from "sonner";
import { generateSuppliersReport } from "@/lib/pdf";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export default function Suppliers() {
  const { data } = useRealtimeList<Supplier>("suppliers");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Supplier>>({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Directory of vendors and suppliers.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={data.length === 0}
            onClick={() => {
              generateSuppliersReport(data);
              toast.success("Suppliers PDF downloaded");
            }}
          >
            <Download className="mr-2 h-4 w-4" />Download PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New supplier</Button></DialogTrigger>
            <SupplierForm onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>All suppliers ({data.length})</CardTitle></CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suppliers yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.map((s) => {
                const editing = editingId === s.id;
                return (
                  <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-2 md:gap-3 py-3 text-sm">
                    <div className="md:col-span-2 font-medium">
                      {editing ? (
                        <Input value={draft.name ?? s.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                      ) : s.name}
                    </div>
                    <div className="md:col-span-3 text-muted-foreground">
                      {editing ? (
                        <Input value={draft.supplies ?? s.supplies ?? ""} onChange={(e) => setDraft({ ...draft, supplies: e.target.value })} placeholder="Supplies (e.g. Rice, Oil)" />
                      ) : (s.supplies ?? "—")}
                    </div>
                    <div className="md:col-span-2 text-muted-foreground">
                      {editing ? (
                        <Input value={draft.phone ?? s.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Phone" />
                      ) : (s.phone ?? "—")}
                    </div>
                    <div className="md:col-span-2 text-muted-foreground break-all">
                      {editing ? (
                        <Input value={draft.email ?? s.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" />
                      ) : (s.email ?? "—")}
                    </div>
                    <div className="md:col-span-2 text-muted-foreground">
                      {editing ? (
                        <Input value={draft.address ?? s.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Address" />
                      ) : (s.address ?? "—")}
                    </div>
                    <div className="md:col-span-1 flex justify-end gap-1">
                      {editing ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={async () => {
                            await update(ref(db, `suppliers/${s.id}`), nullify({ ...s, ...draft }));
                            setEditingId(null); setDraft({}); toast.success("Updated");
                          }}><Save className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditingId(null); setDraft({}); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => { setEditingId(s.id); setDraft(s); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={async () => {
                            if (!confirm("Delete supplier?")) return;
                            await remove(ref(db, `suppliers/${s.id}`)); toast.success("Removed");
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
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

function SupplierForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [supplies, setSupplies] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New supplier</DialogTitle></DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const r = push(ref(db, "suppliers"));
          await set(r, nullify({ name, supplies, phone, email, address }));
          toast.success("Supplier added");
          onClose();
        }}
        className="space-y-3"
      >
        <div className="space-y-2"><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>What they supply</Label><Input placeholder="e.g. Rice, Cooking oil, Vegetables" value={supplies} onChange={(e) => setSupplies(e.target.value)} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <DialogFooter><Button type="submit">Create</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}