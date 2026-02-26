/**
 * Chart components for Boeing Gross Orders dashboard.
 * OrderTrendLineChart (with YoY), MultiLineChart, OrderDonutChart, DrillDownModal.
 * Styled to match the existing market dashboards (gradient areas, themed donuts).
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
import { config } from "./config";

// ── Colors ────────────────────────────────────────────────────

export const CHART_COLORS = [
  "hsl(192, 95%, 55%)", "hsl(38, 92%, 55%)", "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)", "hsl(346, 77%, 50%)", "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)", "hsl(60, 70%, 50%)", "hsl(15, 85%, 55%)",
  "hsl(170, 70%, 45%)", "hsl(320, 70%, 55%)", "hsl(45, 90%, 50%)",
  "hsl(210, 80%, 55%)", "hsl(90, 60%, 45%)", "hsl(0, 75%, 55%)",
];

// ── OrderTrendLineChart (with YoY growth) ─────────────────────

interface OrderTrendLineChartProps {
  data: Record<number, number>;
  years: number[];
  title: string;
  subtitle?: string;
}

export function OrderTrendLineChart({ data, years, title, subtitle }: OrderTrendLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const chartData = years.map((year, index) => {
    const orders = data[year] || 0;
    const prevYear = index > 0 ? years[index - 1] : null;
    const prevOrders = prevYear !== null ? (data[prevYear] || 0) : null;
    const yoyGrowth = prevOrders !== null && prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : null;
    return { year, orders, yoyGrowth };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const orderEntry = payload.find((p: any) => p.dataKey === "orders");
      const yoyEntry = payload.find((p: any) => p.dataKey === "yoyGrowth");
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {orderEntry && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(192, 95%, 55%)" }} />
              <span className="text-muted-foreground">Gross Orders:</span>
              <span className="font-mono font-medium text-foreground">{orderEntry.value.toLocaleString()}</span>
            </div>
          )}
          {yoyEntry && yoyEntry.value !== null && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(38, 92%, 55%)" }} />
              <span className="text-muted-foreground">YoY Growth:</span>
              <span className={`font-mono font-medium ${yoyEntry.value >= 0 ? "text-chart-4" : "text-destructive"}`}>
                {yoyEntry.value >= 0 ? "+" : ""}{yoyEntry.value.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => (
    <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-3 sm:gap-6">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: "hsl(192, 95%, 55%)" }} />
        <span className="text-xs sm:text-sm text-muted-foreground">Gross Orders</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: "hsl(38, 92%, 55%)" }} />
        <span className="text-xs sm:text-sm text-muted-foreground">YoY Growth (%)</span>
      </div>
    </div>
  );

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), `${config.title} — ${title}`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <div className="h-[300px] sm:h-[350px] w-full -mx-2 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradient-orders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                <YAxis yAxisId="left" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={['auto', 'auto']} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(192, 95%, 55%)" strokeWidth={3} dot={{ fill: "hsl(192, 95%, 55%)", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Gross Orders" />
                <Line yAxisId="right" type="monotone" dataKey="yoyGrowth" stroke="hsl(38, 92%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(38, 92%, 55%)", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} name="YoY Growth" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        table={<DataTable headers={["Year", "Gross Orders", "YoY Growth (%)"]} rows={chartData.map((d) => [d.year, d.orders.toLocaleString(), d.yoyGrowth !== null ? `${d.yoyGrowth >= 0 ? "+" : ""}${d.yoyGrowth.toFixed(1)}%` : "—"])} />}
      />
    </motion.div>
  );
}

// ── MultiLineChart (Area with gradients) ──────────────────────

interface MultiLineChartProps {
  data: Record<string, Record<number, number>>;
  years: number[];
  title: string;
  subtitle?: string;
  segments: string[];
  onSegmentClick?: (name: string, yearlyData: Record<number, number>, color: string) => void;
}

export function MultiLineChart({ data, years, title, subtitle, segments, onSegmentClick }: MultiLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const chartData = years.map((year) => {
    const point: Record<string, number> = { year };
    segments.forEach((seg) => { point[seg] = data[seg]?.[year] || 0; });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const sorted = [...payload].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      const total = sorted.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg max-h-[300px] overflow-y-auto">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {sorted.map((entry: any, i: number) => entry.value > 0 && (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground truncate max-w-[120px]">{entry.name}:</span>
              <span className="font-mono text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
          {sorted.length > 1 && (
            <div className="mt-2 border-t border-border pt-2 flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-foreground/50" />
              <span className="text-muted-foreground font-medium">Total:</span>
              <span className="font-mono font-bold text-foreground">{total.toLocaleString()}</span>
            </div>
          )}
          {onSegmentClick && <p className="mt-2 text-xs text-primary flex items-center gap-1"><MousePointer2 className="h-3 w-3" /> Click legend to drill down</p>}
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (entry: any) => {
    if (!onSegmentClick) return;
    const segName = entry.value;
    if (data[segName]) {
      const idx = segments.indexOf(segName);
      onSegmentClick(segName, data[segName], CHART_COLORS[idx % CHART_COLORS.length]);
    }
  };

  const renderLegend = (props: any) => (
    <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-4">
      {props.payload.map((entry: any, i: number) => (
        <div key={i} className="flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors hover:bg-secondary/50"
          onClick={() => handleLegendClick(entry)}>
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs sm:text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-6 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), `${config.title} — ${title}`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <>
            <div className="h-[300px] sm:h-[350px] w-full -mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                  <defs>
                    {segments.map((seg, idx) => (
                      <linearGradient key={seg} id={`gradient-boeing-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                  <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  {segments.map((seg, idx) => (
                    <Area key={seg} type="monotone" dataKey={seg} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={`url(#gradient-boeing-${idx})`} strokeWidth={2} style={{ cursor: "pointer" }} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {onSegmentClick && <p className="mt-2 text-center text-xs text-muted-foreground">Click any legend item to see detailed trend</p>}
          </>
        }
        table={
          <DataTable
            headers={["Year", ...segments]}
            rows={chartData.map((d) => [d.year, ...segments.map((s) => (d[s] || 0).toLocaleString())])}
          />
        }
      />
    </motion.div>
  );
}

// ── OrderDonutChart (matching old style) ──────────────────────

const renderActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return <g><Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", cursor: "pointer" }} /></g>;
};

interface OrderDonutChartProps {
  data: Record<string, Record<number, number>>;
  year: number;
  title: string;
  segments: string[];
  onSegmentClick?: (name: string, yearlyData: Record<number, number>, color: string) => void;
}

export function OrderDonutChart({ data, year, title, segments, onSegmentClick }: OrderDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const pieData = useMemo(() => {
    const items = segments
      .map((name, i) => ({ name, value: data[name]?.[year] || 0, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
    if (items.length > 10) {
      const top = items.slice(0, 9);
      const othersVal = items.slice(9).reduce((s, d) => s + d.value, 0);
      top.push({ name: "Others", value: othersVal, color: "hsl(215, 20%, 55%)" });
      return top;
    }
    return items;
  }, [data, year, segments]);

  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0];
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="font-semibold text-foreground">{d.name}</p>
          <div className="mt-1 space-y-1 text-sm">
            <p className="text-muted-foreground">Orders: <span className="font-mono font-medium text-foreground">{d.value.toLocaleString()}</span></p>
            <p className="text-muted-foreground">Share: <span className="font-mono font-medium text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p>
          </div>
          {onSegmentClick && <p className="mt-2 text-xs text-primary flex items-center gap-1"><MousePointer2 className="h-3 w-3" /> Click to drill down</p>}
        </div>
      );
    }
    return null;
  };

  const handleClick = (_: any, index: number) => {
    if (!onSegmentClick) return;
    const item = pieData[index];
    if (item.name === "Others") return;
    const segIdx = segments.indexOf(item.name);
    onSegmentClick(item.name, data[item.name] || {}, CHART_COLORS[segIdx % CHART_COLORS.length]);
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{year} Distribution</p>
        </div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}-${year}`, `${config.title} — ${title} (${year})`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={85}
                    paddingAngle={2} dataKey="value" nameKey="name"
                    stroke="hsl(222, 47%, 6%)" strokeWidth={2}
                    activeIndex={activeIndex ?? undefined} activeShape={renderActivePieShape}
                    onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}
                    onClick={handleClick} style={{ cursor: onSegmentClick ? "pointer" : "default" }}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-secondary/50"
                  onClick={() => { if (onSegmentClick && d.name !== "Others") { const idx = segments.indexOf(d.name); onSegmentClick(d.name, data[d.name] || {}, CHART_COLORS[idx % CHART_COLORS.length]); } }}>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Click any segment to see detailed trends</p>
          </>
        }
        table={
          <DataTable
            headers={["Segment", "Orders", "Share"]}
            rows={pieData.map((d) => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])}
          />
        }
      />
    </motion.div>
  );
}

// ── DrillDownModal ─────────────────────────────────────────────

interface DrillDownModalProps {
  state: DrillDownState;
  years: number[];
  onClose: () => void;
}

export function DrillDownModal({ state, years, onClose }: DrillDownModalProps) {
  const dataYears = Object.keys(state.yearlyData).map(Number).filter((y) => state.yearlyData[y] > 0);
  const minYear = Math.min(...dataYears);
  const maxYear = Math.max(...dataYears);
  const filteredData = years.filter((y) => y >= minYear && y <= maxYear).map((year) => ({ year, orders: state.yearlyData[year] || 0 }));

  return (
    <Dialog open={state.isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="aircraft-interiors-theme max-w-3xl bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: state.color }} />
            {state.segmentName} — Order Trend
          </DialogTitle>
        </DialogHeader>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-drilldown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={state.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={state.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), "Orders"]}
                contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Area type="monotone" dataKey="orders" stroke={state.color} fill="url(#gradient-drilldown)" strokeWidth={3} dot={{ fill: state.color, r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 max-h-[200px] overflow-y-auto">
          <DataTable
            headers={["Year", "Gross Orders"]}
            rows={filteredData.map((d) => [d.year, d.orders.toLocaleString()])}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}