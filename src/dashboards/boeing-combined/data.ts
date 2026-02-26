/**
 * Data hooks for Boeing Combined dashboard Overview tab.
 * Loads all 3 xlsx files and derives combined KPIs + overlay chart data.
 */

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

// ── Types ─────────────────────────────────────────────────────

export interface CombinedOverviewData {
  totalLifetimeOrders: number;
  totalLifetimeDeliveries: number;
  totalPendingOrders: number;
  ordersByYear: Record<number, number>;
  deliveriesByYear: Record<number, number>;
  years: number[]; // union of order + delivery years, sorted
}

// ── Model Family helper (copied for standalone) ───────────────

function getModelFamily(model: string): string {
  if (!model) return "Others";
  const m = model.trim();
  if (m.startsWith("737") || m === "BBJ" || m === "BBJ2" || m === "BBJ3") return "737 Family";
  if (m.startsWith("747")) return "747 Family";
  if (m.startsWith("757")) return "757 Family";
  if (m.startsWith("767")) return "767 Family";
  if (m.startsWith("777") || m === "777X") return "777 Family";
  if (m.startsWith("787")) return "787 Family";
  return "Others";
}

// ── Parsers ───────────────────────────────────────────────────

function findCol(sampleKeys: string[], patterns: string[]): string {
  for (const p of patterns) {
    const found = sampleKeys.find(k => k.trim().toLowerCase() === p.toLowerCase());
    if (found) return found;
  }
  for (const p of patterns) {
    const found = sampleKeys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
    if (found) return found;
  }
  return patterns[0];
}

function parseNum(v: any): number {
  if (typeof v === "number") return v;
  return parseInt(String(v).replace(/,/g, "")) || 0;
}

function parseOrdersXlsx(ab: ArrayBuffer): { total: number; byYear: Record<number, number> } {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
  const byYear: Record<number, number> = {};
  let total = 0;
  for (const row of rows) {
    const year = parseInt(String(row["Order Year"])) || 0;
    const qty = parseInt(String(row["Order Total"])) || 0;
    if (year > 0 && qty > 0) {
      byYear[year] = (byYear[year] || 0) + qty;
      total += qty;
    }
  }
  return { total, byYear };
}

function parseDeliveriesXlsx(ab: ArrayBuffer): { total: number; byYear: Record<number, number> } {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const COL_YEAR = findCol(keys, ["Delivery Year", "Year"]);
  const COL_TOTAL = findCol(keys, ["Delivery Total", "Total", "Quantity"]);
  const byYear: Record<number, number> = {};
  let total = 0;
  for (const row of rows) {
    const year = parseInt(String(row[COL_YEAR])) || 0;
    const qty = parseInt(String(row[COL_TOTAL])) || 0;
    if (year > 0 && qty > 0) {
      byYear[year] = (byYear[year] || 0) + qty;
      total += qty;
    }
  }
  return { total, byYear };
}

function parseUnfulfilledXlsx(ab: ArrayBuffer): { total: number } {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const COL_CUSTOMER = findCol(keys, ["Customer Name", "Customer"]);
  const COL_QTY = findCol(keys, ["Unfilled Orders", "Unfulfilled Orders", "Quantity", "Orders"]);
  let total = 0;
  for (const row of rows) {
    const customer = String(row[COL_CUSTOMER] || "").trim();
    if (!customer || customer.toLowerCase().includes("total")) continue;
    total += parseNum(row[COL_QTY]);
  }
  return { total };
}

// ── Hook ──────────────────────────────────────────────────────

interface UseCombinedDataResult {
  data: CombinedOverviewData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCombinedData(urls: { orders: string; deliveries: string; unfulfilled: string }): UseCombinedDataResult {
  const [data, setData] = useState<CombinedOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersResp, deliveriesResp, unfulfilledResp] = await Promise.all([
        fetch(urls.orders, { cache: "no-store" }),
        fetch(urls.deliveries, { cache: "no-store" }),
        fetch(urls.unfulfilled, { cache: "no-store" }),
      ]);
      if (!ordersResp.ok || !deliveriesResp.ok || !unfulfilledResp.ok) {
        throw new Error("Failed to fetch one or more data files");
      }
      const [ordersAb, deliveriesAb, unfulfilledAb] = await Promise.all([
        ordersResp.arrayBuffer(),
        deliveriesResp.arrayBuffer(),
        unfulfilledResp.arrayBuffer(),
      ]);

      const orders = parseOrdersXlsx(ordersAb);
      const deliveries = parseDeliveriesXlsx(deliveriesAb);
      const unfulfilled = parseUnfulfilledXlsx(unfulfilledAb);

      const yearSet = new Set([...Object.keys(orders.byYear).map(Number), ...Object.keys(deliveries.byYear).map(Number)]);
      const years = Array.from(yearSet).sort((a, b) => a - b);

      setData({
        totalLifetimeOrders: orders.total,
        totalLifetimeDeliveries: deliveries.total,
        totalPendingOrders: unfulfilled.total,
        ordersByYear: orders.byYear,
        deliveriesByYear: deliveries.byYear,
        years,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [urls.orders, urls.deliveries, urls.unfulfilled]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}
