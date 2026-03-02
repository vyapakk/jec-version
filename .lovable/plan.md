

# Add Country Data to Airline Fleet Tab

## Overview
The uploaded file `6._GPTWorldwide_Airline_Wise.xlsx` has the same structure as the current fleet data file but includes an additional **Country** column. This will be used to replace the existing data file and add country information to the airline table and detail dialog.

## Changes

### 1. Replace data file
- Copy `user-uploads://6._GPTWorldwide_Airline_Wise.xlsx` to `public/data/airbus-airline-fleet.xlsx` (overwrite existing)

### 2. Update data types and parsing (`src/dashboards/airbus-combined/data.ts`)
- Add `country: string` to the `AirlineFleetSummary` interface
- Add `country: string` to the internal `AirlineFleetRecord` interface
- In `parseFleetExcel()`, read the `Country` column from each row: `String(r["Country"] || "").trim()`
- Store the country on each airline entry in the `airlineMap`
- Include `country` in the final `AirlineFleetSummary` output

### 3. Update Fleet Tab UI (`src/dashboards/airbus-combined/FleetTab.tsx`)
- **Airline Table**: Add a "Country" column between "Airline" and "Region"
- **Search**: Include country in the search filter so users can search by country
- **Airline Detail Dialog**: Show "Country" alongside "Region" in the summary grid (change from 4-column to 5-column, or replace one stat card layout)

### 4. What stays the same
- All chart components, KPI cards, and donut charts remain unchanged
- The `parseMetric()` and `getFamily()` functions are unaffected
- The Metric_Full column still uses "Orders", "Deliveries", "Operational Fleet" -- same as before
- No changes to config.ts (same file path)

