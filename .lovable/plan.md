

# Add Overview Tab to Airbus Dashboard

## Data Source
The uploaded `Summary.xlsx` contains variant-level totals with 3 columns:
- **Aircraft_Variant**: e.g., A220-100, A319ceo, A320neo, A350-900, A380
- **Metric_Full**: Orders, Deliveries, In Fleet
- **Units**: count

This provides aggregated totals across all Airbus variants -- perfect for an Overview tab showing high-level KPIs and breakdowns.

## What Will Be Built

### Overview Tab Content
1. **3 KPI Cards**: Total Orders, Total Deliveries, Total In Fleet (clickable to navigate to respective tabs)
2. **Grouped Bar Chart**: Orders vs Deliveries vs In Fleet by Aircraft Family (A220, A320 Family, A330, A340, A350, A380, A300/A310)
3. **Donut Charts** (side by side): Orders by Family + Deliveries by Family
4. **Variant-Level Table**: All variants with Orders, Deliveries, In Fleet columns
5. **Footer**: Standard Stratview footer

### Files to Create/Modify

1. **Copy `Summary.xlsx` to `public/data/airbus-summary.xlsx`**

2. **`src/dashboards/airbus-combined/config.ts`** -- Add `summaryDataUrl: "/data/airbus-summary.xlsx"`

3. **`src/dashboards/airbus-combined/data.ts`** -- Add:
   - `AirbusSummaryOverviewData` interface (totalOrders, totalDeliveries, totalInFleet, byFamily, byVariant)
   - `parseSummaryOverviewExcel()` function to parse the 3-column file, group by family using existing `getFamily()` mapper
   - `useAirbusSummaryOverview(url)` hook

4. **`src/dashboards/airbus-combined/OverviewTab.tsx`** (new file) -- Contains:
   - KPI cards row (3 cards: Orders, Deliveries, In Fleet)
   - Grouped bar chart by family (reuses existing `GroupedBarChart` from charts.tsx)
   - Two donut charts side by side (reuses existing `SimpleDonutChart`)
   - Variant detail table with search
   - Loading/error states following existing patterns

5. **`src/dashboards/airbus-combined/Dashboard.tsx`** -- Add Overview as the default/first tab, import OverviewTab

### Technical Details

- The "In Fleet" metric maps to "Operational" internally for consistency with existing naming
- Family grouping reuses the existing `getFamily()` function in data.ts
- Parser reads column `"Metric_Full"` and maps: "Orders" -> Orders, "Deliveries" -> Deliveries, "In Fleet" -> Operational
- Column for count is `"Units"`
- KPI cards will be clickable: Orders -> orders tab, Deliveries -> deliveries tab, In Fleet -> fleet tab (same pattern as Boeing overview)
- Default active tab changes from "orders" to "overview"

