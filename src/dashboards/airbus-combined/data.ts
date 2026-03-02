/**
 * Data parsing (XLSX) and hooks for Airbus Combined dashboard.
 * Parses two sheets: "Orders Summary" and "Detailed Orders".
 */

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AirbusSummaryData {
  years: number[];
  programs: string[];
  totalLifetimeGross: number;
  grossByYear: Record<number, number>;
  grossByYearByProgram: Record<string, Record<number, number>>;
  netCancelByYear: Record<number, number>;
  netCancelByYearByProgram: Record<string, Record<number, number>>;
  netOrderByYear: Record<number, number>;
  netOrderByYearByProgram: Record<string, Record<number, number>>;
}

export interface AirbusDetailRecord {
  year: number;
  orderDate: string;
  customer: string;
  aircraftModel: string;
  quantity: number;
}

export interface AirbusCustomerSummary {
  name: string;
  totalOrders: number;
  firstYear: number;
  lastYear: number;
  models: string[];
  orderDetails: { year: number; orderDate: string; aircraftModel: string; quantity: number }[];
}

export interface AirbusOrderData {
  summary: AirbusSummaryData;
  details: AirbusDetailRecord[];
  detailYears: number[];
  customers: AirbusCustomerSummary[];
}

// ═══════════════════════════════════════════════════════════════
// Parsing
// ═══════════════════════════════════════════════════════════════

function parseNum(v: any): number {
  if (typeof v === "number") return v;
  return parseInt(String(v).replace(/,/g, "")) || 0;
}

function parseSummarySheet(wb: XLSX.WorkBook): AirbusSummaryData {
  const sheet = wb.Sheets["Orders Summary"];
  if (!sheet) throw new Error("Sheet 'Orders Summary' not found");
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const grossByYear: Record<number, number> = {};
  const grossByYearByProgram: Record<string, Record<number, number>> = {};
  const netCancelByYear: Record<number, number> = {};
  const netCancelByYearByProgram: Record<string, Record<number, number>> = {};
  const netOrderByYear: Record<number, number> = {};
  const netOrderByYearByProgram: Record<string, Record<number, number>> = {};
  const yearSet = new Set<number>();
  const programSet = new Set<string>();

  for (const r of rows) {
    const year = parseNum(r["year"]);
    const program = String(r["aircraft_program"] || "").trim();
    const orderType = String(r["order_type_full"] || "").trim();
    const units = parseNum(r["Units Ordered"]);
    if (!year || !program) continue;

    yearSet.add(year);
    programSet.add(program);

    if (orderType === "Gross Orders") {
      grossByYear[year] = (grossByYear[year] || 0) + units;
      if (!grossByYearByProgram[program]) grossByYearByProgram[program] = {};
      grossByYearByProgram[program][year] = (grossByYearByProgram[program][year] || 0) + units;
    } else if (orderType.includes("cancellation")) {
      netCancelByYear[year] = (netCancelByYear[year] || 0) + units;
      if (!netCancelByYearByProgram[program]) netCancelByYearByProgram[program] = {};
      netCancelByYearByProgram[program][year] = (netCancelByYearByProgram[program][year] || 0) + units;
    } else if (orderType.includes("order")) {
      netOrderByYear[year] = (netOrderByYear[year] || 0) + units;
      if (!netOrderByYearByProgram[program]) netOrderByYearByProgram[program] = {};
      netOrderByYearByProgram[program][year] = (netOrderByYearByProgram[program][year] || 0) + units;
    }
  }

  const years = [...yearSet].sort((a, b) => a - b);
  const programs = [...programSet].sort();
  const totalLifetimeGross = years.reduce((s, y) => s + (grossByYear[y] || 0), 0);

  return {
    years, programs, totalLifetimeGross,
    grossByYear, grossByYearByProgram,
    netCancelByYear, netCancelByYearByProgram,
    netOrderByYear, netOrderByYearByProgram,
  };
}

function parseDetailSheet(wb: XLSX.WorkBook): { details: AirbusDetailRecord[]; detailYears: number[]; customers: AirbusCustomerSummary[] } {
  const sheet = wb.Sheets["Detailed Orders"];
  if (!sheet) return { details: [], detailYears: [], customers: [] };
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const details: AirbusDetailRecord[] = rows
    .filter(r => r["Year"] && r["Quantity"])
    .map(r => ({
      year: parseNum(r["Year"]),
      orderDate: r["Order Date"] ? formatExcelDate(r["Order Date"]) : "",
      customer: String(r["Customer"] || "").trim(),
      aircraftModel: String(r["Aircraft Model"] || "").trim(),
      quantity: parseNum(r["Quantity"]),
    }))
    .filter(d => d.year > 0 && d.quantity > 0);

  const detailYears = [...new Set(details.map(d => d.year))].sort((a, b) => a - b);

  // Customer summaries
  const custMap = new Map<string, {
    totalOrders: number; firstYear: number; lastYear: number;
    models: Set<string>;
    orderDetails: { year: number; orderDate: string; aircraftModel: string; quantity: number }[];
  }>();

  for (const d of details) {
    let c = custMap.get(d.customer);
    if (!c) {
      c = { totalOrders: 0, firstYear: d.year, lastYear: d.year, models: new Set(), orderDetails: [] };
      custMap.set(d.customer, c);
    }
    c.totalOrders += d.quantity;
    c.firstYear = Math.min(c.firstYear, d.year);
    c.lastYear = Math.max(c.lastYear, d.year);
    c.models.add(d.aircraftModel);
    c.orderDetails.push({ year: d.year, orderDate: d.orderDate, aircraftModel: d.aircraftModel, quantity: d.quantity });
  }

  const customers: AirbusCustomerSummary[] = [...custMap.entries()]
    .map(([name, c]) => ({
      name,
      totalOrders: c.totalOrders,
      firstYear: c.firstYear,
      lastYear: c.lastYear,
      models: [...c.models],
      orderDetails: c.orderDetails.sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders);

  return { details, detailYears, customers };
}

function formatExcelDate(v: any): string {
  if (typeof v === "number") {
    // Excel serial date
    const date = new Date((v - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  return String(v);
}

function parseAirbusExcel(ab: ArrayBuffer): AirbusOrderData {
  const wb = XLSX.read(ab, { type: "array" });
  const summary = parseSummarySheet(wb);
  const { details, detailYears, customers } = parseDetailSheet(wb);
  return { summary, details, detailYears, customers };
}

// ═══════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════

export function useAirbusOrderData(url: string) {
  const [data, setData] = useState<AirbusOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.statusText}`);
      setData(parseAirbusExcel(await resp.arrayBuffer()));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// Delivery Types & Parsing
// ═══════════════════════════════════════════════════════════════

export interface AirbusDeliverySummaryData {
  years: number[];
  programs: string[];
  totalLifetime: number;
  deliveriesByYear: Record<number, number>;
  deliveriesByYearByProgram: Record<string, Record<number, number>>;
}

export interface AirbusDeliveryRecord {
  year: number;
  deliveryDate: string;
  customer: string;
  region: string;
  aircraftModel: string;
  quantity: number;
}

export interface AirbusDeliveryCustomerSummary {
  name: string;
  totalDeliveries: number;
  firstYear: number;
  lastYear: number;
  region: string;
  models: string[];
  deliveryDetails: { year: number; deliveryDate: string; aircraftModel: string; region: string; quantity: number }[];
}

export interface AirbusDeliveryData {
  summary: AirbusDeliverySummaryData;
  details: AirbusDeliveryRecord[];
  detailYears: number[];
  customers: AirbusDeliveryCustomerSummary[];
  regions: string[];
  deliveriesByYearByRegion: Record<string, Record<number, number>>;
}

function parseDeliverySummarySheet(wb: XLSX.WorkBook): AirbusDeliverySummaryData {
  const sheet = wb.Sheets["Deliveries Summary"];
  if (!sheet) throw new Error("Sheet 'Deliveries Summary' not found");
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const deliveriesByYear: Record<number, number> = {};
  const deliveriesByYearByProgram: Record<string, Record<number, number>> = {};
  const yearSet = new Set<number>();
  const programSet = new Set<string>();

  for (const r of rows) {
    const year = parseNum(r["Year"]);
    const program = String(r["Aircraft Family"] || "").trim();
    const deliveries = parseNum(r["Deliveries"]);
    if (!year || !program) continue;

    yearSet.add(year);
    programSet.add(program);
    deliveriesByYear[year] = (deliveriesByYear[year] || 0) + deliveries;
    if (!deliveriesByYearByProgram[program]) deliveriesByYearByProgram[program] = {};
    deliveriesByYearByProgram[program][year] = (deliveriesByYearByProgram[program][year] || 0) + deliveries;
  }

  const years = [...yearSet].sort((a, b) => a - b);
  const programs = [...programSet].sort();
  const totalLifetime = years.reduce((s, y) => s + (deliveriesByYear[y] || 0), 0);

  return { years, programs, totalLifetime, deliveriesByYear, deliveriesByYearByProgram };
}

function parseAllDeliveriesSheet(wb: XLSX.WorkBook): {
  details: AirbusDeliveryRecord[];
  detailYears: number[];
  customers: AirbusDeliveryCustomerSummary[];
  regions: string[];
  deliveriesByYearByRegion: Record<string, Record<number, number>>;
} {
  const sheet = wb.Sheets["All Deliveries"];
  if (!sheet) return { details: [], detailYears: [], customers: [], regions: [], deliveriesByYearByRegion: {} };
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const details: AirbusDeliveryRecord[] = rows
    .filter(r => r["Year"] && r["Quantity"])
    .map(r => ({
      year: parseNum(r["Year"]),
      deliveryDate: r["Delivery Date"] ? formatExcelDate(r["Delivery Date"]) : "",
      customer: String(r["Customer"] || "").trim(),
      region: String(r["Region"] || "").trim(),
      aircraftModel: String(r["Aircraft Model"] || "").trim(),
      quantity: parseNum(r["Quantity"]),
    }))
    .filter(d => d.year > 0 && d.quantity > 0);

  const detailYears = [...new Set(details.map(d => d.year))].sort((a, b) => a - b);

  // Region aggregation
  const regionSet = new Set<string>();
  const deliveriesByYearByRegion: Record<string, Record<number, number>> = {};
  for (const d of details) {
    if (!d.region) continue;
    regionSet.add(d.region);
    if (!deliveriesByYearByRegion[d.region]) deliveriesByYearByRegion[d.region] = {};
    deliveriesByYearByRegion[d.region][d.year] = (deliveriesByYearByRegion[d.region][d.year] || 0) + d.quantity;
  }
  const regions = [...regionSet].sort();

  // Customer summaries
  const custMap = new Map<string, {
    totalDeliveries: number; firstYear: number; lastYear: number;
    region: string; models: Set<string>;
    deliveryDetails: { year: number; deliveryDate: string; aircraftModel: string; region: string; quantity: number }[];
  }>();

  for (const d of details) {
    let c = custMap.get(d.customer);
    if (!c) {
      c = { totalDeliveries: 0, firstYear: d.year, lastYear: d.year, region: d.region, models: new Set(), deliveryDetails: [] };
      custMap.set(d.customer, c);
    }
    c.totalDeliveries += d.quantity;
    c.firstYear = Math.min(c.firstYear, d.year);
    c.lastYear = Math.max(c.lastYear, d.year);
    c.models.add(d.aircraftModel);
    c.deliveryDetails.push({ year: d.year, deliveryDate: d.deliveryDate, aircraftModel: d.aircraftModel, region: d.region, quantity: d.quantity });
  }

  const customers: AirbusDeliveryCustomerSummary[] = [...custMap.entries()]
    .map(([name, c]) => ({
      name,
      totalDeliveries: c.totalDeliveries,
      firstYear: c.firstYear,
      lastYear: c.lastYear,
      region: c.region,
      models: [...c.models],
      deliveryDetails: c.deliveryDetails.sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries);

  return { details, detailYears, customers, regions, deliveriesByYearByRegion };
}

function parseDeliveryExcel(ab: ArrayBuffer): AirbusDeliveryData {
  const wb = XLSX.read(ab, { type: "array" });
  const summary = parseDeliverySummarySheet(wb);
  const { details, detailYears, customers, regions, deliveriesByYearByRegion } = parseAllDeliveriesSheet(wb);
  return { summary, details, detailYears, customers, regions, deliveriesByYearByRegion };
}

export function useAirbusDeliveryData(url: string) {
  const [data, setData] = useState<AirbusDeliveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.statusText}`);
      setData(parseDeliveryExcel(await resp.arrayBuffer()));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [url]);
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

// ═══════════════════════════════════════════════════════════════
// Airline Fleet Types & Parsing
// ═══════════════════════════════════════════════════════════════

export interface AirlineFleetRecord {
  customer: string;
  country: string;
  region: string;
  variant: string;
  metric: "Orders" | "Deliveries" | "Operational";
  count: number;
}

export interface AirlineFleetVariantDetail {
  variant: string;
  orders: number;
  deliveries: number;
  operational: number;
}

export interface AirlineFleetSummary {
  name: string;
  country: string;
  region: string;
  totalOrders: number;
  totalDeliveries: number;
  operational: number;
  backlog: number;
  variants: AirlineFleetVariantDetail[];
}

export interface AirlineFleetData {
  totalOrders: number;
  totalDeliveries: number;
  totalOperational: number;
  totalBacklog: number;
  byFamily: Record<string, { orders: number; deliveries: number; operational: number }>;
  byRegion: Record<string, { orders: number; deliveries: number; operational: number }>;
  airlines: AirlineFleetSummary[];
  families: string[];
  regions: string[];
  variants: string[];
}

const FAMILY_MAP: Record<string, string> = {};
function getFamily(variant: string): string {
  if (FAMILY_MAP[variant]) return FAMILY_MAP[variant];
  const v = variant.toUpperCase();
  if (v.includes("A220")) return "A220";
  if (v.includes("A380")) return "A380";
  if (v.includes("A350")) return "A350";
  if (v.includes("A340")) return "A340";
  if (v.includes("A330")) return "A330";
  if (v.includes("A321") || v.includes("A320") || v.includes("A319") || v.includes("A318")) return "A320 Family";
  if (v.includes("A310") || v.includes("A300")) return "A300/A310";
  return variant;
}

function parseMetric(s: string): "Orders" | "Deliveries" | "Operational" | null {
  const lower = s.toLowerCase();
  if (lower.includes("order")) return "Orders";
  if (lower.includes("deliver")) return "Deliveries";
  if (lower.includes("operational")) return "Operational";
  return null;
}

function parseFleetExcel(ab: ArrayBuffer): AirlineFleetData {
  const wb = XLSX.read(ab, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("No sheet found in fleet data");
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const records: AirlineFleetRecord[] = [];
  for (const r of rows) {
    const customer = String(r["Customer"] || "").trim();
    const country = String(r["Country"] || "").trim();
    const region = String(r["Region"] || "").trim();
    const variant = String(r["Aircraft_Variant"] || "").trim();
    const metricRaw = String(r["Metric_Full"] || "").trim();
    const count = parseNum(r["No. of Aircraft"] ?? r["No of Aircraft"]);
    const metric = parseMetric(metricRaw);
    if (!customer || !variant || !metric) continue;
    records.push({ customer, country, region, variant, metric, count });
  }

  // Aggregations
  let totalOrders = 0, totalDeliveries = 0, totalOperational = 0;
  const byFamily: Record<string, { orders: number; deliveries: number; operational: number }> = {};
  const byRegion: Record<string, { orders: number; deliveries: number; operational: number }> = {};
  const variantSet = new Set<string>();
  const regionSet = new Set<string>();

  // Per-airline aggregation
  const airlineMap = new Map<string, {
    country: string;
    region: string;
    totalOrders: number; totalDeliveries: number; operational: number;
    variantMap: Map<string, { orders: number; deliveries: number; operational: number }>;
  }>();

  for (const rec of records) {
    variantSet.add(rec.variant);
    if (rec.region) regionSet.add(rec.region);
    const family = getFamily(rec.variant);

    // Totals
    if (rec.metric === "Orders") totalOrders += rec.count;
    else if (rec.metric === "Deliveries") totalDeliveries += rec.count;
    else if (rec.metric === "Operational") totalOperational += rec.count;

    // By family
    if (!byFamily[family]) byFamily[family] = { orders: 0, deliveries: 0, operational: 0 };
    if (rec.metric === "Orders") byFamily[family].orders += rec.count;
    else if (rec.metric === "Deliveries") byFamily[family].deliveries += rec.count;
    else if (rec.metric === "Operational") byFamily[family].operational += rec.count;

    // By region
    if (rec.region) {
      if (!byRegion[rec.region]) byRegion[rec.region] = { orders: 0, deliveries: 0, operational: 0 };
      if (rec.metric === "Orders") byRegion[rec.region].orders += rec.count;
      else if (rec.metric === "Deliveries") byRegion[rec.region].deliveries += rec.count;
      else if (rec.metric === "Operational") byRegion[rec.region].operational += rec.count;
    }

    // Per airline
    let airline = airlineMap.get(rec.customer);
    if (!airline) {
      airline = { country: rec.country, region: rec.region, totalOrders: 0, totalDeliveries: 0, operational: 0, variantMap: new Map() };
      airlineMap.set(rec.customer, airline);
    }
    if (rec.metric === "Orders") airline.totalOrders += rec.count;
    else if (rec.metric === "Deliveries") airline.totalDeliveries += rec.count;
    else if (rec.metric === "Operational") airline.operational += rec.count;

    let vd = airline.variantMap.get(rec.variant);
    if (!vd) { vd = { orders: 0, deliveries: 0, operational: 0 }; airline.variantMap.set(rec.variant, vd); }
    if (rec.metric === "Orders") vd.orders += rec.count;
    else if (rec.metric === "Deliveries") vd.deliveries += rec.count;
    else if (rec.metric === "Operational") vd.operational += rec.count;
  }

  const airlines: AirlineFleetSummary[] = [...airlineMap.entries()]
    .map(([name, a]) => ({
      name,
      country: a.country,
      region: a.region,
      totalOrders: a.totalOrders,
      totalDeliveries: a.totalDeliveries,
      operational: a.operational,
      backlog: a.totalOrders - a.totalDeliveries,
      variants: [...a.variantMap.entries()]
        .map(([variant, v]) => ({ variant, ...v }))
        .sort((a, b) => b.orders - a.orders),
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders);

  const families = Object.keys(byFamily).sort();
  const regions = [...regionSet].sort();
  const variants = [...variantSet].sort();

  return {
    totalOrders, totalDeliveries, totalOperational,
    totalBacklog: totalOrders - totalDeliveries,
    byFamily, byRegion, airlines, families, regions, variants,
  };
}

export function useAirlineFleetData(url: string) {
  const [data, setData] = useState<AirlineFleetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.statusText}`);
      setData(parseFleetExcel(await resp.arrayBuffer()));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// Summary Overview Types & Parsing (GPTSummary.xlsx)
// ═══════════════════════════════════════════════════════════════

export interface AirbusSummaryVariant {
  variant: string;
  family: string;
  orders: number;
  deliveries: number;
  operational: number;
}

export interface AirbusSummaryOverviewData {
  totalOrders: number;
  totalDeliveries: number;
  totalInFleet: number;
  byFamily: Record<string, { orders: number; deliveries: number; operational: number }>;
  byVariant: AirbusSummaryVariant[];
  families: string[];
}

function parseSummaryOverviewExcel(ab: ArrayBuffer): AirbusSummaryOverviewData {
  const wb = XLSX.read(ab, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("No sheet found in summary data");
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  // Group by variant
  const variantMap = new Map<string, { orders: number; deliveries: number; operational: number }>();

  for (const r of rows) {
    const variant = String(r["Aircraft_Variant"] || "").trim();
    const metricRaw = String(r["Metric_Full"] || "").trim();
    const units = parseNum(r["Units"]);
    if (!variant || !metricRaw) continue;

    let entry = variantMap.get(variant);
    if (!entry) { entry = { orders: 0, deliveries: 0, operational: 0 }; variantMap.set(variant, entry); }

    const lower = metricRaw.toLowerCase();
    if (lower === "orders") entry.orders += units;
    else if (lower === "deliveries") entry.deliveries += units;
    else if (lower.includes("fleet")) entry.operational += units;
  }

  let totalOrders = 0, totalDeliveries = 0, totalInFleet = 0;
  const byFamily: Record<string, { orders: number; deliveries: number; operational: number }> = {};
  const byVariant: AirbusSummaryVariant[] = [];

  for (const [variant, v] of variantMap) {
    const family = getFamily(variant);
    totalOrders += v.orders;
    totalDeliveries += v.deliveries;
    totalInFleet += v.operational;

    if (!byFamily[family]) byFamily[family] = { orders: 0, deliveries: 0, operational: 0 };
    byFamily[family].orders += v.orders;
    byFamily[family].deliveries += v.deliveries;
    byFamily[family].operational += v.operational;

    byVariant.push({ variant, family, ...v });
  }

  byVariant.sort((a, b) => b.orders - a.orders);
  const families = Object.keys(byFamily).sort();

  return { totalOrders, totalDeliveries, totalInFleet, byFamily, byVariant, families };
}

export function useAirbusSummaryOverview(url: string) {
  const [data, setData] = useState<AirbusSummaryOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.statusText}`);
      setData(parseSummaryOverviewExcel(await resp.arrayBuffer()));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setIsLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}
