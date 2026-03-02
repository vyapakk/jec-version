/**
 * Airline Orders, Deliveries & Fleet tab — Airbus Combined dashboard.
 * Cumulative snapshot data (no year range selector).
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Plane, Package, Users, Search, X, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { config } from "./config";
import { useAirlineFleetData, type AirlineFleetSummary } from "./data";
import { KPICard } from "./ui-helpers";
import { GroupedBarChart, HorizontalBarChart, SimpleDonutChart } from "./charts";
import AppFooter from "./AppFooter";

export function FleetTab() {
  const { data, isLoading, error, refetch } = useAirlineFleetData(config.airlineFleetDataUrl);
  const [search, setSearch] = useState("");
  const [selectedAirline, setSelectedAirline] = useState<AirlineFleetSummary | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Donut data
  const ordersByFamily = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byFamily).map(([name, v]) => ({ name, value: v.orders }));
  }, [data]);

  const deliveriesByRegion = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byRegion).map(([name, v]) => ({ name, value: v.deliveries }));
  }, [data]);

  const operationalByRegion = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byRegion).map(([name, v]) => ({ name, value: v.operational }));
  }, [data]);

  // Top 20 airlines by operational fleet
  const top20Airlines = useMemo(() => {
    if (!data) return [];
    return data.airlines
      .filter(a => a.operational > 0)
      .sort((a, b) => b.operational - a.operational)
      .slice(0, 20)
      .map(a => ({ name: a.name, value: a.operational }));
  }, [data]);

  // Filtered airline list
  const filteredAirlines = useMemo(() => {
    if (!data) return [];
    const s = search.toLowerCase();
    if (!s) return data.airlines;
    return data.airlines.filter(a =>
      a.name.toLowerCase().includes(s) ||
      a.country.toLowerCase().includes(s) ||
      a.region.toLowerCase().includes(s) ||
      a.variants.some(v => v.variant.toLowerCase().includes(s))
    );
  }, [data, search]);

  const displayedAirlines = showAll ? filteredAirlines : filteredAirlines.slice(0, 25);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading fleet data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  return (
    <div className="py-8">
      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Total Gross Orders" value={data.totalOrders} icon={Plane} accentColor="primary" delay={0.1} />
        <KPICard title="Total Deliveries" value={data.totalDeliveries} icon={Package} accentColor="accent" delay={0.2} />
        <KPICard title="Operational Fleet" value={data.totalOperational} icon={ShieldCheck} accentColor="chart-4" delay={0.3} />
      </div>

      {/* Grouped Bar Chart */}
      <div className="mb-8">
        <GroupedBarChart
          data={data.byFamily}
          families={data.families}
          title="Gross Orders vs Deliveries vs Operational by Aircraft Family"
          subtitle="Side-by-side comparison across aircraft families"
          downloadTitle="Airbus Fleet — By Aircraft Family"
        />
      </div>

      {/* Donut Charts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SimpleDonutChart
            data={ordersByFamily}
            title="Gross Orders by Aircraft Family"
            subtitle="Lifetime cumulative"
            metricLabel="Gross Orders"
            downloadTitle="Airbus Fleet — Orders by Family"
          />
          <SimpleDonutChart
            data={deliveriesByRegion}
            title="Deliveries by Region"
            subtitle="Lifetime cumulative"
            metricLabel="Deliveries"
            downloadTitle="Airbus Fleet — Deliveries by Region"
          />
          <SimpleDonutChart
            data={operationalByRegion}
            title="Operational Fleet by Region"
            subtitle="Current snapshot"
            metricLabel="Operational"
            downloadTitle="Airbus Fleet — Operational by Region"
          />
        </div>
      </motion.div>

      {/* Top 20 Airlines */}
      <div className="mb-8">
        <HorizontalBarChart
          data={top20Airlines}
          title="Top 20 Airlines by Operational Fleet"
          subtitle="Largest operators by number of aircraft currently in service"
          metricLabel="Operational Aircraft"
          downloadTitle="Airbus Fleet — Top 20 Airlines"
          barColor="hsl(142, 71%, 45%)"
        />
      </div>

      {/* Airline Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Fleet Overview</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAirlines.length} customers · Cumulative lifetime data
            </p>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer, country, region, or variant..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        {filteredAirlines.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No customers found matching your search.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Deliveries</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Operational</th>
                
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Variants</th>
              </tr></thead>
              <tbody className="divide-y divide-border">{displayedAirlines.map((a, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedAirline(a)}>
                  <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.country}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.region}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{a.totalOrders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{a.totalDeliveries.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{a.operational.toLocaleString()}</td>
                  
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-1">
                      {a.variants.slice(0, 3).map(v => <span key={v.variant} className="inline-block rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{v.variant}</span>)}
                      {a.variants.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{a.variants.length - 3}</span>}
                    </div>
                  </td>
                </tr>
              ))}</tbody></table>
            </div>
            {filteredAirlines.length > 25 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="border-border text-muted-foreground hover:text-foreground">
                  {showAll ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredAirlines.length} Customers</>}
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Airline Detail Dialog */}
      <Dialog open={!!selectedAirline} onOpenChange={open => { if (!open) setSelectedAirline(null); }}>
        <DialogContent className="aircraft-interiors-theme max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          {selectedAirline && <>
            <DialogHeader><DialogTitle className="text-foreground">{selectedAirline.name}</DialogTitle></DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium text-foreground">{selectedAirline.country || "—"}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Region</p><p className="text-sm font-medium text-foreground">{selectedAirline.region || "—"}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Gross Orders</p><p className="text-lg font-bold text-foreground">{selectedAirline.totalOrders.toLocaleString()}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Deliveries</p><p className="text-lg font-bold text-foreground">{selectedAirline.totalDeliveries.toLocaleString()}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Operational</p><p className="text-lg font-bold text-foreground">{selectedAirline.operational.toLocaleString()}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Variant Breakdown</p>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto relative">
                  <table className="w-full"><thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Variant</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Gross Orders</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Deliveries</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Operational</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">{selectedAirline.variants.map((v, i) => (
                    <tr key={i} className="hover:bg-secondary/20">
                      <td className="px-3 py-2 text-sm text-foreground">{v.variant}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono text-foreground">{v.orders.toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono text-muted-foreground">{v.deliveries.toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono text-muted-foreground">{v.operational.toLocaleString()}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <AppFooter sourceText="Airbus Airline Fleet Analysis" unitText="Cumulative lifetime totals — Orders, Deliveries, and Operational fleet" />
    </div>
  );
}