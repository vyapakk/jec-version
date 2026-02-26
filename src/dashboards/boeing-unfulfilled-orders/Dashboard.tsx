/**
 * Main Dashboard — Boeing Unfulfilled Orders.
 * Snapshot view: KPIs, donut charts, searchable customer table with detail modal.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { config } from "./config";
import { useUnfulfilledData, type CustomerSummary } from "./data";
import { DashboardHeader, DashboardSkeleton, ScrollToTop } from "./layout";
import { KPICard } from "./ui-helpers";
import { SnapshotDonutChart } from "./charts";
import AppFooter from "./AppFooter";

const BoeingUnfulfilledOrdersDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useUnfulfilledData(config.dataUrl);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    const search = customerSearch.toLowerCase();
    if (!search) return data.customers;
    return data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.country.toLowerCase().includes(search) ||
        c.region.toLowerCase().includes(search) ||
        c.models.some((m) => m.toLowerCase().includes(search)) ||
        c.engines.some((e) => e.toLowerCase().includes(search))
    );
  }, [data, customerSearch]);

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
    <div className="aircraft-interiors-theme min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <DashboardHeader title={config.title} subtitle={config.subtitle} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(config.backPath)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard
            title="Total Unfulfilled Orders"
            value={data.totalUnfulfilledOrders}
            icon={Plane}
            accentColor="primary"
            delay={0.1}
          />
          <KPICard
            title="Customers with Pending Orders"
            value={data.totalCustomers}
            icon={Users}
            accentColor="accent"
            delay={0.2}
          />
          <KPICard
            title="Top Model — Unfulfilled"
            value={data.topModel.quantity}
            icon={TrendingUp}
            accentColor="chart-4"
            delay={0.3}
            subtitle={data.topModel.name}
          />
        </div>

        {/* Donut Charts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Distribution of Unfulfilled Orders</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SnapshotDonutChart data={data.byModelFamily} title="By Aircraft Family" />
            <SnapshotDonutChart data={data.byEngine} title="By Engine" />
            <SnapshotDonutChart data={data.byRegion} title="By Region" />
          </div>
        </motion.div>

        {/* Model-level donut */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SnapshotDonutChart data={data.byModel} title="By Model Series" />
            <SnapshotDonutChart data={data.byCountry} title="By Country" />
          </div>
        </motion.div>

        {/* Customer Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Customers with Pending Orders</h2>
              <p className="text-sm text-muted-foreground">{filteredCustomers.length} customers found</p>
            </div>
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customer, country, model, engine..." value={customerSearch}
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
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Unfulfilled Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.country}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.region}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalUnfulfilled.toLocaleString()}</td>
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

        {/* Customer Detail Modal */}
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => { if (!open) setSelectedCustomer(null); }}>
          <DialogContent className="aircraft-interiors-theme max-w-2xl bg-card border-border overflow-y-auto">
            {selectedCustomer && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground">{selectedCustomer.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="text-sm font-medium text-foreground">{selectedCustomer.country}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Region</p>
                      <p className="text-sm font-medium text-foreground">{selectedCustomer.region}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">Total Pending Orders</p>
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.totalUnfulfilled.toLocaleString()}</p>
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
                    <p className="text-xs text-muted-foreground mb-2">Engines</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCustomer.engines.map((e) => (
                        <span key={e} className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-xs text-accent">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Pending Order Breakdown</p>
                    <div className="overflow-x-auto relative">
                      <table className="w-full">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-border bg-card">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Model</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Engine</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedCustomer.details.map((d, i) => (
                            <tr key={i} className="hover:bg-secondary/20">
                              <td className="px-3 py-2 text-sm text-foreground">{d.model}</td>
                              <td className="px-3 py-2 text-sm text-muted-foreground">{d.engine}</td>
                              <td className="px-3 py-2 text-sm text-right font-mono text-foreground">{d.quantity}</td>
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

        <AppFooter sourceText="Boeing Unfulfilled Orders Analysis" unitText="All values represent current pending aircraft orders" />
      </main>
    </div>
  );
};

export default BoeingUnfulfilledOrdersDashboard;
