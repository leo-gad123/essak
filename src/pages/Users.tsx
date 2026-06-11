import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { getSecondaryApp } from "@/lib/firebase";
import { api } from "@/lib/api-client";
import { useRealtimeList } from "@/lib/db/hooks";
import type { UserRecord } from "@/lib/db/types";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function Users() {
  const { user } = useAuth();
  const { data, refetch } = useRealtimeList<UserRecord & { id: string }>("users");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "standard">("standard");
  const [busy, setBusy] = useState(false);

  const [days, setDays] = useState("30");

  const saveSettings = async () => {
    if (!user) return;
    try {
      await api.users.update(user.uid, { journalRangeDays: Number(days) });
      toast.success("Saved");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const secondary = getSecondaryApp();
      const sAuth = getAuth(secondary);
      const cred = await createUserWithEmailAndPassword(sAuth, email, password);
      await api.users.create({
        email, displayName: name, role, createdAt: Date.now(),
      });
      await signOut(sAuth);
      await refetch();
      toast.success("User created");
      setEmail(""); setName(""); setPassword(""); setRole("standard");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">Users</h1>
        <p className="text-muted-foreground">Manage team access and personal settings.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 pt-4">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle>Add user</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={onCreate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Display name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Password</Label><Input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as "admin" | "standard")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={busy}><Plus className="mr-2 h-4 w-4" />{busy ? "Creating…" : "Create user"}</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>All users ({data.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {data.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{u.displayName ?? u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <Card className="max-w-md">
            <CardHeader><CardTitle>Journal date range</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Default range (days)</Label>
                <Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
              <Button onClick={saveSettings}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}