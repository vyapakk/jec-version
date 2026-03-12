

# Remove Backlog Column from Airline Fleet Tab

## What Changes
Remove all references to "Backlog" from the Airline Fleet Overview table in `FleetTab.tsx`, since unfulfilled orders don't strictly equal backlog (cancelled orders inflate the number).

## Specific Edits in `src/dashboards/airbus-combined/FleetTab.tsx`

### 1. Table Header (line 157)
Remove the "Backlog" column header from the table.

### 2. Table Body (line 168)
Remove the `{a.backlog.toLocaleString()}` table cell from each airline row.

No changes needed to `data.ts` -- the `backlog` field can remain in the interface without being displayed. No other file references backlog in the Fleet tab (KPI card was already removed previously, and the detail dialog doesn't show it).
