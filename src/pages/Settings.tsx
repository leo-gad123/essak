import { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeList } from "@/lib/db/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Trash2, ShieldAlert, Bell } from "lucide-react";
import type { Item, StockMovement, Notification } from "@/lib/db/types";

interface AppSettings {
  appName: string;
  lowStockPercent: number;
  currency: string;
  notifyOnLowStock: boolean;
}

const DEFAULTS: AppSettings = {
  appName: "StockNova",
  lowStockPercent: 25,
  currency: "USD",
  notifyOnLowStock: true,
};

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const { data: items } = useRealtimeList<Item>("items");
  const { data: movements } = useRealtimeList<StockMovement>("stock_movements");
  const { data: notifications } = useRealtimeList<Notification>("notifications");

  useEffect(() => {
    const r = ref(db, "settings/app");
    return onValue(r, (snap) => {
      const v = snap.val() as Partial<AppSettings> | null;
      if (v) setSettings({ ...DEFAULTS, ...v });
    });
  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground mb-3" />
        <h1 className="text-xl font-semibold">Admins only</h1>
        <p className="text-muted-foreground text-sm">You don't have access to settings.</p>
      </div>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      await update(ref(db, "settings/app"), settings);
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const clearNotifications = async () => {
    if (!confirm("Clear all notifications?")) return;
    await remove(ref(db, "notifications"));
    toast.success("Notifications cleared");
  };

  const clearMovements = async () => {
    if (!confirm("Delete ALL stock movement history? Item quantities will not change.")) return;
    await remove(ref(db, "stock_movements"));
    toast.success("Movement history cleared");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">Admin Settings</h1>
        <p className="text-muted-foreground">Manage application preferences and data.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Application-wide preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App name</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="low">Low stock %</Label>
                <Input
                  id="low"
                  type="number"
                  min={1}
                  max={100}
                  value={settings.lowStockPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, lowStockPercent: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Low-stock notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alert when an item drops below threshold.
                </p>
              </div>
              <Switch
                checked={settings.notifyOnLowStock}
                onCheckedChange={(v) => setSettings({ ...settings, notifyOnLowStock: v })}
              />
            </div>
            <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Data overview</CardTitle>
            <CardDescription>Current database snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Items</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stock movements</span>
              <Badge variant="secondary">{movements.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications</span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift lg:col-span-2 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>Destructive actions. These cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={clearNotifications}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear notifications
            </Button>
            <Button variant="destructive" onClick={clearMovements}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear movement history
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
