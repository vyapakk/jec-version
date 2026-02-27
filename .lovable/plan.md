

## Add Multi-Year Range Selector with Aggregated KPIs

### What Changes

Replace the single "Select Year" dropdown with a **range selector** offering presets: Last 5 Years, Last 10 Years, Last 20 Years, All Time, plus a single-year option (current behavior). Everything -- KPI cards, charts, and donut distributions -- updates to reflect the selected range.

### How It Works

**When a range is selected (e.g., Last 5 Years = 2021-2025):**
- **KPI cards** show summed/aggregated values across all years in the range
  - "Gross Orders in 2021-2025" shows total orders summed across those 5 years
  - "Customers in 2021-2025" shows unique customers across the range
  - Net order KPIs sum across the range years
- **Trend charts** (line/area) filter their x-axis to only show the selected years
- **Donut charts** aggregate data across the range (not just one year), showing combined distribution
- **Customer table** remains unfiltered (shows all-time data)

**When a single year is selected:** behaves exactly as it does today.

### UI Design

```text
[Last 5Y] [Last 10Y] [Last 20Y] [All Time] [Single Year ▾ 2025]
```

A row of pill buttons for range presets. The last option is a "Single Year" toggle that reveals the existing year dropdown, restoring current single-year behavior.

### Technical Details

**1. Add YearRangeSelector component** (`ui-helpers.tsx`)
- Toggle group with preset options + a single-year mode with dropdown
- Props: `allYears`, `onChange: (filteredYears: number[]) => void`
- Returns the selected subset of years

**2. Update GrossOrdersTab.tsx**
- Replace the year selector with `YearRangeSelector`
- Add `filteredYears` state derived from range selection
- KPI cards compute aggregated values:
  - Sum `data.ordersByYear[y]` for all `y` in `filteredYears`
  - Count unique customers across `filteredYears`
  - Sum net order values across `filteredYears`
- KPI titles update dynamically: "Orders in 2021-2025" or "Orders in 2025"
- Pass `filteredYears` to all chart components
- Donut charts aggregate across range: sum values per segment across all years in range

**3. Update DeliveriesTab.tsx**
- Same pattern: aggregated KPIs, filtered charts, aggregated donuts

**4. No changes needed to charts.tsx**
- Chart components already accept a `years` prop and render accordingly

### Files Modified
- `src/dashboards/boeing-combined/ui-helpers.tsx` -- add YearRangeSelector component
- `src/dashboards/boeing-combined/GrossOrdersTab.tsx` -- integrate range selector, aggregate KPIs
- `src/dashboards/boeing-combined/DeliveriesTab.tsx` -- integrate range selector, aggregate KPIs

