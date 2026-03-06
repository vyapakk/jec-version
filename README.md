# Stratview One — Market Intelligence Platform

A React-based market research dashboard platform built with **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Routing | React Router v6 |
| State | React Query + React Context |
| Export | html-to-image (chart PNG downloads) |

## Project Structure

```
src/
├── App.tsx                     # Route definitions (auto-discovers dashboards)
├── main.tsx                    # Entry point
├── index.css                   # Design tokens & global styles
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui primitives
│   ├── LoginForm.tsx           # Authentication form
│   ├── AccessRequestDialog.tsx # Dataset access request
│   ├── DashboardHeader.tsx     # Top navigation bar
│   ├── DatasetList.tsx         # Category/dataset listing
│   └── ...
├── dashboards/                 # Self-contained dashboard modules
│   ├── registry.ts             # Auto-discovery engine
│   ├── TEMPLATE_README.md      # How to add new dashboards
│   ├── aircraft-interiors/     # Standard single-unit dashboard
│   ├── global-prepreg/         # Dual-unit (Value/Weight) dashboard
│   ├── airbus-combined/        # Excel-based OEM dashboard
│   ├── boeing-combined/        # Excel-based OEM dashboard
│   ├── commercial-aircraft/    # Combined OEM portal
│   └── ...                     # 35+ additional dashboard modules
├── data/
│   ├── datasets.ts             # Dataset catalog (auto-merged from registry)
│   └── dashboardRoutes.ts      # Route map (auto-generated)
├── pages/                      # Top-level page components
│   ├── Index.tsx                # Landing / login page
│   ├── Dashboard.tsx            # Dataset catalog page
│   ├── DatasetDetail.tsx        # Dataset detail with dashboard links
│   └── ...
└── hooks/                      # Shared hooks
    ├── use-mobile.tsx
    └── use-toast.ts

public/
└── data/                       # Static JSON + Excel data files
```

## Dashboard Architecture

Each dashboard is a **standalone module** in `src/dashboards/<name>/` with zero cross-dashboard dependencies:

| File | Purpose |
|------|---------|
| `config.ts` | Settings, tabs, routing, catalog registration |
| `Dashboard.tsx` | Main page component |
| `data.ts` | Types, data fetching hooks, utilities |
| `charts.tsx` | Chart components (Recharts wrappers) |
| `layout.tsx` | Header, navigation, loading skeleton |
| `ui-helpers.tsx` | KPI cards, counters, formatting |
| `MarketOverviewTab.tsx` | Overview tab |
| `SegmentDetailTab.tsx` | Segment breakdown tabs |

### Adding a new dashboard

1. Copy an existing dashboard folder
2. Edit `config.ts` (data URL, title, tabs, route, catalog)
3. Add the JSON data file to `public/data/`
4. Done — auto-discovered at build time

See `src/dashboards/TEMPLATE_README.md` for full instructions.

## Dashboard Styles

| Style | Unit Toggle | Data Format | Example |
|-------|------------|-------------|---------|
| **Standard** | No | Single JSON object | Aircraft Interiors |
| **Dual (Favourite)** | Value / Weight | `{ value: {...}, weight: {...} }` | Global Prepreg, Carbon Fiber Prepreg |
| **OEM / Excel** | No | `.xlsx` files | Airbus, Boeing |

## Data Format

### Standard (single-unit) JSON
```json
{
  "years": [2019, 2020, ...],
  "totalMarket": [100, 110, ...],
  "endUser": { "OE": [...], "Aftermarket": [...] },
  "region": { "North America": [...], ... },
  ...
}
```

### Dual-unit JSON
```json
{
  "years": [2014, 2015, ...],
  "value": { "totalMarket": [...], "endUser": {...}, ... },
  "weight": { "totalMarket": [...], "endUser": {...}, ... }
}
```

## Development

```bash
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
```

## Backend Integration

See [INTEGRATION.md](./INTEGRATION.md) for the complete API contract, endpoint specifications, and data schemas needed to replace static data with a live backend.

## Key Integration Points

Search the codebase for `BACKEND INTEGRATION POINT` to find every placeholder:

- **Authentication**: `LoginForm.tsx`, `SignUp.tsx`, `ForgotPassword.tsx`
- **Dataset catalog**: `datasets.ts` (replace static array with API)
- **Market data**: Each dashboard's `data.ts` (replace `fetch(dataUrl)` with API)
- **Access requests**: `AccessRequestDialog.tsx`
