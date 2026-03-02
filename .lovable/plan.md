

# Make Customer Orders Table Static (Year-Independent)

## What Changes

Currently, the customer table filters by the selected year range, which means changing years can show "No customer data available." The request is to make it always show **all customers across all detail years (2021-2026)** regardless of the year selector, and ensure the click-to-open detail dialog shows all order lines.

## Changes (Single File)

**`src/dashboards/airbus-combined/OrdersTab.tsx`**

1. **Remove year-range filtering from customer data** (lines 90-136): Change `filteredCustomers` to use ALL `data.detailYears` instead of `filteredYears`. Remove the intersection logic (`detailYearsInRange`).

2. **Remove the `customerDataPartial` memo** (lines 53-58) and its usage in the subtitle (line 232) -- no longer needed since customer data is always showing everything.

3. **Remove the `rangeCustomers` KPI** (lines 46-51) or change it to show total unique customers statically. Update the KPI card (lines 157-164) to say "Total Customers (2021-2026)" instead of referencing the range.

4. **Update section subtitle** to say "Customer data from 2021-2026" statically instead of referencing the selected range.

5. **Keep the detail dialog as-is** -- it already shows all order lines for the selected customer. No changes needed there.

## Technical Detail

The key edit is in the `filteredCustomers` useMemo -- replace:
```typescript
const detailYearsInRange = filteredYears.filter(y => data.detailYears.includes(y));
```
with:
```typescript
const detailYearsInRange = data.detailYears;
```

And remove the dependency on `filteredYears` from that memo. The search filter stays intact.
