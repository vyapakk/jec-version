/**
 * Chart components for Airbus section — standalone copy.
 * All imports point to local files within commercial-aircraft/.
 */

import { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import {
  ComposedChart, Line, AreaChart, Area, PieChart, Pie, Cell, Sector,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChartDownloadButton, ChartTableViewToggle, DataTable, AnimatedViewSwitch } from "./ui-helpers";
import { useChartDownload, type DrillDownState } from "./airbus-data";

// ── Colors ────────────────────────────────────────────────────

export const CHART_COLORS = [
  "hsl(192, 95%, 55%)", "hsl(38, 92%, 55%)", "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)", "hsl(346, 77%, 50%)", "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)", "hsl(60, 70%, 50%)", "hsl(15, 85%, 55%)",
  "hsl(170, 70%, 45%)", "hsl(320, 70%, 55%)", "hsl(45, 90%, 50%)",
  "hsl(210, 80%, 55%)", "hsl(90, 60%, 45%)", "hsl(0, 75%, 55%)",
];

// ═══════════════════════════════════════════════════════════════
// TrendLineChart
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

  const YOY_CAP = 200;
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
                <defs><linearGradient id="gradient-ca-airbus-trend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0} /></linearGradient></defs>
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
// MultiLineChart
// ═══════════════════════════════════════════════════════════════

interface MultiLineChartProps {
  data: Record<string, Record<number, number>>; years: number[];
  title: string; subtitle?: string; segments: string[];
  onSegmentClick?: (name: string, yearlyData: Record<number, number>, color: string) => void;
  downloadTitle: string; gradientPrefix?: string;
}

export function MultiLineChart({ data, years, title, subtitle, segments, onSegmentClick, downloadTitle, gradientPrefix = "ca-aml" }: MultiLineChartProps) {
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
// YearlyDonutChart
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
// DrillDownModal
// ═══════════════════════════════════════════════════════════════

interface DrillDownModalProps { state: DrillDownState; years: number[]; onClose: () => void; }

export function DrillDownModal({ state, years, onClose }: DrillDownModalProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (state.isOpen) {
      const timer = setTimeout(() => setReady(true), 150);
      return () => clearTimeout(timer);
    }
    setReady(false);
  }, [state.isOpen]);

  const filteredData = useMemo(() => {
    const explicitYears = Object.entries(state.yearlyData)
      .map(([year, value]) => ({ year: Number(year), value: Number(value) || 0 }))
      .filter(point => Number.isFinite(point.year) && point.year > 0)
      .sort((a, b) => a.year - b.year);

    if (explicitYears.length > 0) return explicitYears;

    return years
      .map(year => ({ year, value: Number(state.yearlyData[year] ?? 0) }))
      .filter(point => point.value > 0);
  }, [state.yearlyData, years]);

  const hasData = filteredData.length > 0;

  return (
    <Dialog open={state.isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="aircraft-interiors-theme max-w-3xl bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: state.color }} />{state.segmentName} — {state.metricLabel} Trend</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">Year-by-year {state.metricLabel.toLowerCase()} for {state.segmentName}.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 h-[280px] w-full sm:h-[320px]">
          {!ready ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={filteredData} margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
              <defs><linearGradient id="gradient-ca-drilldown-airbus" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={state.color} stopOpacity={0.4} /><stop offset="95%" stopColor={state.color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), state.metricLabel]} contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Area type="monotone" dataKey="value" stroke={state.color} fill="url(#gradient-ca-drilldown-airbus)" strokeWidth={3} dot={{ fill: state.color, r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart></ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-border/70 bg-secondary/20 text-sm text-muted-foreground">No yearly data available for this segment.</div>
          )}
        </div>
        <div className="mt-3 max-h-[220px] overflow-y-auto">
          {hasData ? (
            <DataTable headers={["Year", state.metricLabel]} rows={filteredData.map(d => [d.year, d.value.toLocaleString()])} />
          ) : (
            <p className="text-center text-xs text-muted-foreground">No rows to display.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// GroupedBarChart
// ═══════════════════════════════════════════════════════════════

interface GroupedBarChartProps {
  data: Record<string, { orders: number; deliveries: number; operational: number }>;
  families: string[]; title: string; subtitle?: string; downloadTitle: string;
}

export function GroupedBarChart({ data, families, title, subtitle, downloadTitle }: GroupedBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");
  const chartData = families.map(f => ({ family: f, Orders: data[f]?.orders || 0, Deliveries: data[f]?.deliveries || 0, Operational: data[f]?.operational || 0 })).sort((a, b) => b.Orders - a.Orders);
  const barColors = { Orders: CHART_COLORS[0], Deliveries: CHART_COLORS[1], Operational: CHART_COLORS[3] };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) { return (<div className="rounded-lg border border-border bg-popover p-4 shadow-lg"><p className="mb-2 font-semibold text-foreground">{label}</p>{payload.map((e: any, i: number) => (<div key={i} className="flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} /><span className="text-muted-foreground">{e.name}:</span><span className="font-mono font-medium text-foreground">{e.value.toLocaleString()}</span></div>))}</div>); }
    return null;
  };
  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), downloadTitle)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<div className="h-[300px] sm:h-[380px] w-full -mx-2 sm:mx-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" /><XAxis dataKey="family" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} angle={-20} textAnchor="end" height={50} /><YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} /><Tooltip content={<CustomTooltip />} /><Legend content={() => (<div className="mt-3 flex flex-wrap justify-center gap-4">{(["Orders", "Deliveries", "Operational"] as const).map(m => (<div key={m} className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm" style={{ backgroundColor: barColors[m] }} /><span className="text-xs sm:text-sm text-muted-foreground">{m}</span></div>))}</div>)} /><Bar dataKey="Orders" fill={barColors.Orders} radius={[2, 2, 0, 0]} /><Bar dataKey="Deliveries" fill={barColors.Deliveries} radius={[2, 2, 0, 0]} /><Bar dataKey="Operational" fill={barColors.Operational} radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div>}
        table={<DataTable headers={["Family", "Orders", "Deliveries", "Operational"]} rows={chartData.map(d => [d.family, d.Orders.toLocaleString(), d.Deliveries.toLocaleString(), d.Operational.toLocaleString()])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HorizontalBarChart
// ═══════════════════════════════════════════════════════════════

interface HorizontalBarChartProps {
  data: { name: string; value: number }[]; title: string; subtitle?: string;
  metricLabel: string; downloadTitle: string; barColor?: string;
}

export function HorizontalBarChart({ data, title, subtitle, metricLabel, downloadTitle, barColor = CHART_COLORS[0] }: HorizontalBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) { return (<div className="rounded-lg border border-border bg-popover p-4 shadow-lg"><p className="font-semibold text-foreground">{payload[0].payload.name}</p><div className="mt-1 flex items-center gap-2 text-sm"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: barColor }} /><span className="text-muted-foreground">{metricLabel}:</span><span className="font-mono font-medium text-foreground">{payload[0].value.toLocaleString()}</span></div></div>); }
    return null;
  };
  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), downloadTitle)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<div className="h-[500px] sm:h-[600px] w-full -mx-2 sm:mx-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" horizontal={false} /><XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} /><YAxis type="category" dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={9} tickLine={false} width={120} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="value" fill={barColor} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>}
        table={<DataTable headers={["Rank", "Airline", metricLabel]} rows={data.map((d, i) => [i + 1, d.name, d.value.toLocaleString()])} />}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SimpleDonutChart
// ═══════════════════════════════════════════════════════════════

interface SimpleDonutChartProps {
  data: { name: string; value: number }[]; title: string; subtitle?: string;
  metricLabel: string; downloadTitle: string;
}

export function SimpleDonutChart({ data: rawData, title, subtitle, metricLabel, downloadTitle }: SimpleDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");
  const pieData = useMemo(() => {
    const sorted = rawData.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    if (sorted.length > 10) { const top = sorted.slice(0, 9).map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] })); top.push({ name: "Others", value: sorted.slice(9).reduce((s, d) => s + d.value, 0), color: "hsl(215, 20%, 55%)" }); return top; }
    return sorted.map((d, i) => ({ ...d, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [rawData]);
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) { const d = payload[0]; return (<div className="rounded-lg border border-border bg-popover p-4 shadow-lg"><p className="font-semibold text-foreground">{d.name}</p><div className="mt-1 space-y-1 text-sm"><p className="text-muted-foreground">{metricLabel}: <span className="font-mono font-medium text-foreground">{d.value.toLocaleString()}</span></p><p className="text-muted-foreground">Share: <span className="font-mono font-medium text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p></div></div>); }
    return null;
  };
  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1"><ChartTableViewToggle view={view} onViewChange={setView} /><ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), downloadTitle)} /></div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={<><div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" nameKey="name" stroke="hsl(222, 47%, 6%)" strokeWidth={2} activeIndex={activeIndex ?? undefined} activeShape={renderActivePieShape} onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></div><div className="mt-2 flex flex-wrap justify-center gap-3">{pieData.map((d, i) => (<div key={i} className="flex items-center gap-2 rounded-md px-2 py-1"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-muted-foreground">{d.name}</span></div>))}</div></>}
        table={<DataTable headers={["Segment", metricLabel, "Share"]} rows={pieData.map(d => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])} />}
      />
    </motion.div>
  );
}
