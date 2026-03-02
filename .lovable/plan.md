

# Align Lifetime KPI Numbers Across Tabs

## Problem
The Orders tab shows "Total Lifetime Gross Orders" and the Deliveries tab shows "Total Lifetime Deliveries" by summing only the years in their respective Excel files (2006-2026). This produces lower numbers than the true lifetime totals from the Summary file used by the Overview tab (25,559 orders and 16,776 deliveries).

## Solution
Import and use the summary data hook (`useAirbusSummaryOverview`) in both the Orders and Deliveries tabs to display the correct lifetime totals from the Summary file, while keeping all other year-range-based calculations unchanged.

## Changes

### 1. OrdersTab.tsx
- Import `useAirbusSummaryOverview` from `data.ts` and `config`
- Call `useAirbusSummaryOverview(config.summaryDataUrl)` to fetch summary data
- Replace the `data.summary.totalLifetimeGross` KPI value with `summaryData?.totalOrders ?? data.summary.totalLifetimeGross` so it shows 25,559 instead of the 2006+ sum

### 2. DeliveriesTab.tsx
- Import `useAirbusSummaryOverview` from `data.ts` and `config`
- Call `useAirbusSummaryOverview(config.summaryDataUrl)` to fetch summary data
- Replace the `data.summary.totalLifetime` KPI value with `summaryData?.totalDeliveries ?? data.summary.totalLifetime` so it shows 16,776 instead of the 2006+ sum

Both tabs will fall back to their existing calculated values if the summary data hasn't loaded yet, ensuring no loading delays or blank states.

