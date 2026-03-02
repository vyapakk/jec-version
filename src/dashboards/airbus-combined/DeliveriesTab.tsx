/**
 * Deliveries tab content — Airbus Combined dashboard.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp, Globe, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { config } from "./config";
import { useAirbusDeliveryData, useDrillDown, type AirbusDeliveryCustomerSummary } from "./data";
import { KPICard, YearRangeSelector, useYearRange, aggregateYears } from "./ui-helpers";
import { TrendLineChart, MultiLineChart, YearlyDonutChart, DrillDownModal } from "./charts";
import AppFooter from "./AppFooter";

export function DeliveriesTab() {
  const { data, isLoading, error, refetch } = useAirbusDeliveryData(config.deliveriesDataUrl);
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AirbusDeliveryCustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const allYears = data?.summary.years || [];
  const { fromYear, setFromYear, toYear, setToYear, filteredYears, rangeLabel, isSingle } = useYearRange(allYears);

  const SENTINEL = 0;

  // KPI calculations
  const rangeDeliveries = useMemo(() => {
    if (!data) return 0;
    return filteredYears.reduce((sum, y) => sum + (data.summary.deliveriesByYear[y] || 0), 0);
  }, [data, filteredYears]);

  const totalCustomers = useMemo(() => {
    if (!data) return 0;
    return new Set(data.details.map(d => d.customer)).size;
  }, [data]);

  const activePrograms = useMemo(() => {
    if (!data) return 0;
    return data.summary.programs.filter(p =>
      filteredYears.some(y => (data.summary.deliveriesByYearByProgram[p]?.[y] || 0) > 0)
    ).length;
  }, [data, filteredYears]);

  // Donut data - by program
  const donutProgramData = useMemo(() => {
    if (!data) return {} as Record<string, Record<number, number>>;
    return isSingle
      ? data.summary.deliveriesByYearByProgram
      : aggregateYears(data.summary.deliveriesByYearByProgram, filteredYears, SENTINEL);
  }, [data, filteredYears, isSingle]);

  const donutYear = isSingle ? fromYear : SENTINEL;

  const programsForDonut = useMemo(() => {
    if (!data) return [];
    return data.summary.programs
      .filter(p => (donutProgramData[p]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutProgramData[b]?.[donutYear] || 0) - (donutProgramData[a]?.[donutYear] || 0));
  }, [data, donutProgramData, donutYear]);

  // Donut data - by region (from detail, 2021-2026 only)
  const detailFilteredYears = useMemo(() => {
    if (!data) return [];
    return filteredYears.filter(y => data.detailYears.includes(y));
  }, [data, filteredYears]);

  const donutRegionData = useMemo(() => {
    if (!data) return {} as Record<string, Record<number, number>>;
    if (detailFilteredYears.length === 0) return {};
    return isSingle && data.detailYears.includes(fromYear)
      ? data.deliveriesByYearByRegion
      : aggregateYears(data.deliveriesByYearByRegion, detailFilteredYears, SENTINEL);
  }, [data, detailFilteredYears, isSingle, fromYear]);

  const regionsForDonut = useMemo(() => {
    if (!data) return [];
    return data.regions
      .filter(r => (donutRegionData[r]?.[donutYear] || 0) > 0)
      .sort((a, b) => (donutRegionData[b]?.[donutYear] || 0) - (donutRegionData[a]?.[donutYear] || 0));
  }, [data, donutRegionData, donutYear]);

  // Filtered customers for table (static, all detail years)
  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    let customers = [...data.customers];
    const s = customerSearch.toLowerCase();
    if (s) {
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.region.toLowerCase().includes(s) ||
        c.models.some(m => m.toLowerCase().includes(s))
      );
    }
    return customers;
  }, [data, customerSearch]);

  const displayedCustomers = showAllCustomers ? filteredCustomers : filteredCustomers.slice(0, 25);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading deliveries data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  const handleDrillDown = (name: string, yearlyData: Record<number, number>, color: string) => {
    openDrillDown(name, yearlyData, color, "Deliveries");
  };

  const handleProgramDonutDrillDown = (name: string, _yearlyData: Record<number, number>, color: string) => {
    openDrillDown(name, data.summary.deliveriesByYearByProgram[name] || {}, color, "Deliveries");
  };

  const handleRegionDonutDrillDown = (name: string, _yearlyData: Record<number, number>, color: string) => {
    openDrillDown(name, data.deliveriesByYearByRegion[name] || {}, color, "Deliveries");
  };

  const detailYearRange = data.detailYears.length > 0
    ? `${data.detailYears[0]}–${data.detailYears[data.detailYears.length - 1]}`
    : "";

  return (
    <div className="py-8">
      <div className="flex justify-end mb-6">
        <YearRangeSelector allYears={allYears} fromYear={fromYear} toYear={toYear} onFromChange={setFromYear} onToChange={setToYear} />
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Lifetime Deliveries" value={data.summary.totalLifetime} icon={Plane} accentColor="primary" delay={0.1} />
        <KPICard title={`Deliveries in ${rangeLabel}`} value={rangeDeliveries} icon={TrendingUp} accentColor="accent" delay={0.2} />
        <KPICard title={`Total Customers (${detailYearRange})`} value={totalCustomers} icon={Users} accentColor="chart-4" delay={0.3} />
        <KPICard title={`Active Programs in ${rangeLabel}`} value={activePrograms} icon={Package} accentColor="chart-3" delay={0.4} />
      </div>

      {/* Trend Line Chart */}
      <div className="mb-8">
        <TrendLineChart
          data={data.summary.deliveriesByYear}
          years={filteredYears}
          title="Delivery Trends"
          subtitle="Total Airbus deliveries over time"
          metricLabel="Deliveries"
          downloadTitle="Airbus Deliveries — Delivery Trends"
        />
      </div>

      {/* Multi-Line by Program */}
      <div className="mb-8">
        <MultiLineChart
          data={data.summary.deliveriesByYearByProgram}
          years={filteredYears}
          title="Deliveries by Aircraft Program"
          subtitle="Delivery trends by aircraft program"
          segments={data.summary.programs}
          onSegmentClick={handleDrillDown}
          downloadTitle="Airbus Deliveries — By Aircraft Program"
          gradientPrefix="ab-del-prog"
        />
      </div>

      {/* Multi-Line by Region (detail data only) */}
      {detailFilteredYears.length > 0 && (
        <div className="mb-8">
          <MultiLineChart
            data={data.deliveriesByYearByRegion}
            years={detailFilteredYears}
            title="Deliveries by Region"
            subtitle={`Regional delivery trends (${detailYearRange} data available)`}
            segments={data.regions}
            onSegmentClick={(name, yearlyData, color) => {
              openDrillDown(name, data.deliveriesByYearByRegion[name] || {}, color, "Deliveries");
            }}
            downloadTitle="Airbus Deliveries — By Region"
            gradientPrefix="ab-del-reg"
          />
        </div>
      )}

      {/* Donut Charts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution in {rangeLabel}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <YearlyDonutChart
            data={donutProgramData}
            year={donutYear}
            title="By Aircraft Program"
            segments={programsForDonut}
            metricLabel="Deliveries"
            onSegmentClick={handleProgramDonutDrillDown}
            downloadTitle={`Airbus Deliveries — By Program (${rangeLabel})`}
            yearLabel={rangeLabel}
          />
          {regionsForDonut.length > 0 && (
            <YearlyDonutChart
              data={donutRegionData}
              year={donutYear}
              title="By Region"
              segments={regionsForDonut}
              metricLabel="Deliveries"
              onSegmentClick={handleRegionDonutDrillDown}
              downloadTitle={`Airbus Deliveries — By Region (${rangeLabel})`}
              yearLabel={rangeLabel}
            />
          )}
        </div>
        {detailFilteredYears.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground text-center">Region breakdown is only available for {detailYearRange}.</p>
        )}
      </motion.div>

      {/* Customer Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Deliveries</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length} customers found · Customer data from {detailYearRange}
            </p>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer, region, or model..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {customerSearch && <button onClick={() => setCustomerSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No customer data available.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Deliveries</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Years Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
              </tr></thead>
              <tbody className="divide-y divide-border">{displayedCustomers.map((c, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                  <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.region}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalDeliveries.toLocaleString()}</td>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Deliveries</p><p className="text-lg font-bold text-foreground">{selectedCustomer.totalDeliveries.toLocaleString()}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Region</p><p className="text-sm font-medium text-foreground">{selectedCustomer.region}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Active Period</p><p className="text-sm font-medium text-foreground">{selectedCustomer.firstYear === selectedCustomer.lastYear ? selectedCustomer.firstYear : `${selectedCustomer.firstYear} – ${selectedCustomer.lastYear}`}</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-2">Aircraft Models Delivered</p><div className="flex flex-wrap gap-1.5">{selectedCustomer.models.map(m => <span key={m} className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{m}</span>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">Delivery History</p>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto relative">
                  <table className="w-full"><thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Year</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Delivery Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Aircraft Model</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Region</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">{selectedCustomer.deliveryDetails.map((dd, i) => (
                    <tr key={i} className="hover:bg-secondary/20">
                      <td className="px-3 py-2 text-sm text-foreground">{dd.year}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{dd.deliveryDate}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{dd.aircraftModel}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{dd.region}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono text-foreground">{dd.quantity}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <AppFooter sourceText="Airbus Deliveries Analysis" unitText="All values represent aircraft units delivered" />
    </div>
  );
}
