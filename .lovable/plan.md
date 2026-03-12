

## Fix: Hero Section Alignment

### Problem
The WelcomeSection hero layout appears vertically stacked and centered instead of showing text on the left and stats on the right in a horizontal row. This is visible in the uploaded screenshots.

### Root Cause
The `WelcomeSection` uses `text-center` as default with `md:text-left` override, and the flex container uses `flex-col` with `md:flex-row`. However, the stats grid uses `w-full md:w-auto` which, combined with `grid grid-cols-3` at mobile-first, may be causing the stats to take full width and appear centered even on desktop. Additionally, the `container px-0` combination may be conflicting with the section-level padding.

### Fix

**File: `src/components/WelcomeSection.tsx`**

1. Change the hero layout to ensure proper horizontal alignment at `md` breakpoint:
   - Make the text section take explicit flex-1 to claim left space
   - Ensure stats section uses `shrink-0` to stay right-aligned
   - Add `justify-center` for the stats on mobile, `justify-end` on desktop
   - Ensure the `container` properly applies padding instead of the section

2. Adjust the flex layout:
```
flex flex-col items-center md:flex-row md:items-center md:justify-between gap-6
```
   - Add `items-center` at mobile for proper centering
   - Ensure `md:justify-between` pushes stats to the right

3. Make text div use `flex-1 min-w-0` and stats div use `md:shrink-0` to prevent layout collapse.

### Changes
- **`src/components/WelcomeSection.tsx`** — Adjust flex layout classes for proper horizontal split at desktop, centered vertical stack at mobile.

