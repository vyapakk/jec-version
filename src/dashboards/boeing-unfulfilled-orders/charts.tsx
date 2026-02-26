/**
 * Chart components for Boeing Unfulfilled Orders dashboard.
 * Snapshot donut charts (no year/time dimension).
 */

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Sector,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChartDownloadButton, ChartTableViewToggle, DataTable, AnimatedViewSwitch } from "./ui-helpers";
import { useChartDownload } from "./data";
import { config } from "./config";

// ── Colors ────────────────────────────────────────────────────

export const CHART_COLORS = [
  "hsl(192, 95%, 55%)", "hsl(38, 92%, 55%)", "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)", "hsl(346, 77%, 50%)", "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)", "hsl(60, 70%, 50%)", "hsl(15, 85%, 55%)",
  "hsl(170, 70%, 45%)", "hsl(320, 70%, 55%)", "hsl(45, 90%, 50%)",
  "hsl(210, 80%, 55%)", "hsl(90, 60%, 45%)", "hsl(0, 75%, 55%)",
];

// ── Active Pie Shape ──────────────────────────────────────────

const renderActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", cursor: "pointer" }} />
    </g>
  );
};

// ── SnapshotDonutChart ────────────────────────────────────────

interface SnapshotDonutChartProps {
  data: Record<string, number>;
  title: string;
  metricLabel?: string;
}

export function SnapshotDonutChart({ data, title, metricLabel = "Unfulfilled Orders" }: SnapshotDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [view, setView] = useState<"chart" | "table">("chart");

  const pieData = useMemo(() => {
    const items = Object.entries(data)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
    if (items.length > 10) {
      const top = items.slice(0, 9);
      const othersVal = items.slice(9).reduce((s, d) => s + d.value, 0);
      top.push({ name: "Others", value: othersVal, color: "hsl(215, 20%, 55%)" });
      return top;
    }
    return items;
  }, [data]);

  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0];
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="font-semibold text-foreground">{d.name}</p>
          <div className="mt-1 space-y-1 text-sm">
            <p className="text-muted-foreground">{metricLabel}: <span className="font-mono font-medium text-foreground">{d.value.toLocaleString()}</span></p>
            <p className="text-muted-foreground">Share: <span className="font-mono font-medium text-foreground">{((d.value / total) * 100).toFixed(1)}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Current Distribution</p>
        </div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
          <ChartDownloadButton onClick={() => downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}`, `${config.title} — ${title}`)} />
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
                    onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-secondary/50">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </>
        }
        table={
          <DataTable
            headers={["Segment", metricLabel, "Share"]}
            rows={pieData.map((d) => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])}
          />
        }
      />
    </motion.div>
  );
}
