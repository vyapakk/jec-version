# Stratview One — Backend Integration Guide

## Overview

This is a static React SPA (Vite + React + TypeScript + Tailwind CSS).  
All data is currently served from static JSON/Excel files. Authentication and form submissions are simulated with `setTimeout`.

Search the codebase for `BACKEND INTEGRATION POINT` to find every placeholder that needs wiring up.

---

## 1. Authentication

### Login — `src/components/LoginForm.tsx`
```
POST /api/auth/login
Body: { email, password, rememberMe }
Response: { token, user }
```
Currently navigates to `/dashboard` after a simulated delay.

### Registration — `src/pages/SignUp.tsx`
```
POST /api/auth/register
Body: { name, company, designation, phone, email, password, industries[] }
Response: { token, user }
```

### Forgot Password — `src/pages/ForgotPassword.tsx`
```
POST /api/auth/forgot-password
Body: { email }
Response: { success: true }
```

---

## 2. Dataset Catalog — `src/data/datasets.ts`

Replace the static `categories` array with an API call.  
The `purchased` field should be resolved per authenticated user.

```
GET /api/datasets?user_id={userId}
Response: Same structure as categories[]
```

---

## 3. Access Request Form — `src/components/AccessRequestDialog.tsx`

```
POST /api/access-requests
Body: { name, designation, company, email, mobile, datasetName }
Response: { success: true }
```

---

## 4. Market Data (Dashboards)

Each dashboard fetches its data from a static file in `/public/data/`.  
Replace `fetch(dataUrl)` with your API endpoint.

```
GET /api/market-data/{market-slug}
Response: Same compact JSON structure (see any file in public/data/)
```

### 4a. Standard Single-Unit Dashboards (JSON)

These dashboards use a flat JSON structure with one set of values.

| JSON File | Route | Dashboard |
|-----------|-------|-----------|
| `global-aircraft-interiors-market.json` | `/dashboard/aircraft-interiors` | Global Aircraft Interiors Market |
| `aircraft-cabin-interior-composites-market.json` | `/dashboard/cabin-composites` | Aircraft Cabin Interior Composites Market |
| `aircraft-cabin-interiors-market.json` | `/dashboard/cabin-interiors-market` | Aircraft Cabin Interiors Market |
| `aircraft-cabin-lining-market.json` | `/dashboard/cabin-lining-market` | Aircraft Cabin Lining Market |
| `aircraft-cargo-liner-market.json` | `/dashboard/cargo-liner-market` | Aircraft Cargo Liner Market |
| `aircraft-floor-panels-market.json` | `/dashboard/floor-panels-market` | Aircraft Floor Panels Market |
| `aircraft-galley-market.json` | `/dashboard/galley-market` | Aircraft Galley Market |
| `aircraft-ifec-market.json` | `/dashboard/ifec-market` | Aircraft IFEC Market |
| `aircraft-interior-lighting-market.json` | `/dashboard/lighting-market` | Aircraft Interior Lighting Market |
| `aircraft-interior-non-sandwich-panel-composites-market.json` | `/dashboard/non-sandwich-panel-composites-market` | Aircraft Interior Non-Sandwich Panel Composites |
| `aircraft-interior-sandwich-panels-market.json` | `/dashboard/sandwich-panels-market` | Aircraft Interior Sandwich Panels Market |
| `aircraft-interiors-extrusion-market.json` | `/dashboard/extrusion-market` | Aircraft Interiors Extrusion Market |
| `aircraft-interiors-injection-molding-others-market.json` | `/dashboard/injection-molding-market` | Aircraft Interiors Injection Molding Market |
| `aircraft-interiors-plastic-market.json` | `/dashboard/plastic-market` | Aircraft Interiors Plastic Market |
| `aircraft-interiors-prepreg-market.json` | `/dashboard/interiors-prepreg` | Aircraft Interiors Prepreg Market |
| `aircraft-lavatory-market.json` | `/dashboard/lavatory-market` | Aircraft Lavatory Market |
| `aircraft-ohsb-market.json` | `/dashboard/ohsb-market` | Aircraft OHSB Market |
| `aircraft-potted-inserts-market.json` | `/dashboard/potted-inserts-market` | Aircraft Potted Inserts Market |
| `aircraft-psu-market.json` | `/dashboard/psu-market` | Aircraft PSU Market |
| `aircraft-seats-market.json` | `/dashboard/seats-market` | Aircraft Seats Market |
| `aircraft-soft-goods-market.json` | `/dashboard/soft-goods` | Aircraft Soft Goods Market |
| `aircraft-stowages-market.json` | `/dashboard/stowages-market` | Aircraft Stowages Market |
| `aircraft-thermoformed-parts-market.json` | `/dashboard/thermoformed-parts-market` | Aircraft Interior Thermoformed Parts Market |
| `aircraft-thermoformed-sheets-market.json` | `/dashboard/thermoformed-sheets-market` | Aircraft Thermoformed Sheets Market |
| `aircraft-water-waste-water-market.json` | `/dashboard/water-waste-water` | Aircraft Water/Waste Water Market |
| `polymer-space-composite-matrix-market.json` | `/dashboard/polymer-space-composite` | Polymer Space Composite Matrix Market |

### 4b. Dual-Unit Dashboards (Value/Weight JSON)

These dashboards support a unit toggle (US$ Million ↔ Million Lbs) and use a nested JSON structure with `value` and `weight` (or `volume`) keys.

| JSON File | Route | Dashboard |
|-----------|-------|-----------|
| `global-prepreg-market.json` | `/dashboard/global-prepreg` | Global Prepreg Market |
| `aerospace-prepreg-market.json` | `/dashboard/aerospace-prepreg` | Aerospace Prepreg Market |
| `carbon-fiber-prepreg-market.json` | `/dashboard/carbon-fiber-prepreg` | Carbon Fiber Prepreg Market |
| `glass-fiber-prepreg-market.json` | `/dashboard/glass-fiber-prepreg` | Glass Fiber Prepreg Market |
| `aramid-fiber-prepreg-market.json` | `/dashboard/aramid-fiber-prepreg` | Aramid Fiber Prepreg Market |
| `thermoplastic-prepreg-market.json` | `/dashboard/thermoplastic-prepreg` | Thermoplastic Prepreg Market |
| `high-temperature-prepreg-market.json` | `/dashboard/high-temp-prepreg` | High Temperature Prepregs Market |
| `bmi-prepreg-market.json` | `/dashboard/bmi-prepreg` | BMI Prepreg Market |
| `sporting-goods-prepreg-market.json` | `/dashboard/sporting-goods-prepreg` | Sporting Goods Prepreg Market |

### 4c. Excel-Based OEM Dashboards

These dashboards parse `.xlsx` files directly using SheetJS.

| Excel Files | Route | Dashboard |
|-------------|-------|-----------|
| `airbus-orders.xlsx`, `airbus-summary.xlsx`, `airbus-deliveries.xlsx`, `airbus-airline-fleet.xlsx` | `/dashboard/airbus-combined` | Airbus Orders & Deliveries |
| `boeing-gross-orders.xlsx`, `boeing-unfulfilled-orders.xlsx`, `boeing-deliveries.xlsx`, `boeing-net-orders.json` | `/dashboard/boeing-combined` | Boeing Orders & Deliveries |
| _(uses both Airbus + Boeing data)_ | `/dashboard/commercial-aircraft` | Commercial Aircraft Portal |

### Compact JSON Format (Standard)

```json
{
  "years": [2019, 2020, 2021, ...],
  "totalMarket": [100, 110, 120, ...],
  "endUser": { "OE": [80, 88, ...], "Aftermarket": [20, 22, ...] },
  "aircraftType": { "Narrow-Body Aircraft": [...], "Wide-Body Aircraft": [...], ... },
  "region": { "North America": [...], "Europe": [...], ... },
  "application": { "Segment A": [...], ... },
  "furnishedEquipment": { "BFE": [...], "SFE": [...] },
  "countryDataByRegion": { "North America": { "USA": [...], "Canada": [...] }, ... },
  "endUserByAircraftType": { "OE": { "Narrow-Body Aircraft": [...], ... }, ... },
  "endUserByRegion": { "OE": { "North America": [...], ... }, ... },
  "aircraftTypeByRegion": { "Narrow-Body Aircraft": { "North America": [...], ... }, ... },
  "applicationByRegion": { "Segment A": { "North America": [...], ... }, ... },
  "equipmentByRegion": { "BFE": { "North America": [...], ... }, ... }
}
```

### Dual-Unit JSON Format

```json
{
  "years": [2014, 2015, ...],
  "value": {
    "totalMarket": [...],
    "endUser": { ... },
    "aircraftType": { ... },
    "region": { ... },
    "application": { ... },
    "furnishedEquipment": { ... },
    "processType": { ... },
    "materialType": { ... },
    "countryDataByRegion": { ... },
    "endUserByAircraftType": { ... },
    "endUserByRegion": { ... },
    "aircraftTypeByRegion": { ... },
    "applicationByRegion": { ... },
    "equipmentByRegion": { ... },
    "processTypeByRegion": { ... },
    "materialTypeByRegion": { ... }
  },
  "weight": {
    "_comment": "Same structure as value, with weight-based numbers"
  }
}
```

All number arrays must have the same length as the `years` array.

---

## 5. SPA Routing (Server Config)

The app uses client-side routing. Your server must serve `index.html` for all non-file requests.

| Server | Config |
|--------|--------|
| Apache / cPanel | `public/.htaccess` |
| Netlify / Cloudflare | `public/_redirects` |
| Nginx | `try_files $uri /index.html;` |
| IIS | `public/web.config` |

---

## 6. Route Protection

Currently all routes are public. To add auth guards:
1. Create an `AuthProvider` context wrapping the app in `src/App.tsx`
2. Create a `ProtectedRoute` wrapper component
3. Wrap dashboard routes with `<ProtectedRoute>` to redirect unauthenticated users to `/`

---

## 7. Dataset Catalog Structure

Categories and datasets are defined in `src/data/datasets.ts`. Real dashboards self-register via their `config.ts` `catalog` field and are auto-merged.

### Current Categories & Datasets

| Category | Dataset ID | Dataset Name |
|----------|-----------|--------------|
| Aerospace & Defense | `aircraft-interiors` | Aircraft Interiors (25 dashboards) |
| Aerospace & Defense | `aircraft-orders-deliveries` | Aircraft Orders & Deliveries (3 dashboards) |
| Composites | `prepregs` | Prepregs (10 dashboards) |

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions (auto-discovered) |
| `src/dashboards/registry.ts` | Dashboard auto-discovery engine |
| `src/data/datasets.ts` | Dataset catalog (auto-merged from registry) |
| `src/data/dashboardRoutes.ts` | Route map (re-exports from registry) |
| `src/components/LoginForm.tsx` | Login handler |
| `src/pages/SignUp.tsx` | Registration handler |
| `src/pages/ForgotPassword.tsx` | Password reset handler |
| `src/components/AccessRequestDialog.tsx` | Access request form |
| `src/pages/Dashboard.tsx` | Dataset catalog page |
| `src/pages/DatasetDetail.tsx` | Dataset detail → dashboard navigation |
| `src/dashboards/TEMPLATE_README.md` | How to add a new dashboard |
