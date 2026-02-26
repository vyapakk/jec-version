/**
 * Data parsing (XLSX), types, and hooks for Boeing Gross Orders dashboard.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

// ── Types ─────────────────────────────────────────────────────

export interface OrderRecord {
  customer: string;
  country: string;
  engine: string;
  model: string;
  modelFamily: string;
  month: string;
  year: number;
  region: string;
  quantity: number;
}

export interface CustomerSummary {
  name: string;
  country: string;
  region: string;
  totalOrders: number;
  firstYear: number;
  lastYear: number;
  models: string[];
  engines: string[];
  orderDetails: { year: number; model: string; engine: string; quantity: number; month: string }[];
}

export interface BoeingOrderData {
  orders: OrderRecord[];
  years: number[];
  totalLifetimeOrders: number;
  ordersByYear: Record<number, number>;
  ordersByYearByModelFamily: Record<string, Record<number, number>>;
  ordersByYearByRegion: Record<string, Record<number, number>>;
  ordersByYearByEngine: Record<string, Record<number, number>>;
  ordersByYearByCountry: Record<string, Record<number, number>>;
  ordersByYearByModel: Record<string, Record<number, number>>;
  customers: CustomerSummary[];
  modelFamilies: string[];
  regions: string[];
  engines: string[];
  topCountries: string[];
  models: string[];
}

// ── Model Family Grouping ─────────────────────────────────────

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

// ── Parse XLSX ────────────────────────────────────────────────

function parseExcelData(arrayBuffer: ArrayBuffer): BoeingOrderData {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Master Sheet
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const orders: OrderRecord[] = rawData
    .filter((row) => row["Order Year"] && row["Order Total"])
    .map((row) => {
      const model = String(row["Model Series"] || "").trim();
      return {
        customer: String(row["Customer Name"] || "").trim(),
        country: String(row["Country"] || "").trim(),
        engine: String(row["Engine"] || "").trim(),
        model,
        modelFamily: getModelFamily(model),
        month: String(row["Order Month"] || "").trim(),
        year: parseInt(String(row["Order Year"])) || 0,
        region: String(row["Region"] || "Undisclosed").trim().replace(/^Unidentified$/i, "Undisclosed"),
        quantity: parseInt(String(row["Order Total"])) || 0,
      };
    })
    .filter((o) => o.year > 0 && o.quantity > 0);

  // Derive unique sorted years
  const yearSet = new Set(orders.map((o) => o.year));
  const years = Array.from(yearSet).sort((a, b) => a - b);

  // Total lifetime orders
  const totalLifetimeOrders = orders.reduce((sum, o) => sum + o.quantity, 0);

  // Aggregations
  const ordersByYear: Record<number, number> = {};
  const ordersByYearByModelFamily: Record<string, Record<number, number>> = {};
  const ordersByYearByRegion: Record<string, Record<number, number>> = {};
  const ordersByYearByEngine: Record<string, Record<number, number>> = {};
  const ordersByYearByCountry: Record<string, Record<number, number>> = {};
  const ordersByYearByModel: Record<string, Record<number, number>> = {};

  for (const o of orders) {
    // By year
    ordersByYear[o.year] = (ordersByYear[o.year] || 0) + o.quantity;

    // By model family x year
    if (!ordersByYearByModelFamily[o.modelFamily]) ordersByYearByModelFamily[o.modelFamily] = {};
    ordersByYearByModelFamily[o.modelFamily][o.year] = (ordersByYearByModelFamily[o.modelFamily][o.year] || 0) + o.quantity;

    // By region x year
    if (!ordersByYearByRegion[o.region]) ordersByYearByRegion[o.region] = {};
    ordersByYearByRegion[o.region][o.year] = (ordersByYearByRegion[o.region][o.year] || 0) + o.quantity;

    // By engine x year
    if (!ordersByYearByEngine[o.engine]) ordersByYearByEngine[o.engine] = {};
    ordersByYearByEngine[o.engine][o.year] = (ordersByYearByEngine[o.engine][o.year] || 0) + o.quantity;

    // By country x year
    if (!ordersByYearByCountry[o.country]) ordersByYearByCountry[o.country] = {};
    ordersByYearByCountry[o.country][o.year] = (ordersByYearByCountry[o.country][o.year] || 0) + o.quantity;

    // By model (exact) x year
    if (!ordersByYearByModel[o.model]) ordersByYearByModel[o.model] = {};
    ordersByYearByModel[o.model][o.year] = (ordersByYearByModel[o.model][o.year] || 0) + o.quantity;
  }

  // Customer summaries
  const customerMap = new Map<string, {
    country: string; region: string; totalOrders: number;
    firstYear: number; lastYear: number;
    models: Set<string>; engines: Set<string>;
    orderDetails: { year: number; model: string; engine: string; quantity: number; month: string }[];
  }>();

  for (const o of orders) {
    let c = customerMap.get(o.customer);
    if (!c) {
      c = {
        country: o.country, region: o.region, totalOrders: 0,
        firstYear: o.year, lastYear: o.year,
        models: new Set(), engines: new Set(), orderDetails: [],
      };
      customerMap.set(o.customer, c);
    }
    c.totalOrders += o.quantity;
    c.firstYear = Math.min(c.firstYear, o.year);
    c.lastYear = Math.max(c.lastYear, o.year);
    c.models.add(o.model);
    c.engines.add(o.engine);
    c.orderDetails.push({ year: o.year, model: o.model, engine: o.engine, quantity: o.quantity, month: o.month });
  }

  const customers: CustomerSummary[] = Array.from(customerMap.entries())
    .map(([name, c]) => ({
      name,
      country: c.country,
      region: c.region,
      totalOrders: c.totalOrders,
      firstYear: c.firstYear,
      lastYear: c.lastYear,
      models: Array.from(c.models),
      engines: Array.from(c.engines),
      orderDetails: c.orderDetails.sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders);

  // Derived lists
  const modelFamilies = Object.keys(ordersByYearByModelFamily).sort();
  const regions = Object.keys(ordersByYearByRegion).sort();
  const engines = Object.keys(ordersByYearByEngine).sort();
  const models = Object.keys(ordersByYearByModel).sort();

  // Top countries by total orders
  const countryTotals = Object.entries(ordersByYearByCountry)
    .map(([country, yearData]) => ({
      country,
      total: Object.values(yearData).reduce((s, v) => s + v, 0),
    }))
    .sort((a, b) => b.total - a.total);
  const topCountries = countryTotals.slice(0, 15).map((c) => c.country);

  return {
    orders, years, totalLifetimeOrders,
    ordersByYear, ordersByYearByModelFamily, ordersByYearByRegion,
    ordersByYearByEngine, ordersByYearByCountry, ordersByYearByModel,
    customers, modelFamilies, regions, engines, topCountries, models,
  };
}

// ── useOrderData Hook ─────────────────────────────────────────

interface UseOrderDataResult {
  data: BoeingOrderData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrderData(dataUrl: string): UseOrderDataResult {
  const [data, setData] = useState<BoeingOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      const parsed = parseExcelData(arrayBuffer);
      setData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [dataUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, error, refetch: fetchData };
}

// ── useDrillDown ──────────────────────────────────────────────

export interface DrillDownState {
  isOpen: boolean;
  segmentName: string;
  yearlyData: Record<number, number>;
  color: string;
}

const initialDrillDown: DrillDownState = {
  isOpen: false, segmentName: "", yearlyData: {}, color: "hsl(192, 95%, 55%)",
};

export function useDrillDown() {
  const [drillDownState, setDrillDownState] = useState<DrillDownState>(initialDrillDown);
  const openDrillDown = useCallback(
    (segmentName: string, yearlyData: Record<number, number>, color: string) => {
      setDrillDownState({ isOpen: true, segmentName, yearlyData, color });
    }, []
  );
  const closeDrillDown = useCallback(() => setDrillDownState(initialDrillDown), []);
  return { drillDownState, openDrillDown, closeDrillDown };
}

// ── useChartDownload ──────────────────────────────────────────

const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;
const HEADER_HEIGHT = 90;
const FOOTER_HEIGHT = 60;
const BG_COLOR = "#0a0f1a";

export function useChartDownload() {
  const downloadChart = useCallback(async (ref: React.RefObject<HTMLDivElement>, filename: string, title?: string) => {
    if (!ref.current) return;
    try {
      const filter = (node: HTMLElement) => !node?.hasAttribute?.("data-download-exclude");
      const chartDataUrl = await toPng(ref.current, { backgroundColor: BG_COLOR, quality: 1, pixelRatio: 3, filter });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
      if (title) {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(0, 0, EXPORT_WIDTH, HEADER_HEIGHT);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "bold 28px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(title, 40, 55);
      }
      const chartImg = new Image();
      chartImg.src = chartDataUrl;
      await new Promise((resolve) => { chartImg.onload = resolve; });
      const topOffset = title ? HEADER_HEIGHT : 20;
      const padding = 30;
      const chartAreaWidth = EXPORT_WIDTH - padding * 2;
      const chartAreaHeight = EXPORT_HEIGHT - topOffset - FOOTER_HEIGHT - padding;
      const scale = Math.min(chartAreaWidth / chartImg.width, chartAreaHeight / chartImg.height);
      const drawW = chartImg.width * scale;
      const drawH = chartImg.height * scale;
      ctx.drawImage(chartImg, (EXPORT_WIDTH - drawW) / 2, topOffset + (chartAreaHeight - drawH) / 2, drawW, drawH);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, EXPORT_HEIGHT - FOOTER_HEIGHT, EXPORT_WIDTH, FOOTER_HEIGHT);
      const logoImg = new Image();
      logoImg.src = stratviewLogoWhite;
      await new Promise((resolve) => { logoImg.onload = resolve; });
      const logoH = 30;
      const logoW = (logoImg.width / logoImg.height) * logoH;
      ctx.drawImage(logoImg, 24, EXPORT_HEIGHT - FOOTER_HEIGHT + (FOOTER_HEIGHT - logoH) / 2, logoW, logoH);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("stratviewresearch.com", EXPORT_WIDTH - 24, EXPORT_HEIGHT - FOOTER_HEIGHT + (FOOTER_HEIGHT + 10) / 2);
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png", 1);
      link.click();
    } catch (error) {
      console.error("Failed to download chart:", error);
    }
  }, []);
  return { downloadChart };
}
