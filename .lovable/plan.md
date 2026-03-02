

# Replace Fleet Data File and Fix Column Name Mismatch

## What Changed in the New File
- The "UNDISCLOSED" metric issue is fixed -- all metrics are now properly labeled as "Orders", "Deliveries", or "Operational Fleet"
- The column header changed from "No of Aircraft" to "No. of Aircraft" (with a period)
- "UNDISCLOSED" now only appears as a customer/airline name, which is correct

## Required Changes

### 1. Replace the Excel file
Copy the new `2._GPTWorldwide_Airline_Wise.xlsx` to `public/data/airbus-airline-fleet.xlsx`, overwriting the old file.

### 2. Fix column name in `data.ts` (line ~498)
The parser currently reads `r["No of Aircraft"]` but the new file uses `"No. of Aircraft"` (with a period). Update the column reference:

```text
// Before
const count = parseNum(r["No of Aircraft"]);

// After  
const count = parseNum(r["No. of Aircraft"] ?? r["No of Aircraft"]);
```

Using a fallback ensures compatibility with both old and new file formats.

No other changes needed -- the `parseMetric()` function already handles "Operational Fleet" correctly via `lower.includes("operational")`, and the rest of the parsing logic remains valid.

## Expected Result
- All KPI totals will be correct (Deliveries will be significantly higher, properly exceeding Operational)
- The grouped bar chart will show Deliveries >= Operational for all aircraft families including A320 Family
- Donut charts and airline table will reflect accurate data

