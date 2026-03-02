/**
 * Boeing Pending Orders tab — internalized for commercial-aircraft dashboard.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Plane, Users, TrendingUp, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { boeingConfig as config } from "./boeing-config";
import { useUnfulfilledData, type UnfulfilledCustomerSummary } from "./boeing-data";
import { KPICard } from "./ui-helpers";
import { SnapshotDonutChart } from "./boeing-charts";
import AppFooter from "./AppFooter";

export function BoeingPendingOrdersTab() {
  const { data, isLoading, error, refetch } = useUnfulfilledData(config.dataUrls.unfulfilled);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UnfulfilledCustomerSummary | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    const s = customerSearch.toLowerCase();
    if (!s) return data.customers;
    return data.customers.filter(c => c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s) || c.region.toLowerCase().includes(s) || c.models.some(m => m.toLowerCase().includes(s)) || c.engines.some(e => e.toLowerCase().includes(s)));
  }, [data, customerSearch]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span>Loading pending orders data...</span></div></div>;
  if (error || !data) return <div className="flex flex-col items-center justify-center gap-4 py-20"><AlertCircle className="h-12 w-12 text-destructive" /><p className="text-muted-foreground">{error || "Unable to load data"}</p><Button onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button></div>;

  const displayedCustomers = showAllCustomers ? filteredCustomers : filteredCustomers.slice(0, 25);

  return (
    <div className="py-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Total Unfulfilled Orders" value={data.totalUnfulfilledOrders} icon={Plane} accentColor="primary" delay={0.1} />
        <KPICard title="Customers with Pending Orders" value={data.totalCustomers} icon={Users} accentColor="accent" delay={0.2} />
        <KPICard title="Top Model — Unfulfilled" value={data.topModel.quantity} icon={TrendingUp} accentColor="chart-4" delay={0.3} subtitle={data.topModel.name} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Distribution of Unfulfilled Orders</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SnapshotDonutChart data={data.byModelFamily} title="By Aircraft Family" />
          <SnapshotDonutChart data={data.byEngine} title="By Engine" />
          <SnapshotDonutChart data={data.byRegion} title="By Region" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SnapshotDonutChart data={data.byModel} title="By Model Series" />
          <SnapshotDonutChart data={data.byCountry} title="By Country" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-foreground">Customers with Pending Orders</h2><p className="text-sm text-muted-foreground">{filteredCustomers.length} customers found</p></div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer, country, model, engine..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" />
            {customerSearch && <button onClick={() => setCustomerSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Country</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Region</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Unfulfilled Orders</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Models</th>
          </tr></thead>
          <tbody className="divide-y divide-border">{displayedCustomers.map((c, i) => (
            <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
              <td className="px-4 py-3 text-sm font-medium text-primary hover:underline">{c.name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{c.country}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{c.region}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{c.totalUnfulfilled.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground"><div className="flex flex-wrap gap-1">{c.models.slice(0, 3).map(m => <span key={m} className="inline-block rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{m}</span>)}{c.models.length > 3 && <span className="text-[10px] text-muted-foreground/60">+{c.models.length - 3}</span>}</div></td>
            </tr>
          ))}</tbody></table>
        </div>
        {filteredCustomers.length > 25 && <div className="mt-4 flex justify-center"><Button variant="outline" size="sm" onClick={() => setShowAllCustomers(!showAllCustomers)} className="border-border text-muted-foreground hover:text-foreground">{showAllCustomers ? <><ChevronUp className="mr-1 h-4 w-4" /> Show Less</> : <><ChevronDown className="mr-1 h-4 w-4" /> Show All {filteredCustomers.length} Customers</>}</Button></div>}
      </motion.div>

      <Dialog open={!!selectedCustomer} onOpenChange={open => { if (!open) setSelectedCustomer(null); }}>
        <DialogContent className="aircraft-interiors-theme max-w-lg bg-card border-border overflow-y-auto !grid-rows-[auto_1fr] max-h-[90vh]">
          {selectedCustomer && <>
            <DialogHeader><DialogTitle className="text-foreground">{selectedCustomer.name}</DialogTitle></DialogHeader>
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium text-foreground">{selectedCustomer.country}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Region</p><p className="text-sm font-medium text-foreground">{selectedCustomer.region}</p></div>
                <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Total Pending Orders</p><p className="text-lg font-bold text-foreground">{selectedCustomer.totalUnfulfilled.toLocaleString()}</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-2">Aircraft Models Ordered</p><div className="flex flex-wrap gap-1.5">{selectedCustomer.models.map(m => <span key={m} className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{m}</span>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">Engines</p><div className="flex flex-wrap gap-1.5">{selectedCustomer.engines.map(e => <span key={e} className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-xs text-accent">{e}</span>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">Pending Order Breakdown</p><div className="overflow-x-auto relative"><table className="w-full"><thead className="sticky top-0 z-10"><tr className="border-b border-border bg-card"><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Model</th><th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Engine</th><th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Quantity</th></tr></thead><tbody className="divide-y divide-border">{selectedCustomer.details.map((d, i) => <tr key={i} className="hover:bg-secondary/20"><td className="px-3 py-2 text-sm text-foreground">{d.model}</td><td className="px-3 py-2 text-sm text-muted-foreground">{d.engine}</td><td className="px-3 py-2 text-sm text-right font-mono text-foreground">{d.quantity}</td></tr>)}</tbody></table></div></div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <AppFooter sourceText="Boeing Unfulfilled Orders Analysis" unitText="All values represent current pending aircraft orders" />
    </div>
  );
}
