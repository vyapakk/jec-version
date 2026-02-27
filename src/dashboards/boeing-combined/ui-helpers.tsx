/**
 * UI helper components for Boeing Combined dashboard.
 * Standalone copy — identical to boeing-gross-orders/ui-helpers.
 */

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, Download, BarChart3, Table2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, duration = 1.5, className = "" }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = Date.now();
    const durationMs = duration * 1000;
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setDisplayValue(startValue + (value - startValue) * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else { setDisplayValue(value); previousValue.current = value; }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return (
    <motion.span className={`font-mono tabular-nums ${className}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
      {prefix}{(typeof displayValue === "number" && isFinite(displayValue) ? displayValue : 0).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </motion.span>
  );
}

const accentColors = {
  primary: "from-primary/20 to-transparent border-primary/30",
  accent: "from-accent/20 to-transparent border-accent/30",
  "chart-3": "from-chart-3/20 to-transparent border-chart-3/30",
  "chart-4": "from-chart-4/20 to-transparent border-chart-4/30",
};
const iconColors = {
  primary: "text-primary",
  accent: "text-accent",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
};

export function KPICard({ title, value, prefix = "", suffix = "", decimals = 0, icon: Icon, delay = 0, accentColor = "primary", subtitle }: {
  title: string; value: number; prefix?: string; suffix?: string; decimals?: number;
  icon: LucideIcon; delay?: number; accentColor?: "primary" | "accent" | "chart-3" | "chart-4";
  subtitle?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      className={`rounded-xl bg-gradient-to-br ${accentColors[accentColor]} border p-6 backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} className="text-3xl font-bold text-foreground" />
          {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
        </div>
        <div className={`rounded-lg bg-secondary/50 p-3 ${iconColors[accentColor]}`}><Icon className="h-6 w-6" /></div>
      </div>
    </motion.div>
  );
}

export function ChartDownloadButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} data-download-exclude
      className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Download chart as PNG">
      <Download className="h-4 w-4" />
    </Button>
  );
}

export function ChartTableViewToggle({ view, onViewChange }: { view: "chart" | "table"; onViewChange: (v: "chart" | "table") => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5" data-download-exclude>
      <Button variant="ghost" size="icon" onClick={() => onViewChange("chart")}
        className={`h-7 w-7 ${view === "chart" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        <BarChart3 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onViewChange("table")}
        className={`h-7 w-7 ${view === "table" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        <Table2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function AnimatedViewSwitch({ view, chart, table }: { view: "chart" | "table"; chart: React.ReactNode; table: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {view === "chart" ? (
        <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{chart}</motion.div>
      ) : (
        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{table}</motion.div>
      )}
    </AnimatePresence>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-secondary/20 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-3 text-sm ${ci === 0 ? "text-left font-medium text-foreground" : "text-right font-mono text-muted-foreground"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Year Range Selector
// ═══════════════════════════════════════════════════════════════

export type YearRangeMode = "last5" | "last10" | "last20" | "all" | "single";

const RANGE_PRESETS: { mode: YearRangeMode; label: string }[] = [
  { mode: "last5", label: "Last 5Y" },
  { mode: "last10", label: "Last 10Y" },
  { mode: "last20", label: "Last 20Y" },
  { mode: "all", label: "All Time" },
  { mode: "single", label: "Single Year" },
];

export function useYearRange(allYears: number[]) {
  const [mode, setMode] = useState<YearRangeMode>("last5");
  const [singleYear, setSingleYear] = useState<number>(() => allYears.length ? allYears[allYears.length - 1] : 2025);

  const filteredYears = useMemo(() => {
    if (!allYears.length) return [];
    const maxYear = allYears[allYears.length - 1];
    switch (mode) {
      case "last5": return allYears.filter(y => y > maxYear - 5);
      case "last10": return allYears.filter(y => y > maxYear - 10);
      case "last20": return allYears.filter(y => y > maxYear - 20);
      case "all": return allYears;
      case "single": return [singleYear];
    }
  }, [allYears, mode, singleYear]);

  const rangeLabel = useMemo(() => {
    if (mode === "single") return String(singleYear);
    if (filteredYears.length <= 1) return String(filteredYears[0] || "");
    return `${filteredYears[0]}–${filteredYears[filteredYears.length - 1]}`;
  }, [mode, singleYear, filteredYears]);

  return { mode, setMode, singleYear, setSingleYear, filteredYears, rangeLabel };
}

export function YearRangeSelector({ allYears, mode, onModeChange, singleYear, onSingleYearChange }: {
  allYears: number[];
  mode: YearRangeMode;
  onModeChange: (m: YearRangeMode) => void;
  singleYear: number;
  onSingleYearChange: (y: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
      <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
        {RANGE_PRESETS.filter(p => p.mode !== "single").map(p => (
          <Button
            key={p.mode}
            variant="ghost"
            size="sm"
            onClick={() => onModeChange(p.mode)}
            className={`h-7 px-3 text-xs font-medium transition-colors ${
              mode === p.mode
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">or</span>
        <Select
          value={mode === "single" ? singleYear.toString() : ""}
          onValueChange={v => { onSingleYearChange(parseInt(v)); onModeChange("single"); }}
        >
          <SelectTrigger className={`w-[100px] h-8 text-xs border-border bg-secondary/50 ${mode === "single" ? "border-primary ring-1 ring-primary/30" : ""}`}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-[300px]">
            {[...allYears].reverse().map(y => (
              <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/** Sum values across multiple years for a segment-keyed data structure. Returns a new structure with values at sentinelYear. */
export function aggregateYears(
  data: Record<string, Record<number, number>>,
  years: number[],
  sentinelYear: number = 0
): Record<string, Record<number, number>> {
  const result: Record<string, Record<number, number>> = {};
  for (const [segment, yearMap] of Object.entries(data)) {
    result[segment] = { [sentinelYear]: years.reduce((sum, y) => sum + (yearMap[y] || 0), 0) };
  }
  return result;
}
