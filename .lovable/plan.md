
# Airline Orders, Deliveries & Fleet Tab

## Data Structure
Single sheet with cumulative (non-yearly) data:
- **Columns**: Customer, Region, Aircraft_Variant, Metric_Full (Orders / Deliveries / Operational), No of Aircraft
- **~2,975 rows** covering ~400+ airlines across ~20 aircraft variants, 7 regions, and 3 metrics
- No time-series -- these are lifetime totals per airline per variant

## Tab Layout

### KPI Cards (4)
1. **Total Orders** -- sum of all "Orders" rows
2. **Total Deliveries** -- sum of all "Deliveries" rows
3. **Operational Fleet** -- sum of all "Operational" rows
4. **Backlog** -- Orders minus Deliveries (unfulfilled)

### Charts (no year range selector needed -- this is snapshot data)

**Stacked/Grouped Bar Chart: Orders vs Deliveries vs Operational by Aircraft Family**
- Group variants into families (A220, A320Family, A330, A340, A350, A380)
- Three bars per family showing Orders, Deliveries, Operational side by side

**Donut Charts (3)**
- Orders Distribution by Aircraft Variant
- Deliveries Distribution by Region
- Operational Fleet by Region

**Horizontal Bar Chart: Top 20 Airlines by Fleet Size (Operational)**
- Shows the biggest operators

### Airline Table (searchable, sortable)
- Columns: Airline, Region, Total Orders, Total Deliveries, Operational Fleet, Backlog, Variants
- Click-to-expand detail dialog showing per-variant breakdown (Orders/Deliveries/Operational per aircraft variant for that airline)
- Searchable by airline name, region, or variant

## Technical Changes

### 1. Copy Excel file
Copy `GPTWorldwide_Airline_Wise.xlsx` to `public/data/airbus-airline-fleet.xlsx`

### 2. Update `config.ts`
Add `airlineFleetDataUrl: "/data/airbus-airline-fleet.xlsx"`

### 3. Update `data.ts` -- add new types and parser

New types:
```text
AirlineFleetRecord     -- raw row: customer, region, variant, metric, count
AirlineFleetSummary    -- per-airline aggregate: name, region, totalOrders, totalDeliveries, operational, backlog, variants[]
AirlineFleetData       -- full parsed result with aggregations by variant, region, metric
```

New parser reads the single sheet, builds:
- `byVariant`: Record<variant, Record<metric, number>> for bar charts
- `byRegion`: Record<region, Record<metric, number>> for donut charts
- `airlines`: AirlineFleetSummary[] for the table
- Totals for KPIs

New hook: `useAirlineFleetData(url)`

### 4. Create `FleetTab.tsx`
New component following the same patterns as OrdersTab/DeliveriesTab:
- No year range selector (data is cumulative snapshot)
- KPI cards, grouped bar chart, donut charts, top airlines bar chart
- Searchable airline table with detail dialog
- Reuses existing chart components where possible; adds a new `GroupedBarChart` component for the Orders/Deliveries/Operational comparison

### 5. Add `GroupedBarChart` to `charts.tsx`
New chart component for side-by-side comparison of 3 metrics across aircraft families. Uses Recharts `BarChart` with grouped `Bar` elements.

### 6. Add `HorizontalBarChart` to `charts.tsx`
For the Top 20 Airlines ranking visualization.

### 7. Update `Dashboard.tsx`
- Import `FleetTab`
- Add "Airline Orders, Deliveries & Fleet" tab (enable it, remove disabled state from pending orders or add as 3rd tab)
- Keep "Pending Orders (Coming Soon)" as the 4th tab
