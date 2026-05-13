import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { StockMovement, Item } from "./db/types";

export function generateMovementsReport(opts: {
  title: string;
  rangeLabel: string;
  movements: StockMovement[];
  items: Item[];
}) {
  const doc = new jsPDF();
  const itemMap = new Map(opts.items.map((i) => [i.id, i]));

  // Header
  doc.setFillColor(70, 50, 200);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text("StockNova", 14, 14);
  doc.setFontSize(10);
  doc.text(opts.title, doc.internal.pageSize.getWidth() - 14, 14, { align: "right" });

  doc.setTextColor(20);
  doc.setFontSize(11);
  doc.text(opts.rangeLabel, 14, 32);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), "PPpp")}`, 14, 38);

  // Summary
  const totalQty = opts.movements.reduce((s, m) => s + m.quantity, 0);
  doc.setTextColor(20);
  doc.setFontSize(10);
  doc.text(`Movements: ${opts.movements.length}    Total quantity: ${totalQty}`, 14, 46);

  // Table
  autoTable(doc, {
    startY: 52,
    head: [["Date", "Item", "Qty", "Taken by", "Notes"]],
    body: opts.movements.map((m) => [
      format(m.createdAt, "yyyy-MM-dd HH:mm"),
      itemMap.get(m.itemId)?.name ?? "—",
      String(m.quantity),
      m.takenBy,
      m.notes ?? "",
    ]),
    headStyles: { fillColor: [70, 50, 200] },
    styles: { fontSize: 9 },
  });

  // Per-item breakdown
  const perItem = new Map<string, number>();
  for (const m of opts.movements) perItem.set(m.itemId, (perItem.get(m.itemId) ?? 0) + m.quantity);

  // @ts-expect-error - autoTable extends doc
  const lastY = doc.lastAutoTable?.finalY ?? 60;
  doc.setFontSize(11);
  doc.text("Per-item usage", 14, lastY + 10);
  autoTable(doc, {
    startY: lastY + 14,
    head: [["Item", "Used", "Remaining"]],
    body: Array.from(perItem.entries()).map(([id, used]) => {
      const it = itemMap.get(id);
      return [it?.name ?? id, String(used), String(it?.remaining ?? "—")];
    }),
    headStyles: { fillColor: [70, 50, 200] },
    styles: { fontSize: 9 },
  });

  doc.save(`stocknova-${opts.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

export function generateItemsOverviewReport(items: Item[]) {
  const doc = new jsPDF();

  doc.setFillColor(70, 50, 200);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.text("StockNova", 14, 14);
  doc.setFontSize(10);
  doc.text("Items overview", doc.internal.pageSize.getWidth() - 14, 14, { align: "right" });

  doc.setTextColor(20);
  doc.setFontSize(11);
  doc.text("Inventory snapshot", 14, 32);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), "PPpp")}`, 14, 38);

  const totalAdded = items.reduce((s, i) => s + (i.quantityAdded ?? 0), 0);
  const totalUsed = items.reduce((s, i) => s + (i.quantityUsed ?? 0), 0);
  const totalRemaining = items.reduce((s, i) => s + (i.remaining ?? 0), 0);

  doc.setTextColor(20);
  doc.setFontSize(10);
  doc.text(
    `Items: ${items.length}    Added: ${totalAdded}    Used: ${totalUsed}    Remaining: ${totalRemaining}`,
    14,
    46,
  );

  autoTable(doc, {
    startY: 52,
    head: [["Item", "Unit", "Size", "Added", "Used", "Remaining"]],
    body: items.map((i) => [
      i.name,
      i.unitType,
      i.size ?? "—",
      String(i.quantityAdded ?? 0),
      String(i.quantityUsed ?? 0),
      String(i.remaining ?? 0),
    ]),
    headStyles: { fillColor: [70, 50, 200] },
    styles: { fontSize: 9 },
  });

  doc.save(`stocknova-items-overview.pdf`);
}