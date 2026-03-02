/**
 * Overview tab for Airbus Combined dashboard.
 * Shows KPIs, grouped bar chart, donut charts, and variant-level table.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plane, Package, ShieldCheck, AlertCircle, RefreshCw, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { config } from "./config";
import { useAirbusSummaryOverview, type AirbusSummaryOverviewData } from "./data";
import { KPICard } from "./ui-helpers";
import { GroupedBarChart, SimpleDonutChart } from "./charts";
import AppFooter from "./AppFooter";

interface OverviewTabProps {
  onTabChange?: (tab: string) => void;
}

export function OverviewTab({ onTabChange }: OverviewTabProps) {
  const { data, isLoading, error, refetch } = useAirbusSummaryOverview(config.summaryDataUrl);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading overview data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  return <OverviewTabContent data={data} onTabChange={onTabChange} />;
}

function OverviewTabContent({ data, onTabChange }: { data: AirbusSummaryOverviewData; onTabChange?: (tab: string) => void }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const ordersByFamily = useMemo(() =>
    Object.entries(data.byFamily).map(([name, v]) => ({ name, value: v.orders })),
    [data]
  );

  const deliveriesByFamily = useMemo(() =>
    Object.entries(data.byFamily).map(([name, v]) => ({ name, value: v.deliveries })),
    [data]
  );

  const filteredVariants = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return data.byVariant;
    return data.byVariant.filter(v => v.variant.toLowerCase().includes(s));
  }, [data, search]);

  const displayedVariants = showAll ? filteredVariants : filteredVariants.slice(0, 25);

  return (
    <div className="py-8">
      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="cursor-pointer" onClick={() => onTabChange?.("orders")}>
          <KPICard title="Total Orders" value={data.totalOrders} icon={Plane} accentColor="primary" delay={0.1} />
        </div>
        <div className="cursor-pointer" onClick={() => onTabChange?.("deliveries")}>
          <KPICard title="Total Deliveries" value={data.totalDeliveries} icon={Package} accentColor="accent" delay={0.2} />
        </div>
        <div className="cursor-pointer" onClick={() => onTabChange?.("fleet")}>
          <KPICard title="Total In Fleet" value={data.totalInFleet} icon={ShieldCheck} accentColor="chart-4" delay={0.3} />
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="mb-8">
        <GroupedBarChart
          data={data.byFamily}
          families={data.families}
          title="Orders vs Deliveries vs In Fleet by Aircraft Family"
          subtitle="Cumulative lifetime totals across all Airbus families"
          downloadTitle="Airbus Overview — By Aircraft Family"
        />
      </div>

      {/* Donut Charts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution by Aircraft Family</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SimpleDonutChart
            data={ordersByFamily}
            title="Orders by Aircraft Family"
            subtitle="Lifetime cumulative"
            metricLabel="Orders"
            downloadTitle="Airbus Overview — Orders by Family"
          />
          <SimpleDonutChart
            data={deliveriesByFamily}
            title="Deliveries by Aircraft Family"
            subtitle="Lifetime cumulative"
            metricLabel="Deliveries"
            downloadTitle="Airbus Overview — Deliveries by Family"
          />
        </div>
      </motion.div>

      {/* Variant-Level Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Variant-Level Breakdown</h2>
            <p className="text-sm text-muted-foreground">{filteredVariants.length} variants · Cumulative lifetime data</p>
          </div>
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search variant..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        {filteredVariants.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No variants found matching your search.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Variant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Family</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Deliveries</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">In Fleet</th>
              </tr></thead>
              <tbody className="divide-y divide-border">{displayedVariants.map((v, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{v.variant}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{v.family}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{v.orders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{v.deliveries.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{v.operational.toLocaleString()}</td>
                </tr>
              ))}</tbody></table>
            </div>
            {filteredVariants.length > 25 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="border-border text-muted-foreground hover:text-foreground">
                  {showAll ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredVariants.length} Variants</>}
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>

      <AppFooter sourceText="Airbus Commercial Aircraft Analysis" unitText="All values represent aircraft units — cumulative lifetime totals" />
    </div>
  );
}
