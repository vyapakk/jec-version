/**
 * Gross Orders tab content — standalone within boeing-combined.
 */

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp, MinusCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { config } from "./config";
import { useOrderData, useDrillDown, type OrderCustomerSummary } from "./data";
import { KPICard, YearRangeSelector, useYearRange, aggregateYears } from "./ui-helpers";
import { TrendLineChart, MultiLineChart, YearlyDonutChart, DrillDownModal } from "./charts";
import AppFooter from "./AppFooter";

interface NetOrdersData {
  netInYearOfCancel: Record<string, number>;
  netInYearOfOrder: Record<string, number>;
}

function useNetOrdersData() {
  const [netData, setNetData] = useState<NetOrdersData | null>(null);
  useEffect(() => {
    fetch("/data/boeing-net-orders.json").then(r => r.json()).then(setNetData).catch(() => {});
  }, []);
  return netData;
}

export function GrossOrdersTab() {
  const { data, isLoading, error, refetch } = useOrderData(config.dataUrls.orders);
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<OrderCustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const netData = useNetOrdersData();

  const allYears = data?.years || [];
  const { mode, setMode, singleYear, setSingleYear, filteredYears, rangeLabel } = useYearRange(allYears);

  const isSingle = mode === "single";
  const SENTINEL = 0;

  // Aggregated KPIs
  const rangeOrders = useMemo(() => {
    if (!data) return 0;
    return filteredYears.reduce((sum, y) => sum + (data.ordersByYear[y] || 0), 0);
  }, [data, filteredYears]);

  const rangeCustomers = useMemo(() => {
    if (!data) return 0;
    return new Set(data.orders.filter(o => filteredYears.includes(o.year)).map(o => o.customer)).size;
  }, [data, filteredYears]);

  const rangeNetCancel = useMemo(() => {
    if (!netData) return undefined;
    return filteredYears.reduce((sum, y) => {
      const v = netData.netInYearOfCancel[String(y)];
      return v !== undefined ? sum + v : sum;
    }, 0);
  }, [netData, filteredYears]);

  const rangeNetOrder = useMemo(() => {
    if (!netData) return undefined;
    return filteredYears.reduce((sum, y) => {
      const v = netData.netInYearOfOrder[String(y)];
      return v !== undefined ? sum + v : sum;
    }, 0);
  }, [netData, filteredYears]);

  // Donut data — aggregate across filteredYears
  const donutData = useMemo(() => {
    if (!data) return { byRegion: {}, byModel: {}, byEngine: {}, byCountry: {} };
    const yr = isSingle ? singleYear : SENTINEL;
    return {
      byRegion: isSingle ? data.ordersByYearByRegion : aggregateYears(data.ordersByYearByRegion, filteredYears, SENTINEL),
      byModel: isSingle ? data.ordersByYearByModelFamily : aggregateYears(data.ordersByYearByModelFamily, filteredYears, SENTINEL),
      byEngine: isSingle ? data.ordersByYearByEngine : aggregateYears(data.ordersByYearByEngine, filteredYears, SENTINEL),
      byCountry: isSingle ? data.ordersByYearByCountry : aggregateYears(data.ordersByYearByCountry, filteredYears, SENTINEL),
    };
  }, [data, filteredYears, isSingle, singleYear]);

  const donutYear = isSingle ? singleYear : SENTINEL;

  const modelFamiliesForDonut = useMemo(() => {
    if (!data) return [];
    return data.modelFamilies.filter(mf => (donutData.byModel[mf]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutData.byModel[b]?.[donutYear] || 0) - (donutData.byModel[a]?.[donutYear] || 0));
  }, [data, donutData, donutYear]);

  const regionsForDonut = useMemo(() => {
    if (!data) return [];
    return data.regions.filter(r => (donutData.byRegion[r]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutData.byRegion[b]?.[donutYear] || 0) - (donutData.byRegion[a]?.[donutYear] || 0));
  }, [data, donutData, donutYear]);

  const enginesForDonut = useMemo(() => {
    if (!data) return [];
    return data.engines.filter(e => (donutData.byEngine[e]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutData.byEngine[b]?.[donutYear] || 0) - (donutData.byEngine[a]?.[donutYear] || 0));
  }, [data, donutData, donutYear]);

  const countriesForDonut = useMemo(() => {
    if (!data) return [];
    return Object.keys(donutData.byCountry).filter(c => (donutData.byCountry[c]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutData.byCountry[b]?.[donutYear] || 0) - (donutData.byCountry[a]?.[donutYear] || 0)).slice(0, 20);
  }, [data, donutData, donutYear]);

  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    const s = customerSearch.toLowerCase();
    if (!s) return data.customers;
    return data.customers.filter(c => c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s) || c.region.toLowerCase().includes(s) || c.models.some(m => m.toLowerCase().includes(s)));
  }, [data, customerSearch]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading orders data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  const handleDrillDown = (name: string, _yearlyData: Record<number, number>, color: string) => openDrillDown(name, data.ordersByYearByRegion[name] || data.ordersByYearByModelFamily[name] || data.ordersByYearByEngine[name] || data.ordersByYearByCountry[name] || _yearlyData, color, "Gross Orders");
  const displayedCustomers = showAllCustomers ? filteredCustomers : filteredCustomers.slice(0, 25);

  return (
    <div className="py-8">
      <div className="flex justify-end mb-6">
        <YearRangeSelector allYears={allYears} mode={mode} onModeChange={setMode} singleYear={singleYear} onSingleYearChange={setSingleYear} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KPICard title="Total Lifetime Orders" value={data.totalLifetimeOrders} icon={Plane} accentColor="primary" delay={0.1} />
        <KPICard title={`Gross Orders in ${rangeLabel}`} value={rangeOrders} icon={TrendingUp} accentColor="accent" delay={0.2} />
        <KPICard title={`Customers in ${rangeLabel}`} value={rangeCustomers} icon={Users} accentColor="chart-4" delay={0.3} />
        {rangeNetCancel !== undefined && rangeNetCancel !== 0 ? (
          <KPICard title={`Net Orders (Cancel) ${rangeLabel}`} value={rangeNetCancel} icon={MinusCircle} accentColor="chart-3" delay={0.4} />
        ) : (
          <KPICard title={`Net Orders (Cancel) ${rangeLabel}`} value={0} icon={MinusCircle} accentColor="chart-3" delay={0.4} subtitle="Data not disclosed" />
        )}
        {rangeNetOrder !== undefined && rangeNetOrder !== 0 ? (
          <KPICard title={`Net Orders (Order) ${rangeLabel}`} value={rangeNetOrder} icon={FileCheck} accentColor="primary" delay={0.5} />
        ) : (
          <KPICard title={`Net Orders (Order) ${rangeLabel}`} value={0} icon={FileCheck} accentColor="primary" delay={0.5} subtitle="Data not disclosed" />
        )}
      </div>

      <div className="mb-8"><TrendLineChart data={data.ordersByYear} years={filteredYears} title="Gross Order Trends" subtitle="Total Boeing gross orders over time" metricLabel="Gross Orders" downloadTitle="Boeing Gross Orders — Gross Order Trends" /></div>
      <div className="mb-8"><MultiLineChart data={data.ordersByYearByModelFamily} years={filteredYears} title="Gross Orders by Aircraft Model" subtitle="Order trends by model family" segments={data.modelFamilies} onSegmentClick={handleDrillDown} downloadTitle="Boeing Gross Orders — By Aircraft Model" gradientPrefix="go-mf" /></div>
      <div className="mb-8"><MultiLineChart data={data.ordersByYearByRegion} years={filteredYears} title="Gross Orders by Region" subtitle="Order trends by geographic region" segments={data.regions} onSegmentClick={handleDrillDown} downloadTitle="Boeing Gross Orders — By Region" gradientPrefix="go-rg" /></div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution in {rangeLabel}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <YearlyDonutChart data={donutData.byRegion} year={donutYear} title="By Region" segments={regionsForDonut} metricLabel="Orders" onSegmentClick={handleDrillDown} downloadTitle={`Boeing Gross Orders — By Region (${rangeLabel})`} yearLabel={rangeLabel} />
          <YearlyDonutChart data={donutData.byModel} year={donutYear} title="By Aircraft Model" segments={modelFamiliesForDonut} metricLabel="Orders" onSegmentClick={handleDrillDown} downloadTitle={`Boeing Gross Orders — By Model (${rangeLabel})`} yearLabel={rangeLabel} />
          <YearlyDonutChart data={donutData.byEngine} year={donutYear} title="By Engine" segments={enginesForDonut} metricLabel="Orders" onSegmentClick={handleDrillDown} downloadTitle={`Boeing Gross Orders — By Engine (${rangeLabel})`} yearLabel={rangeLabel} />
          <YearlyDonutChart data={donutData.byCountry} year={donutYear} title="By Country" segments={countriesForDonut} metricLabel="Orders" onSegmentClick={handleDrillDown} downloadTitle={`Boeing Gross Orders — By Country (${rangeLabel})`} yearLabel={rangeLabel} />
        </div>
      </motion.div>

      {/* Customer Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-foreground">Customer Orders</h2><p className="text-sm text-muted-foreground">{filteredCustomers.length} customers found</p></div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer, country, model, region..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {customerSearch && <button onClick={() => setCustomerSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Country</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Years Active</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
          </tr></thead>
          <tbody className="divide-y divide-border">{displayedCustomers.map((c, i) => (
            <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
              <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{c.country}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{c.region}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalOrders.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-center text-muted-foreground">{c.firstYear}–{c.lastYear}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground"><div className="flex flex-wrap gap-1">{c.models.slice(0, 3).map(m => <span key={m} className="inline-block rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{m}</span>)}{c.models.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{c.models.length - 3}</span>}</div></td>
            </tr>
          ))}</tbody></table>
        </div>
        {filteredCustomers.length > 25 && <div className="mt-4 flex justify-center"><Button variant="outline" size="sm" onClick={() => setShowAllCustomers(!showAllCustomers)} className="border-border text-muted-foreground hover:text-foreground">{showAllCustomers ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredCustomers.length} Customers</>}</Button></div>}
      </motion.div>

      <DrillDownModal state={drillDownState} years={data.years} onClose={closeDrillDown} />

      <Dialog open={!!selectedCustomer} onOpenChange={open => { if (!open) setSelectedCustomer(null); }}>
        <DialogContent className="aircraft-interiors-theme max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          {selectedCustomer && <>
            <DialogHeader><DialogTitle className="text-foreground">{selectedCustomer.name}</DialogTitle></DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium text-foreground">{selectedCustomer.country}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Region</p><p className="text-sm font-medium text-foreground">{selectedCustomer.region}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Lifetime Orders</p><p className="text-lg font-bold text-foreground">{selectedCustomer.totalOrders.toLocaleString()}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Active Period</p><p className="text-sm font-medium text-foreground">{selectedCustomer.firstYear} – {selectedCustomer.lastYear}</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-2">Aircraft Models Ordered</p><div className="flex flex-wrap gap-1.5">{selectedCustomer.models.map(m => <span key={m} className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{m}</span>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">Order History</p><div className="overflow-x-auto max-h-[300px] overflow-y-auto relative"><table className="w-full"><thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card"><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Year</th><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Month</th><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Model</th><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Engine</th><th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th></tr></thead><tbody className="divide-y divide-border">{selectedCustomer.orderDetails.map((od, i) => <tr key={i} className="hover:bg-secondary/20"><td className="px-3 py-2 text-sm text-foreground">{od.year}</td><td className="px-3 py-2 text-sm text-muted-foreground">{od.month}</td><td className="px-3 py-2 text-sm text-muted-foreground">{od.model}</td><td className="px-3 py-2 text-sm text-muted-foreground">{od.engine}</td><td className="px-3 py-2 text-sm text-right font-mono text-foreground">{od.quantity}</td></tr>)}</tbody></table></div></div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <AppFooter sourceText="Boeing Gross Orders Analysis" unitText="All values represent aircraft units ordered" />
    </div>
  );
}
