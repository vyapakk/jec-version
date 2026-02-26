/**
 * Data parsing (XLSX), types, and hooks for Boeing Combined dashboard.
 * Fully standalone — contains parsers for orders, deliveries, unfulfilled, and combined overview.
 */

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface OrderRecord {
  customer: string; country: string; engine: string; model: string;
  modelFamily: string; month: string; year: number; region: string; quantity: number;
}

export interface DeliveryRecord {
  customer: string; country: string; engine: string; model: string;
  modelFamily: string; year: number; region: string; quantity: number;
}

export interface UnfilledRecord {
  customer: string; country: string; region: string; model: string;
  modelFamily: string; engine: string; quantity: number;
}

export interface OrderCustomerSummary {
  name: string; country: string; region: string; totalOrders: number;
  firstYear: number; lastYear: number; models: string[]; engines: string[];
  orderDetails: { year: number; model: string; engine: string; quantity: number; month: string }[];
}

export interface DeliveryCustomerSummary {
  name: string; country: string; region: string; totalDeliveries: number;
  firstYear: number; lastYear: number; models: string[]; engines: string[];
  deliveryDetails: { year: number; model: string; engine: string; quantity: number }[];
}

export interface UnfulfilledCustomerSummary {
  name: string; country: string; region: string; totalUnfulfilled: number;
  models: string[]; engines: string[];
  details: { model: string; engine: string; quantity: number }[];
}

export interface BoeingOrderData {
  orders: OrderRecord[]; years: number[]; totalLifetimeOrders: number;
  ordersByYear: Record<number, number>;
  ordersByYearByModelFamily: Record<string, Record<number, number>>;
  ordersByYearByRegion: Record<string, Record<number, number>>;
  ordersByYearByEngine: Record<string, Record<number, number>>;
  ordersByYearByCountry: Record<string, Record<number, number>>;
  customers: OrderCustomerSummary[];
  modelFamilies: string[]; regions: string[]; engines: string[];
}

export interface BoeingDeliveryData {
  deliveries: DeliveryRecord[]; years: number[]; totalLifetimeDeliveries: number;
  deliveriesByYear: Record<number, number>;
  deliveriesByYearByModelFamily: Record<string, Record<number, number>>;
  deliveriesByYearByRegion: Record<string, Record<number, number>>;
  deliveriesByYearByEngine: Record<string, Record<number, number>>;
  deliveriesByYearByCountry: Record<string, Record<number, number>>;
  customers: DeliveryCustomerSummary[];
  modelFamilies: string[]; regions: string[]; engines: string[];
}

export interface BoeingUnfulfilledData {
  records: UnfilledRecord[]; totalUnfulfilledOrders: number; totalCustomers: number;
  topModel: { name: string; quantity: number };
  byModel: Record<string, number>; byModelFamily: Record<string, number>;
  byEngine: Record<string, number>; byRegion: Record<string, number>;
  byCountry: Record<string, number>;
  customers: UnfulfilledCustomerSummary[];
  models: string[]; modelFamilies: string[]; engines: string[]; regions: string[];
}

export interface CombinedOverviewData {
  totalLifetimeOrders: number;
  totalLifetimeDeliveries: number;
  totalPendingOrders: number;
  ordersByYear: Record<number, number>;
  deliveriesByYear: Record<number, number>;
  years: number[];
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

export function getModelFamily(model: string): string {
  if (!model) return "Others";
  const m = model.trim();
  if (m.startsWith("737") || m === "BBJ" || m === "BBJ2" || m === "BBJ3") return "737 Family";
  if (m.startsWith("747")) return "747 Family";
  if (m.startsWith("757")) return "757 Family";
  if (m.startsWith("767")) return "767 Family";
  if (m.startsWith("777") || m === "777X") return "777 Family";
  if (m.startsWith("787")) return "787 Family";
  if (m.startsWith("707") || m.startsWith("720")) return "707/720";
  if (m.startsWith("727")) return "727";
  if (m.startsWith("DC-8")) return "DC-8";
  if (m.startsWith("DC-9")) return "DC-9";
  if (m.startsWith("DC-10")) return "DC-10";
  if (m.startsWith("MD-")) return "MD Series";
  return "Others";
}

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

// ═══════════════════════════════════════════════════════════════
// Parse Orders XLSX
// ═══════════════════════════════════════════════════════════════

function parseOrdersExcel(ab: ArrayBuffer): BoeingOrderData {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);

  const orders: OrderRecord[] = rows
    .filter(r => r["Order Year"] && r["Order Total"])
    .map(r => {
      const model = String(r["Model Series"] || "").trim();
      return {
        customer: String(r["Customer Name"] || "").trim(),
        country: String(r["Country"] || "").trim(),
        engine: String(r["Engine"] || "").trim(),
        model, modelFamily: getModelFamily(model),
        month: String(r["Order Month"] || "").trim(),
        year: parseInt(String(r["Order Year"])) || 0,
        region: String(r["Region"] || "Undisclosed").trim().replace(/^Unidentified$/i, "Undisclosed"),
        quantity: parseInt(String(r["Order Total"])) || 0,
      };
    })
    .filter(o => o.year > 0 && o.quantity > 0);

  const years = [...new Set(orders.map(o => o.year))].sort((a, b) => a - b);
  const totalLifetimeOrders = orders.reduce((s, o) => s + o.quantity, 0);

  const ordersByYear: Record<number, number> = {};
  const ordersByYearByModelFamily: Record<string, Record<number, number>> = {};
  const ordersByYearByRegion: Record<string, Record<number, number>> = {};
  const ordersByYearByEngine: Record<string, Record<number, number>> = {};
  const ordersByYearByCountry: Record<string, Record<number, number>> = {};

  for (const o of orders) {
    ordersByYear[o.year] = (ordersByYear[o.year] || 0) + o.quantity;
    if (!ordersByYearByModelFamily[o.modelFamily]) ordersByYearByModelFamily[o.modelFamily] = {};
    ordersByYearByModelFamily[o.modelFamily][o.year] = (ordersByYearByModelFamily[o.modelFamily][o.year] || 0) + o.quantity;
    if (!ordersByYearByRegion[o.region]) ordersByYearByRegion[o.region] = {};
    ordersByYearByRegion[o.region][o.year] = (ordersByYearByRegion[o.region][o.year] || 0) + o.quantity;
    if (!ordersByYearByEngine[o.engine]) ordersByYearByEngine[o.engine] = {};
    ordersByYearByEngine[o.engine][o.year] = (ordersByYearByEngine[o.engine][o.year] || 0) + o.quantity;
    if (!ordersByYearByCountry[o.country]) ordersByYearByCountry[o.country] = {};
    ordersByYearByCountry[o.country][o.year] = (ordersByYearByCountry[o.country][o.year] || 0) + o.quantity;
  }

  const custMap = new Map<string, {
    country: string; region: string; totalOrders: number; firstYear: number; lastYear: number;
    models: Set<string>; engines: Set<string>;
    orderDetails: { year: number; model: string; engine: string; quantity: number; month: string }[];
  }>();
  for (const o of orders) {
    let c = custMap.get(o.customer);
    if (!c) { c = { country: o.country, region: o.region, totalOrders: 0, firstYear: o.year, lastYear: o.year, models: new Set(), engines: new Set(), orderDetails: [] }; custMap.set(o.customer, c); }
    c.totalOrders += o.quantity; c.firstYear = Math.min(c.firstYear, o.year); c.lastYear = Math.max(c.lastYear, o.year);
    c.models.add(o.model); c.engines.add(o.engine);
    c.orderDetails.push({ year: o.year, model: o.model, engine: o.engine, quantity: o.quantity, month: o.month });
  }
  const customers: OrderCustomerSummary[] = [...custMap.entries()]
    .map(([name, c]) => ({ name, country: c.country, region: c.region, totalOrders: c.totalOrders, firstYear: c.firstYear, lastYear: c.lastYear, models: [...c.models], engines: [...c.engines], orderDetails: c.orderDetails.sort((a, b) => a.year - b.year) }))
    .sort((a, b) => b.totalOrders - a.totalOrders);

  return {
    orders, years, totalLifetimeOrders, ordersByYear,
    ordersByYearByModelFamily, ordersByYearByRegion, ordersByYearByEngine, ordersByYearByCountry,
    customers, modelFamilies: Object.keys(ordersByYearByModelFamily).sort(),
    regions: Object.keys(ordersByYearByRegion).sort(), engines: Object.keys(ordersByYearByEngine).sort(),
  };
}

// ═══════════════════════════════════════════════════════════════
// Parse Deliveries XLSX
// ═══════════════════════════════════════════════════════════════

function parseDeliveriesExcel(ab: ArrayBuffer): BoeingDeliveryData {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const COL_YEAR = findCol(keys, ["Delivery Year", "Year"]);
  const COL_TOTAL = findCol(keys, ["Delivery Total", "Total", "Quantity"]);
  const COL_CUSTOMER = findCol(keys, ["Customer Name", "Customer"]);
  const COL_COUNTRY = findCol(keys, ["Country"]);
  const COL_ENGINE = findCol(keys, ["Engine"]);
  const COL_MODEL = findCol(keys, ["Model Series", "Model"]);
  const COL_REGION = findCol(keys, ["Region"]);

  const deliveries: DeliveryRecord[] = rows
    .filter(r => r[COL_YEAR] && r[COL_TOTAL])
    .map(r => {
      const model = String(r[COL_MODEL] || "").trim();
      return {
        customer: String(r[COL_CUSTOMER] || "").trim(),
        country: String(r[COL_COUNTRY] || "").trim(),
        engine: String(r[COL_ENGINE] || "").trim(),
        model, modelFamily: getModelFamily(model),
        year: parseInt(String(r[COL_YEAR])) || 0,
        region: String(r[COL_REGION] || "Undisclosed").trim().replace(/^Unidentified$/i, "Undisclosed"),
        quantity: parseInt(String(r[COL_TOTAL])) || 0,
      };
    })
    .filter(o => o.year > 0 && o.quantity > 0);

  const years = [...new Set(deliveries.map(o => o.year))].sort((a, b) => a - b);
  const totalLifetimeDeliveries = deliveries.reduce((s, o) => s + o.quantity, 0);

  const deliveriesByYear: Record<number, number> = {};
  const deliveriesByYearByModelFamily: Record<string, Record<number, number>> = {};
  const deliveriesByYearByRegion: Record<string, Record<number, number>> = {};
  const deliveriesByYearByEngine: Record<string, Record<number, number>> = {};
  const deliveriesByYearByCountry: Record<string, Record<number, number>> = {};

  for (const o of deliveries) {
    deliveriesByYear[o.year] = (deliveriesByYear[o.year] || 0) + o.quantity;
    if (!deliveriesByYearByModelFamily[o.modelFamily]) deliveriesByYearByModelFamily[o.modelFamily] = {};
    deliveriesByYearByModelFamily[o.modelFamily][o.year] = (deliveriesByYearByModelFamily[o.modelFamily][o.year] || 0) + o.quantity;
    if (!deliveriesByYearByRegion[o.region]) deliveriesByYearByRegion[o.region] = {};
    deliveriesByYearByRegion[o.region][o.year] = (deliveriesByYearByRegion[o.region][o.year] || 0) + o.quantity;
    if (!deliveriesByYearByEngine[o.engine]) deliveriesByYearByEngine[o.engine] = {};
    deliveriesByYearByEngine[o.engine][o.year] = (deliveriesByYearByEngine[o.engine][o.year] || 0) + o.quantity;
    if (!deliveriesByYearByCountry[o.country]) deliveriesByYearByCountry[o.country] = {};
    deliveriesByYearByCountry[o.country][o.year] = (deliveriesByYearByCountry[o.country][o.year] || 0) + o.quantity;
  }

  const custMap = new Map<string, {
    country: string; region: string; totalDeliveries: number; firstYear: number; lastYear: number;
    models: Set<string>; engines: Set<string>;
    deliveryDetails: { year: number; model: string; engine: string; quantity: number }[];
  }>();
  for (const o of deliveries) {
    let c = custMap.get(o.customer);
    if (!c) { c = { country: o.country, region: o.region, totalDeliveries: 0, firstYear: o.year, lastYear: o.year, models: new Set(), engines: new Set(), deliveryDetails: [] }; custMap.set(o.customer, c); }
    c.totalDeliveries += o.quantity; c.firstYear = Math.min(c.firstYear, o.year); c.lastYear = Math.max(c.lastYear, o.year);
    c.models.add(o.model); c.engines.add(o.engine);
    c.deliveryDetails.push({ year: o.year, model: o.model, engine: o.engine, quantity: o.quantity });
  }
  const customers: DeliveryCustomerSummary[] = [...custMap.entries()]
    .map(([name, c]) => ({ name, country: c.country, region: c.region, totalDeliveries: c.totalDeliveries, firstYear: c.firstYear, lastYear: c.lastYear, models: [...c.models], engines: [...c.engines], deliveryDetails: c.deliveryDetails.sort((a, b) => a.year - b.year) }))
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries);

  return {
    deliveries, years, totalLifetimeDeliveries, deliveriesByYear,
    deliveriesByYearByModelFamily, deliveriesByYearByRegion, deliveriesByYearByEngine, deliveriesByYearByCountry,
    customers, modelFamilies: Object.keys(deliveriesByYearByModelFamily).sort(),
    regions: Object.keys(deliveriesByYearByRegion).sort(), engines: Object.keys(deliveriesByYearByEngine).sort(),
  };
}

// ═══════════════════════════════════════════════════════════════
// Parse Unfulfilled XLSX
// ═══════════════════════════════════════════════════════════════

function parseUnfulfilledExcel(ab: ArrayBuffer): BoeingUnfulfilledData {
  const wb = XLSX.read(ab, { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const COL_CUSTOMER = findCol(keys, ["Customer Name", "Customer"]);
  const COL_COUNTRY = findCol(keys, ["Country"]);
  const COL_REGION = findCol(keys, ["Region"]);
  const COL_MODEL = findCol(keys, ["Model Series", "Model"]);
  const COL_ENGINE = findCol(keys, ["Engine"]);
  const COL_QTY = findCol(keys, ["Unfilled Orders", "Unfulfilled Orders", "Quantity", "Orders"]);

  const records: UnfilledRecord[] = rows
    .filter(r => {
      const cust = String(r[COL_CUSTOMER] || "").trim();
      if (!cust || cust.toLowerCase().includes("total")) return false;
      return r[COL_QTY] != null;
    })
    .map(r => {
      const model = String(r[COL_MODEL] || "").trim();
      return {
        customer: String(r[COL_CUSTOMER] || "").trim(),
        country: String(r[COL_COUNTRY] || "").trim(),
        region: String(r[COL_REGION] || "Undisclosed").trim().replace(/^Unidentified$/i, "Undisclosed"),
        model, modelFamily: getModelFamily(model),
        engine: String(r[COL_ENGINE] || "").trim(),
        quantity: parseNum(r[COL_QTY]),
      };
    })
    .filter(r => r.quantity > 0);

  const totalUnfulfilledOrders = records.reduce((s, r) => s + r.quantity, 0);
  const byModel: Record<string, number> = {};
  const byModelFamily: Record<string, number> = {};
  const byEngine: Record<string, number> = {};
  const byRegion: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const r of records) {
    byModel[r.model] = (byModel[r.model] || 0) + r.quantity;
    byModelFamily[r.modelFamily] = (byModelFamily[r.modelFamily] || 0) + r.quantity;
    byEngine[r.engine] = (byEngine[r.engine] || 0) + r.quantity;
    byRegion[r.region] = (byRegion[r.region] || 0) + r.quantity;
    byCountry[r.country] = (byCountry[r.country] || 0) + r.quantity;
  }

  const topModelEntry = Object.entries(byModel).sort((a, b) => b[1] - a[1])[0];
  const topModel = topModelEntry ? { name: topModelEntry[0], quantity: topModelEntry[1] } : { name: "N/A", quantity: 0 };

  const custMap = new Map<string, {
    country: string; region: string; totalUnfulfilled: number;
    models: Set<string>; engines: Set<string>;
    details: { model: string; engine: string; quantity: number }[];
  }>();
  for (const r of records) {
    let c = custMap.get(r.customer);
    if (!c) { c = { country: r.country, region: r.region, totalUnfulfilled: 0, models: new Set(), engines: new Set(), details: [] }; custMap.set(r.customer, c); }
    c.totalUnfulfilled += r.quantity; c.models.add(r.model); c.engines.add(r.engine);
    c.details.push({ model: r.model, engine: r.engine, quantity: r.quantity });
  }
  const customers: UnfulfilledCustomerSummary[] = [...custMap.entries()]
    .map(([name, c]) => ({ name, country: c.country, region: c.region, totalUnfulfilled: c.totalUnfulfilled, models: [...c.models], engines: [...c.engines], details: c.details.sort((a, b) => b.quantity - a.quantity) }))
    .sort((a, b) => b.totalUnfulfilled - a.totalUnfulfilled);

  return {
    records, totalUnfulfilledOrders, totalCustomers: customers.length, topModel,
    byModel, byModelFamily, byEngine, byRegion, byCountry, customers,
    models: Object.keys(byModel).sort(), modelFamilies: Object.keys(byModelFamily).sort(),
    engines: Object.keys(byEngine).sort(), regions: Object.keys(byRegion).sort(),
  };
}

// ═══════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════

function useFetchXlsx<T>(url: string, parser: (ab: ArrayBuffer) => T) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.statusText}`);
      setData(parser(await resp.arrayBuffer()));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}

export function useOrderData(url: string) { return useFetchXlsx(url, parseOrdersExcel); }
export function useDeliveryData(url: string) { return useFetchXlsx(url, parseDeliveriesExcel); }
export function useUnfulfilledData(url: string) { return useFetchXlsx(url, parseUnfulfilledExcel); }

export function useCombinedData(urls: { orders: string; deliveries: string; unfulfilled: string }) {
  const [data, setData] = useState<CombinedOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const [oR, dR, uR] = await Promise.all([
        fetch(urls.orders, { cache: "no-store" }), fetch(urls.deliveries, { cache: "no-store" }), fetch(urls.unfulfilled, { cache: "no-store" }),
      ]);
      if (!oR.ok || !dR.ok || !uR.ok) throw new Error("Failed to fetch data files");
      const [oAb, dAb, uAb] = await Promise.all([oR.arrayBuffer(), dR.arrayBuffer(), uR.arrayBuffer()]);
      const o = parseOrdersExcel(oAb); const d = parseDeliveriesExcel(dAb); const u = parseUnfulfilledExcel(uAb);
      const yearSet = new Set([...Object.keys(o.ordersByYear).map(Number), ...Object.keys(d.deliveriesByYear).map(Number)]);
      setData({
        totalLifetimeOrders: o.totalLifetimeOrders, totalLifetimeDeliveries: d.totalLifetimeDeliveries,
        totalPendingOrders: u.totalUnfulfilledOrders,
        ordersByYear: o.ordersByYear, deliveriesByYear: d.deliveriesByYear,
        years: [...yearSet].sort((a, b) => a - b),
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [urls.orders, urls.deliveries, urls.unfulfilled]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// DrillDown hook
// ═══════════════════════════════════════════════════════════════

export interface DrillDownState {
  isOpen: boolean; segmentName: string; yearlyData: Record<number, number>; color: string; metricLabel: string;
}

const initialDrillDown: DrillDownState = { isOpen: false, segmentName: "", yearlyData: {}, color: "hsl(192, 95%, 55%)", metricLabel: "Value" };

export function useDrillDown() {
  const [drillDownState, setDrillDownState] = useState<DrillDownState>(initialDrillDown);
  const openDrillDown = useCallback(
    (segmentName: string, yearlyData: Record<number, number>, color: string, metricLabel = "Value") => {
      setDrillDownState({ isOpen: true, segmentName, yearlyData, color, metricLabel });
    }, []
  );
  const closeDrillDown = useCallback(() => setDrillDownState(initialDrillDown), []);
  return { drillDownState, openDrillDown, closeDrillDown };
}

// ═══════════════════════════════════════════════════════════════
// Chart Download
// ═══════════════════════════════════════════════════════════════

const EXPORT_WIDTH = 1920; const EXPORT_HEIGHT = 1080; const HEADER_HEIGHT = 90; const FOOTER_HEIGHT = 60; const BG_COLOR = "#0a0f1a";

export function useChartDownload() {
  const downloadChart = useCallback(async (ref: React.RefObject<HTMLDivElement>, filename: string, title?: string) => {
    if (!ref.current) return;
    try {
      const filter = (node: HTMLElement) => !node?.hasAttribute?.("data-download-exclude");
      const chartDataUrl = await toPng(ref.current, { backgroundColor: BG_COLOR, quality: 1, pixelRatio: 3, filter });
      const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); if (!ctx) return;
      canvas.width = EXPORT_WIDTH; canvas.height = EXPORT_HEIGHT;
      ctx.fillStyle = BG_COLOR; ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
      if (title) { ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(0, 0, EXPORT_WIDTH, HEADER_HEIGHT); ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = "bold 28px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillText(title, 40, 55); }
      const chartImg = new Image(); chartImg.src = chartDataUrl;
      await new Promise(resolve => { chartImg.onload = resolve; });
      const topOffset = title ? HEADER_HEIGHT : 20; const padding = 30;
      const chartAreaWidth = EXPORT_WIDTH - padding * 2; const chartAreaHeight = EXPORT_HEIGHT - topOffset - FOOTER_HEIGHT - padding;
      const scale = Math.min(chartAreaWidth / chartImg.width, chartAreaHeight / chartImg.height);
      ctx.drawImage(chartImg, (EXPORT_WIDTH - chartImg.width * scale) / 2, topOffset + (chartAreaHeight - chartImg.height * scale) / 2, chartImg.width * scale, chartImg.height * scale);
      ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(0, EXPORT_HEIGHT - FOOTER_HEIGHT, EXPORT_WIDTH, FOOTER_HEIGHT);
      const logoImg = new Image(); logoImg.src = stratviewLogoWhite;
      await new Promise(resolve => { logoImg.onload = resolve; });
      const logoH = 30; const logoW = (logoImg.width / logoImg.height) * logoH;
      ctx.drawImage(logoImg, 24, EXPORT_HEIGHT - FOOTER_HEIGHT + (FOOTER_HEIGHT - logoH) / 2, logoW, logoH);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "14px system-ui, sans-serif"; ctx.textAlign = "right";
      ctx.fillText("stratviewresearch.com", EXPORT_WIDTH - 24, EXPORT_HEIGHT - FOOTER_HEIGHT + (FOOTER_HEIGHT + 10) / 2);
      const link = document.createElement("a"); link.download = `${filename}.png`; link.href = canvas.toDataURL("image/png", 1); link.click();
    } catch (error) { console.error("Failed to download chart:", error); }
  }, []);
  return { downloadChart };
}
