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
