/**
 * Data parsing (XLSX), types, and hooks for Boeing Deliveries dashboard.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

// ── Types ─────────────────────────────────────────────────────

export interface DeliveryRecord {
  customer: string;
  country: string;
  engine: string;
  model: string;
  modelFamily: string;
  year: number;
  region: string;
  quantity: number;
}

export interface CustomerSummary {
  name: string;
  country: string;
  region: string;
  totalDeliveries: number;
  firstYear: number;
  lastYear: number;
  models: string[];
  engines: string[];
  deliveryDetails: { year: number; model: string; engine: string; quantity: number }[];
}

export interface BoeingDeliveryData {
  deliveries: DeliveryRecord[];
  years: number[];
  totalLifetimeDeliveries: number;
  deliveriesByYear: Record<number, number>;
  deliveriesByYearByModelFamily: Record<string, Record<number, number>>;
  deliveriesByYearByRegion: Record<string, Record<number, number>>;
  deliveriesByYearByEngine: Record<string, Record<number, number>>;
  deliveriesByYearByCountry: Record<string, Record<number, number>>;
  deliveriesByYearByModel: Record<string, Record<number, number>>;
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

function parseExcelData(arrayBuffer: ArrayBuffer): BoeingDeliveryData {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  // Dynamically find column names (handles minor naming differences)
  const sampleKeys = rawData.length > 0 ? Object.keys(rawData[0]) : [];
  const findCol = (patterns: string[]) => {
    for (const p of patterns) {
      const found = sampleKeys.find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (found) return found;
    }
    // Fallback: partial match
    for (const p of patterns) {
      const found = sampleKeys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
      if (found) return found;
    }
    return patterns[0]; // default
  };

  const COL_YEAR = findCol(["Delivery Year", "Year"]);
  const COL_TOTAL = findCol(["Delivery Total", "Total", "Quantity"]);
  const COL_CUSTOMER = findCol(["Customer Name", "Customer"]);
  const COL_COUNTRY = findCol(["Country"]);
  const COL_ENGINE = findCol(["Engine"]);
  const COL_MODEL = findCol(["Model Series", "Model"]);
  const COL_REGION = findCol(["Region"]);

  console.info("[Boeing Deliveries] Columns found:", { COL_YEAR, COL_TOTAL, COL_CUSTOMER, COL_COUNTRY, COL_ENGINE, COL_MODEL, COL_REGION });
  console.info("[Boeing Deliveries] Available keys:", sampleKeys);
  console.info("[Boeing Deliveries] Total raw rows:", rawData.length);

  const deliveries: DeliveryRecord[] = rawData
    .filter((row) => row[COL_YEAR] && row[COL_TOTAL])
    .map((row) => {
      const model = String(row[COL_MODEL] || "").trim();
      return {
        customer: String(row[COL_CUSTOMER] || "").trim(),
        country: String(row[COL_COUNTRY] || "").trim(),
        engine: String(row[COL_ENGINE] || "").trim(),
        model,
        modelFamily: getModelFamily(model),
        year: parseInt(String(row[COL_YEAR])) || 0,
        region: String(row[COL_REGION] || "Unidentified").trim(),
        quantity: parseInt(String(row[COL_TOTAL])) || 0,
      };
    })
    .filter((o) => o.year > 0 && o.quantity > 0);

  const yearSet = new Set(deliveries.map((o) => o.year));
  const years = Array.from(yearSet).sort((a, b) => a - b);
  const totalLifetimeDeliveries = deliveries.reduce((sum, o) => sum + o.quantity, 0);

  const deliveriesByYear: Record<number, number> = {};
  const deliveriesByYearByModelFamily: Record<string, Record<number, number>> = {};
  const deliveriesByYearByRegion: Record<string, Record<number, number>> = {};
  const deliveriesByYearByEngine: Record<string, Record<number, number>> = {};
  const deliveriesByYearByCountry: Record<string, Record<number, number>> = {};
  const deliveriesByYearByModel: Record<string, Record<number, number>> = {};

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

    if (!deliveriesByYearByModel[o.model]) deliveriesByYearByModel[o.model] = {};
    deliveriesByYearByModel[o.model][o.year] = (deliveriesByYearByModel[o.model][o.year] || 0) + o.quantity;
  }

  // Customer summaries
  const customerMap = new Map<string, {
    country: string; region: string; totalDeliveries: number;
    firstYear: number; lastYear: number;
    models: Set<string>; engines: Set<string>;
    deliveryDetails: { year: number; model: string; engine: string; quantity: number }[];
  }>();

  for (const o of deliveries) {
    let c = customerMap.get(o.customer);
    if (!c) {
      c = {
        country: o.country, region: o.region, totalDeliveries: 0,
        firstYear: o.year, lastYear: o.year,
        models: new Set(), engines: new Set(), deliveryDetails: [],
      };
      customerMap.set(o.customer, c);
    }
    c.totalDeliveries += o.quantity;
    c.firstYear = Math.min(c.firstYear, o.year);
    c.lastYear = Math.max(c.lastYear, o.year);
    c.models.add(o.model);
    c.engines.add(o.engine);
    c.deliveryDetails.push({ year: o.year, model: o.model, engine: o.engine, quantity: o.quantity });
  }

  const customers: CustomerSummary[] = Array.from(customerMap.entries())
    .map(([name, c]) => ({
      name,
      country: c.country,
      region: c.region,
      totalDeliveries: c.totalDeliveries,
      firstYear: c.firstYear,
      lastYear: c.lastYear,
      models: Array.from(c.models),
      engines: Array.from(c.engines),
      deliveryDetails: c.deliveryDetails.sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries);

  const modelFamilies = Object.keys(deliveriesByYearByModelFamily).sort();
  const regions = Object.keys(deliveriesByYearByRegion).sort();
  const engines = Object.keys(deliveriesByYearByEngine).sort();
  const models = Object.keys(deliveriesByYearByModel).sort();

  const countryTotals = Object.entries(deliveriesByYearByCountry)
    .map(([country, yearData]) => ({ country, total: Object.values(yearData).reduce((s, v) => s + v, 0) }))
    .sort((a, b) => b.total - a.total);
  const topCountries = countryTotals.slice(0, 15).map((c) => c.country);

  return {
    deliveries, years, totalLifetimeDeliveries,
    deliveriesByYear, deliveriesByYearByModelFamily, deliveriesByYearByRegion,
    deliveriesByYearByEngine, deliveriesByYearByCountry, deliveriesByYearByModel,
    customers, modelFamilies, regions, engines, topCountries, models,
  };
}

// ── useDeliveryData Hook ──────────────────────────────────────

interface UseDeliveryDataResult {
  data: BoeingDeliveryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeliveryData(dataUrl: string): UseDeliveryDataResult {
  const [data, setData] = useState<BoeingDeliveryData | null>(null);
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
