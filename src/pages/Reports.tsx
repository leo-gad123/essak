import { useState } from "react";
import { useRealtimeList } from "@/lib/db/hooks";
import type { Item, StockMovement } from "@/lib/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateMovementsReport, generateItemsOverviewReport } from "@/lib/pdf";
import { Download, FileBarChart } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";

export default function Reports() {
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

  const exportPreset = (preset: "day" | "week" | "month") => {
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
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate stock-movement reports or a full inventory overview.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Stock movement reports</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportPreset("day")}><Download className="mr-2 h-4 w-4" />Daily</Button>
          <Button variant="outline" onClick={() => exportPreset("week")}><Download className="mr-2 h-4 w-4" />Weekly</Button>
          <Button variant="outline" onClick={() => exportPreset("month")}><Download className="mr-2 h-4 w-4" />Monthly</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All items overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            One PDF listing every item with quantity added, used, and remaining.
          </p>
          <Button onClick={() => generateItemsOverviewReport(items)}>
            <FileBarChart className="mr-2 h-4 w-4" />Generate items overview
          </Button>
        </CardContent>
      </Card>

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