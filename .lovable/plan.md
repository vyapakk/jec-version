
# Fix Blank Drill-Down Charts in Airbus Dashboard

## Problem
When clicking a legend item to drill down (e.g., "A320Family"), the modal opens but the chart area is blank. This is because Recharts' `ResponsiveContainer` measures the parent's dimensions during the Radix Dialog's open animation, capturing 0 width/height before the dialog finishes expanding.

## Solution
In `src/dashboards/airbus-combined/charts.tsx`, modify the `DrillDownModal` component to delay rendering the chart until after the dialog animation completes. Add a small state-based delay (`useState` + `useEffect` with ~100ms timeout) that only renders the chart content once the dialog is fully open.

## Technical Changes

**File: `src/dashboards/airbus-combined/charts.tsx`** (DrillDownModal, lines ~224-245)

1. Add `useState` for a `ready` flag, defaulting to `false`
2. Add `useEffect` that watches `state.isOpen` -- when it becomes `true`, set a ~100ms timeout to flip `ready` to `true`; when `false`, reset `ready` to `false`
3. Conditionally render the `ResponsiveContainer` + `AreaChart` only when `ready` is `true`; show a brief loading placeholder otherwise

This is a minimal, targeted fix that doesn't change any data logic or other components.
