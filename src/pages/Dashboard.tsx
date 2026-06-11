import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeList } from "@/lib/db/hooks";
import type { Item, StockMovement, Notification } from "@/lib/db/types";
import { Package, AlertTriangle, ArrowDownToLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const { data: items } = useRealtimeList<Item>("items");
  const { data: movements } = useRealtimeList<StockMovement>("stock-movements");
  const { data: notifs } = useRealtimeList<Notification>("notifications");

  const lowStock = items.filter((i) => i.remaining <= 0.25 * i.quantityAdded);
  const recent = [...movements].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const chartData = items.slice(0, 8).map((i) => ({
    name: i.name.slice(0, 10),
    used: i.quantityUsed,
    remaining: i.remaining,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 stagger">
        <StatCard icon={<Package className="h-4 w-4" />} label="Total items" value={items.length} />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Low stock" value={lowStock.length} accent="warning" />
        <StatCard icon={<ArrowDownToLine className="h-4 w-4" />} label="Movements" value={movements.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 stagger">
        <Card className="lg:col-span-2 hover-lift">
          <CardHeader><CardTitle>Top items — usage vs remaining</CardTitle></CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No items yet. <Link to="/items" className="text-primary underline">Add one</Link>.
              </p>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="used" fill="oklch(0.46 0.18 270)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" fill="oklch(0.62 0.2 275)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader><CardTitle>Low-stock alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stock levels healthy.</p>
            ) : (
              lowStock.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border border-border p-2">
                  <span className="text-sm font-medium">{i.name}</span>
                  <Badge variant="destructive">{i.remaining} {i.unitType}</Badge>
                </div>
              ))
            )}
            {notifs.length > 0 && (
              <p className="pt-2 text-xs text-muted-foreground">{notifs.length} notification(s) recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader><CardTitle>Recent movements</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movements recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{itemMap.get(m.itemId)?.name ?? "Unknown item"}</p>
                    <p className="text-xs text-muted-foreground">
                      Taken by {m.takenBy} · {formatDistanceToNow(m.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="secondary">−{m.quantity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon, label, value, accent,
}: {
  icon: React.ReactNode; label: string; value: number; accent?: "warning";
}) {
  const tone = accent === "warning"
    ? "gradient-warm text-white"
    : "gradient-primary text-primary-foreground";
  return (
    <Card className={`hover-lift overflow-hidden border-0 shadow-elegant ${tone}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between opacity-90">
          <span className="text-sm font-medium">{label}</span>
          <span className="rounded-md bg-white/15 p-1.5">{icon}</span>
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}