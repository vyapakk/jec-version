/**
 * All chart components for Boeing Combined dashboard.
 * Standalone — covers Overview, Orders, Deliveries, and Unfulfilled charts.
 */

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import {
  ComposedChart, Line, AreaChart, Area, PieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartDownloadButton, ChartTableViewToggle, DataTable, AnimatedViewSwitch } from "./ui-helpers";
import { useChartDownload, type DrillDownState } from "./data";

// ── Colors ────────────────────────────────────────────────────

export const CHART_COLORS = [
  "hsl(192, 95%, 55%)", "hsl(38, 92%, 55%)", "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)", "hsl(346, 77%, 50%)", "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)", "hsl(60, 70%, 50%)", "hsl(15, 85%, 55%)",
  "hsl(170, 70%, 45%)", "hsl(320, 70%, 55%)", "hsl(45, 90%, 50%)",
  "hsl(210, 80%, 55%)", "hsl(90, 60%, 45%)", "hsl(0, 75%, 55%)",
];

// ═══════════════════════════════════════════════════════════════
// Overview: Orders vs Deliveries
// ═══════════════════════════════════════════════════════════════

const COLOR_ORDERS = "hsl(38, 92%, 55%)";
const COLOR_DELIVERIES = "hsl(192, 95%, 55%)";

interface OrdersVsDeliveriesChartProps {
  ordersByYear: Record<number, number>;
  deliveriesByYear: Record<number, number>;
  years: number[];
}

export function OrdersVsDeliveriesChart({ ordersByYear, deliveriesByYear, years }: OrdersVsDeliveriesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"chart" | "table">("chart");
  const chartData = years.map(year => ({ year, orders: ordersByYear[year] || 0, deliveries: deliveriesByYear[year] || 0 }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {payload.map((e: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="text-muted-foreground">{e.name}:</span>
              <span className="font-mono font-medium text-foreground">{e.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">Orders vs Deliveries</h3><p className="text-sm text-muted-foreground">Historical comparison of gross orders and deliveries</p></div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <div className="h-[300px] sm:h-[400px] w-full -mx-2 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={() => (
                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_ORDERS }} /><span className="text-xs sm:text-sm text-muted-foreground">Gross Orders</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_DELIVERIES }} /><span className="text-xs sm:text-sm text-muted-foreground">Deliveries</span></div>
                  </div>
                )} />
                <Line type="monotone" dataKey="orders" stroke={COLOR_ORDERS} strokeWidth={3} dot={{ fill: COLOR_ORDERS, strokeWidth: 0, r: 3 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Gross Orders" />
                <Line type="monotone" dataKey="deliveries" stroke={COLOR_DELIVERIES} strokeWidth={3} dot={{ fill: COLOR_DELIVERIES, strokeWidth: 0, r: 3 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Deliveries" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        table={<DataTable headers={["Year", "Gross Orders", "Deliveries"]} rows={chartData.map(d => [d.year, d.orders.toLocaleString(), d.deliveries.toLocaleString()])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TrendLineChart — generic (used for both orders & deliveries)
// ═══════════════════════════════════════════════════════════════

interface TrendLineChartProps {
  data: Record<number, number>; years: number[];
  title: string; subtitle?: string; metricLabel: string;
  downloadTitle: string;
}

export function TrendLineChart({ data, years, title, subtitle, metricLabel, downloadTitle }: TrendLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const YOY_CAP = 200; // Cap at ±200% to prevent outliers from flattening the chart
  const chartData = years.map((year, i) => {
    const val = data[year] || 0;
    const prev = i > 0 ? (data[years[i - 1]] || 0) : null;
    const rawYoy = prev !== null && prev > 0 ? ((val - prev) / prev) * 100 : null;
    const yoyGrowth = rawYoy !== null ? Math.max(-YOY_CAP, Math.min(YOY_CAP, rawYoy)) : null;
    return { year, value: val, yoyGrowth, rawYoy };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const valEntry = payload.find((p: any) => p.dataKey === "value");
      const yoyEntry = payload.find((p: any) => p.dataKey === "yoyGrowth");
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {valEntry && <div className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(192, 95%, 55%)" }} /><span className="text-muted-foreground">{metricLabel}:</span><span className="font-mono font-medium text-foreground">{valEntry.value.toLocaleString()}</span></div>}
          {payload[0]?.payload?.rawYoy != null && <div className="flex items-center gap-2 text-sm mt-1"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(38, 92%, 55%)" }} /><span className="text-muted-foreground">YoY Growth:</span><span className={`font-mono font-medium ${payload[0].payload.rawYoy >= 0 ? "text-chart-4" : "text-destructive"}`}>{payload[0].payload.rawYoy >= 0 ? "+" : ""}{payload[0].payload.rawYoy.toFixed(1)}%</span></div>}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), downloadTitle)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <div className="h-[300px] sm:h-[350px] w-full -mx-2 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs><linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                <YAxis yAxisId="left" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} domain={[-YOY_CAP, YOY_CAP]} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={() => (
                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(192, 95%, 55%)" }} /><span className="text-xs sm:text-sm text-muted-foreground">{metricLabel}</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(38, 92%, 55%)" }} /><span className="text-xs sm:text-sm text-muted-foreground">YoY Growth (%)</span></div>
                  </div>
                )} />
                <Line yAxisId="left" type="monotone" dataKey="value" stroke="hsl(192, 95%, 55%)" strokeWidth={3} dot={{ fill: "hsl(192, 95%, 55%)", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} name={metricLabel} />
                <Line yAxisId="right" type="monotone" dataKey="yoyGrowth" stroke="hsl(38, 92%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(38, 92%, 55%)", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} name="YoY Growth" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        table={<DataTable headers={["Year", metricLabel, "YoY Growth (%)"]} rows={chartData.map(d => [d.year, d.value.toLocaleString(), d.yoyGrowth !== null ? `${d.yoyGrowth >= 0 ? "+" : ""}${d.yoyGrowth.toFixed(1)}%` : "—"])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MultiLineChart — generic area chart with gradients
// ═══════════════════════════════════════════════════════════════

interface MultiLineChartProps {
  data: Record<string, Record<number, number>>; years: number[];
  title: string; subtitle?: string; segments: string[];
  onSegmentClick?: (name: string, yearlyData: Record<number, number>, color: string) => void;
  downloadTitle: string; gradientPrefix?: string;
}

export function MultiLineChart({ data, years, title, subtitle, segments, onSegmentClick, downloadTitle, gradientPrefix = "ml" }: MultiLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");
  const chartData = years.map(year => { const p: Record<string, number> = { year }; segments.forEach(s => { p[s] = data[s]?.[year] || 0; }); return p; });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const sorted = [...payload].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      const total = sorted.reduce((s: number, e: any) => s + (e.value || 0), 0);
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg max-h-[300px] overflow-y-auto">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {sorted.map((e: any, i: number) => e.value > 0 && <div key={i} className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} /><span className="text-muted-foreground truncate max-w-[120px]">{e.name}:</span><span className="font-mono text-foreground">{e.value.toLocaleString()}</span></div>)}
          {sorted.length > 1 && <div className="mt-2 border-t border-border pt-2 flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full bg-foreground/50" /><span className="text-muted-foreground font-medium">Total:</span><span className="font-mono font-bold text-foreground">{total.toLocaleString()}</span></div>}
          {onSegmentClick && <p className="mt-2 text-xs text-primary flex items-center gap-1"><MousePointer2 className="h-3 w-3" /> Click legend to drill down</p>}
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (entry: any) => {
    if (!onSegmentClick) return;
    const n = entry.value; if (data[n]) { const i = segments.indexOf(n); onSegmentClick(n, data[n], CHART_COLORS[i % CHART_COLORS.length]); }
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), downloadTitle)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<><div className="h-[300px] sm:h-[350px] w-full -mx-2 sm:mx-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
          <defs>{segments.map((s, i) => <linearGradient key={s} id={`grad-${gradientPrefix}-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} /></linearGradient>)}</defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
          <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
          <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={(props: any) => (
            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-4">
              {props.payload.map((e: any, i: number) => <div key={i} className="flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors hover:bg-secondary/50" onClick={() => handleLegendClick(e)}><div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} /><span className="text-xs sm:text-sm text-muted-foreground">{e.value}</span></div>)}
            </div>
          )} />
          {segments.map((s, i) => <Area key={s} type="monotone" dataKey={s} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={`url(#grad-${gradientPrefix}-${i})`} strokeWidth={2} style={{ cursor: "pointer" }} />)}
        </AreaChart></ResponsiveContainer></div>
        {onSegmentClick && <p className="mt-2 text-center text-xs text-muted-foreground">Click any legend item to see detailed trend</p>}</>}
        table={<DataTable headers={["Year", ...segments]} rows={chartData.map(d => [d.year, ...segments.map(s => (d[s] || 0).toLocaleString())])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// YearlyDonutChart — generic (for orders & deliveries tabs)
// ═══════════════════════════════════════════════════════════════

const renderActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return <g><Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", cursor: "pointer" }} /></g>;
};

interface YearlyDonutChartProps {
  data: Record<string, Record<number, number>>; year: number; title: string;
  segments: string[]; metricLabel: string; yearLabel?: string;
  onSegmentClick?: (name: string, yearlyData: Record<number, number>, color: string) => void;
  downloadTitle: string;
}

export function YearlyDonutChart({ data, year, title, segments, metricLabel, onSegmentClick, downloadTitle, yearLabel }: YearlyDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const pieData = useMemo(() => {
    const items = segments.map((name, i) => ({ name, value: data[name]?.[year] || 0, color: CHART_COLORS[i % CHART_COLORS.length] })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    if (items.length > 10) { const top = items.slice(0, 9); top.push({ name: "Others", value: items.slice(9).reduce((s, d) => s + d.value, 0), color: "hsl(215, 20%, 55%)" }); return top; }
    return items;
  }, [data, year, segments]);

  const total = pieData.reduce((s, d) => s + d.value, 0);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) { const d = payload[0]; return (<div className="rounded-lg border border-border bg-popover p-4 shadow-lg"><p className="font-semibold text-foreground">{d.name}</p><div className="mt-1 space-y-1 text-sm"><p className="text-muted-foreground">{metricLabel}: <span className="font-mono font-medium text-foreground">{d.value.toLocaleString()}</span></p><p className="text-muted-foreground">Share: <span className="font-mono font-medium text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p></div>{onSegmentClick && <p className="mt-2 text-xs text-primary flex items-center gap-1"><MousePointer2 className="h-3 w-3" /> Click to drill down</p>}</div>); }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3><p className="text-sm text-muted-foreground">{yearLabel || year} Distribution</p></div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}-${year}`, downloadTitle)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<><div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" nameKey="name" stroke="hsl(222, 47%, 6%)" strokeWidth={2} activeIndex={activeIndex ?? undefined} activeShape={renderActivePieShape} onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)} onClick={(_, i) => { if (!onSegmentClick) return; const item = pieData[i]; if (item.name === "Others") return; const idx = segments.indexOf(item.name); onSegmentClick(item.name, data[item.name] || {}, CHART_COLORS[idx % CHART_COLORS.length]); }} style={{ cursor: onSegmentClick ? "pointer" : "default" }}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">{pieData.map((d, i) => <div key={i} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-secondary/50" onClick={() => { if (onSegmentClick && d.name !== "Others") { const idx = segments.indexOf(d.name); onSegmentClick(d.name, data[d.name] || {}, CHART_COLORS[idx % CHART_COLORS.length]); } }}><div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-muted-foreground">{d.name}</span></div>)}</div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Click any segment to see detailed trends</p></>}
        table={<DataTable headers={["Segment", metricLabel, "Share"]} rows={pieData.map(d => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SnapshotDonutChart — for unfulfilled (no year dimension)
// ═══════════════════════════════════════════════════════════════

interface SnapshotDonutChartProps {
  data: Record<string, number>; title: string; metricLabel?: string;
}

export function SnapshotDonutChart({ data, title, metricLabel = "Unfulfilled Orders" }: SnapshotDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const pieData = useMemo(() => {
    const items = Object.entries(data).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    if (items.length > 10) { const top = items.slice(0, 9); top.push({ name: "Others", value: items.slice(9).reduce((s, d) => s + d.value, 0), color: "hsl(215, 20%, 55%)" }); return top; }
    return items;
  }, [data]);

  const total = pieData.reduce((s, d) => s + d.value, 0);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) { const d = payload[0]; return (<div className="rounded-lg border border-border bg-popover p-4 shadow-lg"><p className="font-semibold text-foreground">{d.name}</p><div className="mt-1 space-y-1 text-sm"><p className="text-muted-foreground">{metricLabel}: <span className="font-mono font-medium text-foreground">{d.value.toLocaleString()}</span></p><p className="text-muted-foreground">Share: <span className="font-mono font-medium text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p></div></div>); }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3><p className="text-sm text-muted-foreground">Current Distribution</p></div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), `Boeing Unfulfilled Orders — ${title}`)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<><div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" nameKey="name" stroke="hsl(222, 47%, 6%)" strokeWidth={2} activeIndex={activeIndex ?? undefined} activeShape={renderActivePieShape} onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">{pieData.map((d, i) => <div key={i} className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-secondary/50"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-muted-foreground">{d.name}</span></div>)}</div></>}
        table={<DataTable headers={["Segment", metricLabel, "Share"]} rows={pieData.map(d => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DrillDownModal — generic
// ═══════════════════════════════════════════════════════════════

interface DrillDownModalProps { state: DrillDownState; years: number[]; onClose: () => void; }

export function DrillDownModal({ state, years, onClose }: DrillDownModalProps) {
  const dataYears = Object.keys(state.yearlyData).map(Number).filter(y => state.yearlyData[y] > 0);
  const minYear = Math.min(...dataYears); const maxYear = Math.max(...dataYears);
  const filteredData = years.filter(y => y >= minYear && y <= maxYear).map(year => ({ year, value: state.yearlyData[year] || 0 }));

  return (
    <Dialog open={state.isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="aircraft-interiors-theme max-w-3xl bg-card border-border text-foreground">
        <DialogHeader><DialogTitle className="text-foreground flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: state.color }} />{state.segmentName} — {state.metricLabel} Trend</DialogTitle></DialogHeader>
        <div className="h-[350px] w-full mt-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <defs><linearGradient id="gradient-drilldown-combined" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={state.color} stopOpacity={0.4} /><stop offset="95%" stopColor={state.color} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
          <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
          <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
          <Tooltip formatter={(value: number) => [value.toLocaleString(), state.metricLabel]} contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
          <Area type="monotone" dataKey="value" stroke={state.color} fill="url(#gradient-drilldown-combined)" strokeWidth={3} dot={{ fill: state.color, r: 3 }} activeDot={{ r: 6 }} />
        </AreaChart></ResponsiveContainer></div>
        <div className="mt-2 max-h-[200px] overflow-y-auto"><DataTable headers={["Year", state.metricLabel]} rows={filteredData.map(d => [d.year, d.value.toLocaleString()])} /></div>
      </DialogContent>
    </Dialog>
  );
}
