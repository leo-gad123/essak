import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRealtimeList } from "@/lib/db/hooks";
import type { Item, StockMovement } from "@/lib/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMovementsReport } from "@/lib/pdf";
import { Download } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: items } = useRealtimeList<Item>("items");
  const { data: movements } = useRealtimeList<StockMovement>("stock_movements");

  const today = new Date();
  const monthAgo = new Date(today.getTime() - 30 * 86400_000);
  const [from, setFrom] = useState(format(monthAgo, "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));

  const onGenerate = () => {
    const fromTs = new Date(from).getTime();
    const toTs = new Date(to).getTime() + 86400_000 - 1;
    const filtered = movements.filter((m) => m.createdAt >= fromTs && m.createdAt <= toTs);
    generateMovementsReport({
      title: "Custom report",
      rangeLabel: `${format(fromTs, "PP")} – ${format(toTs, "PP")}`,
      movements: filtered,
      items,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate custom PDF reports for any date range.</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Custom range</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Button onClick={onGenerate}><Download className="mr-2 h-4 w-4" />Generate PDF</Button>
          <p className="text-xs text-muted-foreground">
            {movements.length} movements available · {items.length} items
          </p>
        </CardContent>
      </Card>
    </div>
  );
}