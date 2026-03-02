

# Airbus Commercial Aircraft Orders & Deliveries — Orders Tab

## Data Understanding

The Excel file has two sheets:

**Sheet 1 (Orders Summary)** — program-level aggregates for 2006-2026:
- Columns: year, oem, aircraft_program, order_type_full, Units Ordered
- 3 metrics per program/year: Gross Orders, Net in year of cancellation, Net in year of order
- Programs: A220, A320Family, A330, A340, A350, A380, A310/A300-600

**Sheet 2 (Detailed Orders)** — customer-level detail for 2021-2026 only:
- Columns: Year, Order Date, Customer, Aircraft Model, Quantity
- No country, region, or engine data (unlike Boeing)

## Approach

Since the data is modest in size, we will read the Excel directly using SheetJS (already installed). We will create a new dashboard folder `src/dashboards/airbus-combined/` mirroring the Boeing structure but adapted for Airbus data.

## What Will Be Built (Orders Tab Only)

### 1. Copy Excel to public/data
- Place the file as `public/data/airbus-orders.xlsx`

### 2. Create `src/dashboards/airbus-combined/` with these files:

**config.ts** — Dashboard configuration (title, file paths, routes)

**data.ts** — SheetJS parsing logic for both sheets:
- Parse Sheet 1 into summary structures: grossByYear, netCancelByYear, netOrderByYear, all broken down by aircraft_program
- Parse Sheet 2 into detailed customer records
- Aggregate customer summaries (name, total orders, models ordered, year range)
- No region/country/engine breakdowns (data not available)

**OrdersTab.tsx** — The main Orders tab with:
- **KPI Cards (5):**
  1. Total Lifetime Gross Orders (sum of all gross orders 2006-2026)
  2. Gross Orders in selected range
  3. Unique Customers in range (from Sheet 2, only available 2021-2026)
  4. Net Orders (Year of Cancellation) in range
  5. Net Orders (Year of Order) in range
- **Trend Line Chart:** Gross orders over time (2006-2026)
- **Multi-Line Chart:** Gross orders by Aircraft Program (A220, A320Family, etc.)
- **Multi-Line Chart:** Net Orders comparison — gross vs net-cancel vs net-order side by side
- **Donut Charts (for selected range):**
  - By Aircraft Program (gross orders share)
  - (No region/country/engine donuts since data is unavailable)
- **Customer Table** (only populated for 2021-2026 range):
  - Searchable, sortable table with customer name, aircraft models, total orders, year range
  - Click-to-expand detail dialog showing individual order lines with dates
  - Note displayed when range includes years outside 2021-2026 that customer data is partial
- **Year Range Selector** reusing the existing shared component

**Dashboard.tsx** — Shell with tabs (only "Orders" active for now, placeholders for Deliveries and Pending Orders)

**layout.tsx, ui-helpers.tsx, charts.tsx, AppFooter.tsx** — Reuse/mirror from boeing-combined (shared chart components, KPI cards, etc.)

### 3. Register the dashboard
- Add route entry in `src/dashboards/registry.ts`
- Add route in `src/App.tsx`
- Add dataset entry in `src/data/datasets.ts` and `src/data/dashboardRoutes.ts`

## Key Differences from Boeing Dashboard
- No region, country, or engine breakdowns (data not available)
- Summary data (Sheet 1) provides program-level aggregates for the full 2006-2026 range
- Customer detail only available for 2021-2026
- Aircraft programs used directly as categories (no "model family" mapping needed)
- Order Date available in detail (Boeing has Month)

## Technical Details
- SheetJS reads both sheets by name: `wb.Sheets["Orders Summary"]` and `wb.Sheets["Detailed Orders"]`
- The shared chart components (TrendLineChart, MultiLineChart, YearlyDonutChart, DrillDownModal) from boeing-combined will be copied to the airbus folder for independence
- Year range selector and KPI cards reused from shared ui-helpers pattern

