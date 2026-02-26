/**
 * Chart components for Boeing Combined dashboard Overview tab.
 * Orders vs Deliveries dual-line chart.
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChartTableViewToggle, DataTable, AnimatedViewSwitch } from "./ui-helpers";

// ── Colors ────────────────────────────────────────────────────

const COLOR_ORDERS = "hsl(38, 92%, 55%)";
const COLOR_DELIVERIES = "hsl(192, 95%, 55%)";

// ── OrdersVsDeliveriesChart ───────────────────────────────────

interface OrdersVsDeliveriesChartProps {
  ordersByYear: Record<number, number>;
  deliveriesByYear: Record<number, number>;
  years: number[];
}

export function OrdersVsDeliveriesChart({ ordersByYear, deliveriesByYear, years }: OrdersVsDeliveriesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"chart" | "table">("chart");

  const chartData = years.map((year) => ({
    year,
    orders: ordersByYear[year] || 0,
    deliveries: deliveriesByYear[year] || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-medium text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => (
    <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-3 sm:gap-6">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_ORDERS }} />
        <span className="text-xs sm:text-sm text-muted-foreground">Gross Orders</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_DELIVERIES }} />
        <span className="text-xs sm:text-sm text-muted-foreground">Deliveries</span>
      </div>
    </div>
  );

  return (
    <motion.div ref={chartRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-xl border border-border bg-card p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Orders vs Deliveries</h3>
          <p className="text-sm text-muted-foreground">Historical comparison of gross orders and deliveries</p>
        </div>
        <div className="flex items-center gap-1">
          <ChartTableViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      <AnimatedViewSwitch view={view}
        chart={
          <div className="h-[300px] sm:h-[400px] w-full -mx-2 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} interval={Math.ceil(years.length / 10)} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
                <Line type="monotone" dataKey="orders" stroke={COLOR_ORDERS} strokeWidth={3} dot={{ fill: COLOR_ORDERS, strokeWidth: 0, r: 3 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Gross Orders" />
                <Line type="monotone" dataKey="deliveries" stroke={COLOR_DELIVERIES} strokeWidth={3} dot={{ fill: COLOR_DELIVERIES, strokeWidth: 0, r: 3 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Deliveries" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        table={
          <DataTable
            headers={["Year", "Gross Orders", "Deliveries"]}
            rows={chartData.map((d) => [d.year, d.orders.toLocaleString(), d.deliveries.toLocaleString()])}
          />
        }
      />
    </motion.div>
  );
}
