/**
 * Main Dashboard — Boeing Gross Orders.
 * Single-tab layout with KPIs, line charts, donut charts, and customer table.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppFooter from "@/components/AppFooter";

import { config } from "./config";
import { useOrderData, useDrillDown, type CustomerSummary } from "./data";
import { DashboardHeader, DashboardSkeleton, ScrollToTop, YearSelector } from "./layout";
import { KPICard } from "./ui-helpers";
import { OrderTrendLineChart, MultiLineChart, OrderDonutChart, DrillDownModal } from "./charts";

const BoeingGrossOrdersDashboard = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(config.defaultYear);
  const { data, isLoading, error, refetch } = useOrderData(config.dataUrl);
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  // All useMemo hooks BEFORE any early returns
  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    const search = customerSearch.toLowerCase();
    if (!search) return data.customers;
    return data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.country.toLowerCase().includes(search) ||
        c.region.toLowerCase().includes(search) ||
        c.models.some((m) => m.toLowerCase().includes(search))
    );
  }, [data, customerSearch]);

  const modelFamiliesForDonut = useMemo(() => {
    if (!data) return [];
    return data.modelFamilies
      .filter((mf) => (data.ordersByYearByModelFamily[mf]?.[selectedYear] || 0) > 0)
      .sort((a, b) => (data.ordersByYearByModelFamily[b]?.[selectedYear] || 0) - (data.ordersByYearByModelFamily[a]?.[selectedYear] || 0));
  }, [data, selectedYear]);

  const regionsForDonut = useMemo(() => {
    if (!data) return [];
    return data.regions
      .filter((r) => (data.ordersByYearByRegion[r]?.[selectedYear] || 0) > 0)
      .sort((a, b) => (data.ordersByYearByRegion[b]?.[selectedYear] || 0) - (data.ordersByYearByRegion[a]?.[selectedYear] || 0));
  }, [data, selectedYear]);

  const enginesForDonut = useMemo(() => {
    if (!data) return [];
    return data.engines
      .filter((e) => (data.ordersByYearByEngine[e]?.[selectedYear] || 0) > 0)
      .sort((a, b) => (data.ordersByYearByEngine[b]?.[selectedYear] || 0) - (data.ordersByYearByEngine[a]?.[selectedYear] || 0));
  }, [data, selectedYear]);

  const countriesForDonut = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.ordersByYearByCountry)
      .filter((c) => (data.ordersByYearByCountry[c]?.[selectedYear] || 0) > 0)
      .sort((a, b) => (data.ordersByYearByCountry[b]?.[selectedYear] || 0) - (data.ordersByYearByCountry[a]?.[selectedYear] || 0))
      .slice(0, 20);
  }, [data, selectedYear]);

  const yearOrders = useMemo(() => data?.ordersByYear[selectedYear] || 0, [data, selectedYear]);
  const yearCustomers = useMemo(() => {
    if (!data) return 0;
    return new Set(data.orders.filter((o) => o.year === selectedYear).map((o) => o.customer)).size;
  }, [data, selectedYear]);

  // Early returns AFTER all hooks
  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Failed to Load Data</h1>
        <p className="text-muted-foreground">{error || "Unable to load data"}</p>
        <Button onClick={refetch} className="mt-4"><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
      </div>
    );
  }

  const displayedCustomers = showAllCustomers ? filteredCustomers : filteredCustomers.slice(0, 25);

  return (
    <div className="aircraft-interiors-theme min-h-screen">
      <ScrollToTop />
      <DashboardHeader title={config.title} subtitle={config.subtitle} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(config.backPath)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
          </Button>
          <YearSelector value={selectedYear} onChange={setSelectedYear} years={data.years} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard title="Total Lifetime Orders" value={data.totalLifetimeOrders} icon={Plane} accentColor="primary" delay={0.1} />
          <KPICard title={`Gross Orders in ${selectedYear}`} value={yearOrders} icon={TrendingUp} accentColor="accent" delay={0.2} />
          <KPICard title={`Customers in ${selectedYear}`} value={yearCustomers} icon={Users} accentColor="chart-4" delay={0.3} />
        </div>

        {/* Line Charts */}
        <div className="mb-8">
          <OrderTrendLineChart data={data.ordersByYear} years={data.years} title="Gross Order Trends" subtitle="Total Boeing gross orders over time" />
        </div>

        <div className="mb-8">
          <MultiLineChart
            data={data.ordersByYearByModelFamily} years={data.years}
            title="Gross Orders by Aircraft Model" subtitle="Order trends by model family"
            segments={data.modelFamilies} onSegmentClick={openDrillDown}
          />
        </div>
        <div className="mb-8">
          <MultiLineChart
            data={data.ordersByYearByRegion} years={data.years}
            title="Gross Orders by Region" subtitle="Order trends by geographic region"
            segments={data.regions.filter((r) => r !== "Unidentified")} onSegmentClick={openDrillDown}
          />
        </div>

        {/* Donut Charts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Distribution in {selectedYear}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <OrderDonutChart data={data.ordersByYearByRegion} year={selectedYear} title="By Region" segments={regionsForDonut} onSegmentClick={openDrillDown} />
            <OrderDonutChart data={data.ordersByYearByModelFamily} year={selectedYear} title="By Aircraft Model" segments={modelFamiliesForDonut} onSegmentClick={openDrillDown} />
            <OrderDonutChart data={data.ordersByYearByEngine} year={selectedYear} title="By Engine" segments={enginesForDonut} onSegmentClick={openDrillDown} />
            <OrderDonutChart data={data.ordersByYearByCountry} year={selectedYear} title="By Country" segments={countriesForDonut} onSegmentClick={openDrillDown} />
          </div>
        </motion.div>

        {/* Customer Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Customer Orders</h2>
              <p className="text-sm text-muted-foreground">{filteredCustomers.length} customers found</p>
            </div>
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customer, country, model, region..." value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
              {customerSearch && (
                <button onClick={() => setCustomerSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Years Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.country}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.region}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalOrders.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-center text-muted-foreground">{c.firstYear}–{c.lastYear}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {c.models.slice(0, 3).map((m) => (
                          <span key={m} className="inline-block rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{m}</span>
                        ))}
                        {c.models.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{c.models.length - 3}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length > 25 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowAllCustomers(!showAllCustomers)} className="border-border text-muted-foreground hover:text-foreground">
                {showAllCustomers ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredCustomers.length} Customers</>}
              </Button>
            </div>
          )}
        </motion.div>

        <DrillDownModal state={drillDownState} years={data.years} onClose={closeDrillDown} />

        {/* Customer Detail Modal */}
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => { if (!open) setSelectedCustomer(null); }}>
          <DialogContent className="aircraft-interiors-theme max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
            {selectedCustomer && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground">{selectedCustomer.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="text-sm font-medium text-foreground">{selectedCustomer.country}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm font-medium text-foreground">{selectedCustomer.region}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Total Lifetime Orders</p>
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Active Period</p>
                      <p className="text-sm font-medium text-foreground">{selectedCustomer.firstYear} – {selectedCustomer.lastYear}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Aircraft Models Ordered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCustomer.models.map((m) => (
                        <span key={m} className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Order History</p>
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto relative">
                      <table className="w-full">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-border bg-card">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Year</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Month</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Model</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Engine</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedCustomer.orderDetails.map((od, i) => (
                            <tr key={i} className="hover:bg-secondary/20">
                              <td className="px-3 py-2 text-sm text-foreground">{od.year}</td>
                              <td className="px-3 py-2 text-sm text-muted-foreground">{od.month}</td>
                              <td className="px-3 py-2 text-sm text-muted-foreground">{od.model}</td>
                              <td className="px-3 py-2 text-sm text-muted-foreground">{od.engine}</td>
                              <td className="px-3 py-2 text-sm text-right font-mono text-foreground">{od.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AppFooter variant="dark" sourceText="Boeing Gross Orders Analysis" unitText="All values represent aircraft units ordered" />
      </main>
    </div>
  );
};

export default BoeingGrossOrdersDashboard;
