/**
 * Data parsing (XLSX), types, and hooks for Boeing Unfulfilled Orders dashboard.
 * This is a snapshot dataset — no year dimension.
 */

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

// ── Types ─────────────────────────────────────────────────────

export interface UnfilledRecord {
  customer: string;
  country: string;
  region: string;
  model: string;
  modelFamily: string;
  engine: string;
  quantity: number;
}

export interface CustomerSummary {
  name: string;
  country: string;
  region: string;
  totalUnfulfilled: number;
  models: string[];
  engines: string[];
  details: { model: string; engine: string; quantity: number }[];
}

export interface BoeingUnfulfilledData {
  records: UnfilledRecord[];
  totalUnfulfilledOrders: number;
  totalCustomers: number;
  topModel: { name: string; quantity: number };
  byModel: Record<string, number>;
  byModelFamily: Record<string, number>;
  byEngine: Record<string, number>;
  byRegion: Record<string, number>;
  byCountry: Record<string, number>;
  customers: CustomerSummary[];
  models: string[];
  modelFamilies: string[];
  engines: string[];
  regions: string[];
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

function parseExcelData(arrayBuffer: ArrayBuffer): BoeingUnfulfilledData {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  // Resilient column mapping
  const sampleKeys = rawData.length > 0 ? Object.keys(rawData[0]) : [];
  const findCol = (patterns: string[]) => {
    for (const p of patterns) {
      const found = sampleKeys.find(k => k.trim().toLowerCase() === p.toLowerCase());
      if (found) return found;
    }
    for (const p of patterns) {
      const found = sampleKeys.find(k => k.trim().toLowerCase().includes(p.toLowerCase()));
      if (found) return found;
    }
    return patterns[0];
  };

  const COL_CUSTOMER = findCol(["Customer Name", "Customer"]);
  const COL_COUNTRY = findCol(["Country"]);
  const COL_REGION = findCol(["Region"]);
  const COL_MODEL = findCol(["Model Series", "Model"]);
  const COL_ENGINE = findCol(["Engine"]);
  const COL_QTY = findCol(["Unfilled Orders", "Unfulfilled Orders", "Quantity", "Orders"]);

  console.info("[Boeing Unfulfilled] Columns found:", { COL_CUSTOMER, COL_COUNTRY, COL_REGION, COL_MODEL, COL_ENGINE, COL_QTY });

  // Parse number handling commas (e.g. "6,777" → 6777)
  const parseNum = (v: any): number => {
    if (typeof v === "number") return v;
    return parseInt(String(v).replace(/,/g, "")) || 0;
  };

  const records: UnfilledRecord[] = rawData
    .filter((row) => {
      const customer = String(row[COL_CUSTOMER] || "").trim();
      // Skip summary/total rows
      if (!customer || customer.toLowerCase().includes("grand total") || customer.toLowerCase().includes("total")) return false;
      return row[COL_QTY] != null;
    })
    .map((row) => {
      const model = String(row[COL_MODEL] || "").trim();
      return {
        customer: String(row[COL_CUSTOMER] || "").trim(),
        country: String(row[COL_COUNTRY] || "").trim(),
        region: String(row[COL_REGION] || "Undisclosed").trim().replace(/^Unidentified$/i, "Undisclosed"),
        model,
        modelFamily: getModelFamily(model),
        engine: String(row[COL_ENGINE] || "").trim(),
        quantity: parseNum(row[COL_QTY]),
      };
    })
    .filter((r) => r.quantity > 0);

  const totalUnfulfilledOrders = records.reduce((s, r) => s + r.quantity, 0);

  // Aggregations (flat, no year dimension)
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

  // Top model
  const topModelEntry = Object.entries(byModel).sort((a, b) => b[1] - a[1])[0];
  const topModel = topModelEntry ? { name: topModelEntry[0], quantity: topModelEntry[1] } : { name: "N/A", quantity: 0 };

  // Customer summaries
  const customerMap = new Map<string, {
    country: string; region: string; totalUnfulfilled: number;
    models: Set<string>; engines: Set<string>;
    details: { model: string; engine: string; quantity: number }[];
  }>();

  for (const r of records) {
    let c = customerMap.get(r.customer);
    if (!c) {
      c = { country: r.country, region: r.region, totalUnfulfilled: 0, models: new Set(), engines: new Set(), details: [] };
      customerMap.set(r.customer, c);
    }
    c.totalUnfulfilled += r.quantity;
    c.models.add(r.model);
    c.engines.add(r.engine);
    c.details.push({ model: r.model, engine: r.engine, quantity: r.quantity });
  }

  const customers: CustomerSummary[] = Array.from(customerMap.entries())
    .map(([name, c]) => ({
      name,
      country: c.country,
      region: c.region,
      totalUnfulfilled: c.totalUnfulfilled,
      models: Array.from(c.models),
      engines: Array.from(c.engines),
      details: c.details.sort((a, b) => b.quantity - a.quantity),
    }))
    .sort((a, b) => b.totalUnfulfilled - a.totalUnfulfilled);

  const totalCustomers = customers.length;

  return {
    records, totalUnfulfilledOrders, totalCustomers, topModel,
    byModel, byModelFamily, byEngine, byRegion, byCountry,
    customers,
    models: Object.keys(byModel).sort(),
    modelFamilies: Object.keys(byModelFamily).sort(),
    engines: Object.keys(byEngine).sort(),
    regions: Object.keys(byRegion).sort(),
  };
}

// ── useUnfulfilledData Hook ───────────────────────────────────

interface UseUnfulfilledDataResult {
  data: BoeingUnfulfilledData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUnfulfilledData(dataUrl: string): UseUnfulfilledDataResult {
  const [data, setData] = useState<BoeingUnfulfilledData | null>(null);
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
