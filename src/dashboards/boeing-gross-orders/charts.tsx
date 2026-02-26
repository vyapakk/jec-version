/**
 * Chart components for Boeing Gross Orders dashboard.
 * OrderTrendLineChart, MultiLineChart, OrderDonutChart, DrillDownModal.
 */

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { X, MousePointer2 } from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell, Sector,
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

// ── OrderTrendLineChart ───────────────────────────────────────

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

  const chartData = years.map((year) => ({ year, orders: data[year] || 0 }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-1 font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">Orders: <span className="font-mono font-medium text-foreground">{payload[0].value.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), `${config.title} — ${title}`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <div className="h-[300px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="orders" stroke="hsl(192, 95%, 55%)" strokeWidth={2.5} dot={{ fill: "hsl(192, 95%, 55%)", r: 2 }} activeDot={{ r: 5 }} name="Gross Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        }
        table={<DataTable headers={["Year", "Gross Orders"]} rows={chartData.map((d) => [d.year, d.orders.toLocaleString()])} />}
      />
    </motion.div>
  );
}

// ── MultiLineChart ────────────────────────────────────────────

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
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg max-h-[300px] overflow-y-auto">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {sorted.map((entry: any, i: number) => entry.value > 0 && (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground truncate max-w-[120px]">{entry.name}:</span>
              <span className="font-mono text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
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
    <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1">
      {props.payload.map((entry: any, i: number) => (
        <div key={i} className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-secondary/50"
          onClick={() => handleLegendClick(entry)}>
          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div><h3 className="text-lg font-semibold text-foreground">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, title.toLowerCase().replace(/\s+/g, "-"), `${config.title} — ${title}`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <>
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                  <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                  {segments.map((seg, idx) => (
                    <Line key={seg} type="monotone" dataKey={seg} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
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

// ── OrderDonutChart ───────────────────────────────────────────

const renderActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return <g><Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.3))", cursor: "pointer" }} /></g>;
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
    // Show top 10, group rest as "Others"
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
          <p className="text-sm text-muted-foreground">Orders: <span className="font-mono text-foreground">{d.value.toLocaleString()}</span></p>
          <p className="text-sm text-muted-foreground">Share: <span className="font-mono text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p>
          {onSegmentClick && <p className="mt-1 text-xs text-primary flex items-center gap-1"><MousePointer2 className="h-3 w-3" /> Click to drill down</p>}
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
      <div className="mb-3 flex items-start justify-between">
        <div><h3 className="text-base font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{year} Distribution</p></div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}-${year}`, `${config.title} — ${title} (${year})`)} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius="45%" outerRadius="75%"
                    dataKey="value" nameKey="name" paddingAngle={2}
                    activeIndex={activeIndex ?? undefined} activeShape={renderActivePieShape}
                    onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}
                    onClick={handleClick} style={{ cursor: onSegmentClick ? "pointer" : "default" }}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                  onClick={() => { if (onSegmentClick && d.name !== "Others") { const idx = segments.indexOf(d.name); onSegmentClick(d.name, data[d.name] || {}, CHART_COLORS[idx % CHART_COLORS.length]); } }}>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
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
  const chartData = years.map((year) => ({ year, orders: state.yearlyData[year] || 0 })).filter((d) => d.orders > 0 || years.indexOf(d.year) >= years.indexOf(Math.min(...Object.keys(state.yearlyData).map(Number))));

  // Only show years where there's data or between first and last data year
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
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), "Orders"]}
                contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Line type="monotone" dataKey="orders" stroke={state.color} strokeWidth={3} dot={{ fill: state.color, r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
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
