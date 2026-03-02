/**
 * Orders tab content — Airbus Combined dashboard.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp, MinusCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { config } from "./config";
import { useAirbusOrderData, useDrillDown, type AirbusCustomerSummary } from "./data";
import { KPICard, YearRangeSelector, useYearRange, aggregateYears } from "./ui-helpers";
import { TrendLineChart, MultiLineChart, YearlyDonutChart, DrillDownModal } from "./charts";
import AppFooter from "./AppFooter";

export function OrdersTab() {
  const { data, isLoading, error, refetch } = useAirbusOrderData(config.dataUrl);
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AirbusCustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const allYears = data?.summary.years || [];
  const { fromYear, setFromYear, toYear, setToYear, filteredYears, rangeLabel, isSingle } = useYearRange(allYears);

  const SENTINEL = 0;

  // KPI calculations
  const rangeGross = useMemo(() => {
    if (!data) return 0;
    return filteredYears.reduce((sum, y) => sum + (data.summary.grossByYear[y] || 0), 0);
  }, [data, filteredYears]);

  const rangeNetCancel = useMemo(() => {
    if (!data) return 0;
    return filteredYears.reduce((sum, y) => sum + (data.summary.netCancelByYear[y] || 0), 0);
  }, [data, filteredYears]);

  const rangeNetOrder = useMemo(() => {
    if (!data) return 0;
    return filteredYears.reduce((sum, y) => sum + (data.summary.netOrderByYear[y] || 0), 0);
  }, [data, filteredYears]);

  const rangeCustomers = useMemo(() => {
    if (!data) return 0;
    const detailYearsInRange = filteredYears.filter(y => data.detailYears.includes(y));
    if (detailYearsInRange.length === 0) return 0;
    return new Set(data.details.filter(d => detailYearsInRange.includes(d.year)).map(d => d.customer)).size;
  }, [data, filteredYears]);

  const customerDataPartial = useMemo(() => {
    if (!data) return false;
    const detailMin = data.detailYears[0] || Infinity;
    const detailMax = data.detailYears[data.detailYears.length - 1] || -Infinity;
    return fromYear < detailMin || toYear > detailMax;
  }, [data, fromYear, toYear]);

  // Donut data
  const donutData = useMemo(() => {
    if (!data) return { byProgram: {} as Record<string, Record<number, number>> };
    return {
      byProgram: isSingle
        ? data.summary.grossByYearByProgram
        : aggregateYears(data.summary.grossByYearByProgram, filteredYears, SENTINEL),
    };
  }, [data, filteredYears, isSingle]);

  const donutYear = isSingle ? fromYear : SENTINEL;

  const programsForDonut = useMemo(() => {
    if (!data) return [];
    return data.summary.programs
      .filter(p => (donutData.byProgram[p]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutData.byProgram[b]?.[donutYear] || 0) - (donutData.byProgram[a]?.[donutYear] || 0));
  }, [data, donutData, donutYear]);

  // Net comparison multi-line chart data
  const netComparisonData = useMemo(() => {
    if (!data) return {} as Record<string, Record<number, number>>;
    return {
      "Gross Orders": data.summary.grossByYear,
      "Net (Year of Cancellation)": data.summary.netCancelByYear,
      "Net (Year of Order)": data.summary.netOrderByYear,
    };
  }, [data]);

  // Filtered customers for table (from detail data, filtered by year range)
  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    const detailYearsInRange = filteredYears.filter(y => data.detailYears.includes(y));
    if (detailYearsInRange.length === 0) return [];

    // Build customer summaries for the filtered range
    const custMap = new Map<string, {
      totalOrders: number; firstYear: number; lastYear: number;
      models: Set<string>;
      orderDetails: { year: number; orderDate: string; aircraftModel: string; quantity: number }[];
    }>();

    for (const d of data.details) {
      if (!detailYearsInRange.includes(d.year)) continue;
      let c = custMap.get(d.customer);
      if (!c) {
        c = { totalOrders: 0, firstYear: d.year, lastYear: d.year, models: new Set(), orderDetails: [] };
        custMap.set(d.customer, c);
      }
      c.totalOrders += d.quantity;
      c.firstYear = Math.min(c.firstYear, d.year);
      c.lastYear = Math.max(c.lastYear, d.year);
      c.models.add(d.aircraftModel);
      c.orderDetails.push({ year: d.year, orderDate: d.orderDate, aircraftModel: d.aircraftModel, quantity: d.quantity });
    }

    let customers = [...custMap.entries()]
      .map(([name, c]) => ({
        name,
        totalOrders: c.totalOrders,
        firstYear: c.firstYear,
        lastYear: c.lastYear,
        models: [...c.models],
        orderDetails: c.orderDetails.sort((a, b) => a.year - b.year),
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders);

    const s = customerSearch.toLowerCase();
    if (s) {
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.models.some(m => m.toLowerCase().includes(s))
      );
    }

    return customers;
  }, [data, filteredYears, customerSearch]);

  const displayedCustomers = showAllCustomers ? filteredCustomers : filteredCustomers.slice(0, 25);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading orders data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  const handleDrillDown = (name: string, yearlyData: Record<number, number>, color: string) => {
    openDrillDown(name, yearlyData, color, "Gross Orders");
  };

  return (
    <div className="py-8">
      <div className="flex justify-end mb-6">
        <YearRangeSelector allYears={allYears} fromYear={fromYear} toYear={toYear} onFromChange={setFromYear} onToChange={setToYear} />
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KPICard title="Total Lifetime Gross Orders" value={data.summary.totalLifetimeGross} icon={Plane} accentColor="primary" delay={0.1} />
        <KPICard title={`Gross Orders in ${rangeLabel}`} value={rangeGross} icon={TrendingUp} accentColor="accent" delay={0.2} />
        <KPICard
          title={`Customers in ${rangeLabel}`}
          value={rangeCustomers}
          icon={Users}
          accentColor="chart-4"
          delay={0.3}
          subtitle={rangeCustomers === 0 ? "Customer data: 2021–2026 only" : undefined}
        />
        <KPICard title={`Net Orders (Yr of Cancellation)`} value={rangeNetCancel} icon={MinusCircle} accentColor="chart-3" delay={0.4} subtitle={rangeLabel} />
        <KPICard title={`Net Orders (Yr of Order)`} value={rangeNetOrder} icon={FileCheck} accentColor="primary" delay={0.5} subtitle={rangeLabel} />
      </div>

      {/* Trend Line Chart */}
      <div className="mb-8">
        <TrendLineChart
          data={data.summary.grossByYear}
          years={filteredYears}
          title="Gross Order Trends"
          subtitle="Total Airbus gross orders over time"
          metricLabel="Gross Orders"
          downloadTitle="Airbus Orders — Gross Order Trends"
        />
      </div>

      {/* Multi-Line by Program */}
      <div className="mb-8">
        <MultiLineChart
          data={data.summary.grossByYearByProgram}
          years={filteredYears}
          title="Gross Orders by Aircraft Program"
          subtitle="Order trends by aircraft program"
          segments={data.summary.programs}
          onSegmentClick={handleDrillDown}
          downloadTitle="Airbus Orders — By Aircraft Program"
          gradientPrefix="ab-prog"
        />
      </div>

      {/* Net Orders Comparison */}
      <div className="mb-8">
        <MultiLineChart
          data={netComparisonData}
          years={filteredYears}
          title="Orders Comparison: Gross vs Net"
          subtitle="Gross orders vs net orders (year of cancellation) vs net orders (year of order)"
          segments={["Gross Orders", "Net (Year of Cancellation)", "Net (Year of Order)"]}
          downloadTitle="Airbus Orders — Gross vs Net Comparison"
          gradientPrefix="ab-net"
        />
      </div>

      {/* Donut Charts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution in {rangeLabel}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <YearlyDonutChart
            data={donutData.byProgram}
            year={donutYear}
            title="By Aircraft Program"
            segments={programsForDonut}
            metricLabel="Orders"
            onSegmentClick={handleDrillDown}
            downloadTitle={`Airbus Orders — By Program (${rangeLabel})`}
            yearLabel={rangeLabel}
          />
        </div>
      </motion.div>

      {/* Customer Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Orders</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length} customers found
              {customerDataPartial && " (customer data available for 2021–2026 only)"}
            </p>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer or model..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {customerSearch && <button onClick={() => setCustomerSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No customer data available for the selected range.</p>
            <p className="text-xs mt-1">Customer-level detail is only available for 2021–2026.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Years Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
              </tr></thead>
              <tbody className="divide-y divide-border">{displayedCustomers.map((c, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                  <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalOrders.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">{c.firstYear === c.lastYear ? c.firstYear : `${c.firstYear}–${c.lastYear}`}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground"><div className="flex flex-wrap gap-1">{c.models.slice(0, 3).map(m => <span key={m} className="inline-block rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{m}</span>)}{c.models.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{c.models.length - 3}</span>}</div></td>
                </tr>
              ))}</tbody></table>
            </div>
            {filteredCustomers.length > 25 && <div className="mt-4 flex justify-center"><Button variant="outline" size="sm" onClick={() => setShowAllCustomers(!showAllCustomers)} className="border-border text-muted-foreground hover:text-foreground">{showAllCustomers ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredCustomers.length} Customers</>}</Button></div>}
          </>
        )}
      </motion.div>

      <DrillDownModal state={drillDownState} years={data.summary.years} onClose={closeDrillDown} />

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={open => { if (!open) setSelectedCustomer(null); }}>
        <DialogContent className="aircraft-interiors-theme max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          {selectedCustomer && <>
            <DialogHeader><DialogTitle className="text-foreground">{selectedCustomer.name}</DialogTitle></DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-lg font-bold text-foreground">{selectedCustomer.totalOrders.toLocaleString()}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Active Period</p><p className="text-sm font-medium text-foreground">{selectedCustomer.firstYear === selectedCustomer.lastYear ? selectedCustomer.firstYear : `${selectedCustomer.firstYear} – ${selectedCustomer.lastYear}`}</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-2">Aircraft Models Ordered</p><div className="flex flex-wrap gap-1.5">{selectedCustomer.models.map(m => <span key={m} className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{m}</span>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">Order History</p>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto relative">
                  <table className="w-full"><thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Year</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Order Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Aircraft Model</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">{selectedCustomer.orderDetails.map((od, i) => (
                    <tr key={i} className="hover:bg-secondary/20">
                      <td className="px-3 py-2 text-sm text-foreground">{od.year}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{od.orderDate}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{od.aircraftModel}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono text-foreground">{od.quantity}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <AppFooter sourceText="Airbus Orders Analysis" unitText="All values represent aircraft units ordered" />
    </div>
  );
}
