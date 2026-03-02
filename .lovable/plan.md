

# Airbus Deliveries Tab

## Data Summary

**Sheet 1 "Deliveries Summary"** — yearly program-level totals (2006-2026):
- 3 columns: Year, Aircraft Family, Deliveries
- 7 aircraft families: A220, A320Family, A330, A340, A350, A380, A310/A300-600

**Sheet 2 "All Deliveries"** — customer-level detail (2021-2026):
- 6 columns: Year, Delivery Date, Customer, Region, Aircraft Model, Quantity
- Regions available: North America, Europe and CIS, Asia-Pacific, Middle East, Africa, Latin America & Caribbean, Undisclosed
- Note: Unlike orders, deliveries detail includes **Region** data, enabling region-based charts

## What Will Be Built

### Tab Content

**KPI Cards (4):**
1. Total Lifetime Deliveries (sum across all years from summary sheet)
2. Deliveries in selected range (from summary sheet, responds to year selector)
3. Unique Customers (static, all 2021-2026 from detail sheet -- matching the Orders tab pattern)
4. Aircraft Programs Active in range

**Charts (respond to year range selector):**
- Trend Line Chart: Total deliveries over time (2006-2026 from summary)
- Multi-Line Chart: Deliveries by Aircraft Program (A220, A320Family, etc.)
- Multi-Line Chart: Deliveries by Region (only for years with detail data, 2021-2026)

**Donut Charts (for selected range):**
- By Aircraft Program (from summary data, available for all years)
- By Region (from detail data, only meaningful for 2021-2026)

**Customer Table (static, all 2021-2026):**
- Searchable, sortable table with: Customer, Region, Total Deliveries, Years Active, Models
- Click-to-expand detail dialog showing individual delivery lines with dates, aircraft model, region, quantity
- Same static behavior as Orders tab (does not filter by year selector)

### File Changes

**1. Copy Excel file**
- Copy `Deliveries_Final.xlsx` to `public/data/airbus-deliveries.xlsx`

**2. Update `src/dashboards/airbus-combined/config.ts`**
- Add `deliveriesDataUrl` pointing to the new Excel file

**3. Update `src/dashboards/airbus-combined/data.ts`**
- Add new types: `AirbusDeliverySummaryData`, `AirbusDeliveryRecord`, `AirbusDeliveryCustomerSummary`, `AirbusDeliveryData`
- Add parser for "Deliveries Summary" sheet (columns: Year, Aircraft Family, Deliveries)
- Add parser for "All Deliveries" sheet (columns: Year, Delivery Date, Customer, Region, Aircraft Model, Quantity)
- Build aggregations: `deliveriesByYear`, `deliveriesByYearByProgram`, `deliveriesByYearByRegion` (from detail sheet)
- Build customer summaries with region info
- Add `useAirbusDeliveryData(url)` hook

**4. Create `src/dashboards/airbus-combined/DeliveriesTab.tsx`**
- Mirror the OrdersTab structure but adapted for deliveries:
  - 4 KPI cards
  - Trend line for total deliveries
  - Multi-line by Aircraft Program
  - Multi-line by Region (note: only 2021-2026 data)
  - Donut by Program + Donut by Region
  - Static customer table with click-to-open detail dialog
  - Region column in customer table and detail dialog (unlike Orders which has no region)

**5. Update `src/dashboards/airbus-combined/Dashboard.tsx`**
- Import and wire up `DeliveriesTab` component
- Enable the "Deliveries" tab (remove `disabled` and "Coming Soon")

## Key Design Decisions
- Customer table is static (all 2021-2026) matching the pattern established for Orders
- Region-based charts use detail data (2021-2026 only); a note will indicate this when the year range extends beyond
- Summary data drives program-level charts for the full 2006-2026 range
- Region breakdown from detail data builds `deliveriesByYearByRegion` for multi-line and donut charts
