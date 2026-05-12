import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [days, setDays] = useState("30");

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    const r = ref(db, `user_settings/${user.uid}`);
    const unsub = onValue(r, (s) => {
      const v = s.val() as { journalRangeDays?: number } | null;
      if (v?.journalRangeDays) setDays(String(v.journalRangeDays));
    });
    return unsub;
  }, [user]);

  const save = async () => {
    if (!user) return;
    await set(ref(db, `user_settings/${user.uid}`), { journalRangeDays: Number(days) });
    toast.success("Saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Personal preferences for {user?.displayName ?? user?.email}.</p>
      </div>
      <Card className="max-w-md">
        <CardHeader><CardTitle>Journal date range</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Default range (days)</Label>
            <Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}