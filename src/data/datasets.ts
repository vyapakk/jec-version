import { Layers, Plane } from "lucide-react";
import { dashboardRegistry } from "@/dashboards/registry";

/**
 * BACKEND INTEGRATION POINT: Dataset Categories & Purchase Status
 * 
 * Replace this static array with an API call. The API should return the same
 * structure but with `purchased` resolved per authenticated user at the DASHBOARD level.
 * 
 * Expected API: GET /api/datasets?user_id={userId}
 * Expected Response: Same structure as below, with `purchased: true/false` per dashboard
 * 
 * The `purchased` field on each dashboard controls:
 * - Dataset listing (DatasetList.tsx): Shows lock if NO dashboards are purchased
 * - Subscriptions (SubscriptionsSection.tsx): Shows dataset if ANY dashboard is purchased
 * - Detail page (DatasetDetail.tsx): Per-dashboard lock icon and access request
 * 
 * DASHBOARD AUTO-DISCOVERY:
 * Real dashboards are auto-registered from each dashboard's config.ts `catalog` field.
 * Only placeholder/future dashboards need to be listed here manually.
 */

// ── Base category definitions ─────────────────────────────────
// Real dashboards are auto-merged from the registry below.
// Only define categories/datasets that need to exist before any dashboard registers into them.

const baseCategories = [
  {
    id: "aerospace-defense",
    title: "Aerospace & Defense",
    icon: Plane,
    color: "navy" as const,
    description: "Comprehensive aerospace and defense market intelligence covering aircraft interiors, orders & deliveries, and more.",
    datasets: [
      {
        id: "aircraft-interiors",
        name: "Aircraft Interiors",
        dashboards: [] as { id: string; name: string; purchased: boolean }[],
      },
      {
        id: "aircraft-orders-deliveries",
        name: "Aircraft Orders & Deliveries",
        dashboards: [] as { id: string; name: string; purchased: boolean }[],
      },
    ],
  },
  {
    id: "composites",
    title: "Composites",
    icon: Layers,
    color: "teal" as const,
    description: "Advanced composite materials market research including prepregs, carbon fiber, glass fiber, and polymer matrix composites.",
    datasets: [
      {
        id: "prepregs",
        name: "Prepregs",
        dashboards: [] as { id: string; name: string; purchased: boolean }[],
      },
    ],
  },
];

// ── Auto-merge discovered dashboards ──────────────────────────

function mergeRegisteredDashboards() {
  const result = baseCategories.map(cat => ({
    ...cat,
    datasets: cat.datasets.map(ds => ({
      ...ds,
      dashboards: [...ds.dashboards],
    })),
  }));

  for (const entry of dashboardRegistry) {
    for (const cat of entry.catalogs) {
      const { categoryId, datasetId, dashboardId, dashboardName, purchased,
        categoryTitle, categoryColor, categoryDescription, datasetName } = cat;
      const name = dashboardName || entry.title;
      const isPurchased = purchased !== false;

      let category = result.find(c => c.id === categoryId);
      if (!category) {
        category = {
          id: categoryId,
          title: categoryTitle || categoryId,
          icon: Layers,
          color: (categoryColor || "teal") as any,
          description: categoryDescription || "",
          datasets: [],
        };
        result.push(category);
      }

      let ds = category.datasets.find(d => d.id === datasetId);
      if (!ds) {
        ds = { id: datasetId, name: datasetName || datasetId, dashboards: [] };
        category.datasets.push(ds);
      }

      if (!ds.dashboards.find(d => d.id === dashboardId)) {
        ds.dashboards.push({ id: dashboardId, name, purchased: isPurchased });
      }
    }
  }

  return result;
}

export const categories = mergeRegisteredDashboards();
