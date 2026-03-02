/**
 * Boeing Overview tab — internalized for commercial-aircraft dashboard.
 */

import { motion } from "framer-motion";
import { Plane, TrendingUp, Clock } from "lucide-react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useCombinedData, type CombinedOverviewData } from "./boeing-data";
import { KPICard } from "./ui-helpers";
import { OrdersVsDeliveriesChart } from "./boeing-charts";
import AppFooter from "./AppFooter";

interface OverviewTabProps {
  data: CombinedOverviewData;
  onTabChange?: (tab: string) => void;
}

export function BoeingOverviewContent({ data, onTabChange }: OverviewTabProps) {
  return (
    <div className="py-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="cursor-pointer" onClick={() => onTabChange?.("gross-orders")}>
          <KPICard title="Total Lifetime Orders" value={data.totalLifetimeOrders} icon={Plane} accentColor="primary" delay={0.1} />
        </div>
        <div className="cursor-pointer" onClick={() => onTabChange?.("deliveries")}>
          <KPICard title="Total Lifetime Deliveries" value={data.totalLifetimeDeliveries} icon={TrendingUp} accentColor="accent" delay={0.2} />
        </div>
        <div className="cursor-pointer" onClick={() => onTabChange?.("pending-orders")}>
          <KPICard title="Total Pending Orders" value={data.totalPendingOrders} icon={Clock} accentColor="chart-4" delay={0.3} />
        </div>
      </div>

      <div className="mb-8">
        <OrdersVsDeliveriesChart ordersByYear={data.ordersByYear} deliveriesByYear={data.deliveriesByYear} years={data.years} />
      </div>

      <AppFooter sourceText="Boeing Commercial Aircraft Analysis" unitText="All values represent aircraft units" />
    </div>
  );
}

export function BoeingOverviewLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading overview data...</span>
      </div>
    </div>
  );
}

export function BoeingOverviewError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
    </div>
  );
}
