import { BarChart3, Globe, Users, Layers, Beaker, Cog, Plane, ShoppingCart } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/aircraft-interiors-prepreg-market.json",
  title: "Aircraft Interiors Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Aircraft Interiors Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "Application Type", icon: Layers },
    { id: "aircraft", label: "Resin Type", icon: Beaker },
    { id: "application", label: "Sub-Resin Type", icon: Beaker },
    { id: "equipment", label: "Fiber Type", icon: Plane },
    { id: "process", label: "Form Type", icon: Cog },
    { id: "material", label: "OEM", icon: Users },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "Application Type",
    equipment: "Fiber Type",
    application: "Sub-Resin Type",
    processType: "Form Type",
    materialType: "OEM",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "Application Type" },
    aircraft:    { dataKey: "aircraftType",       title: "Resin Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Sub-Resin Type" },
    equipment:   { dataKey: "furnishedEquipment", title: "Fiber Type" },
    process:     { dataKey: "processType",        title: "Form Type" },
    material:    { dataKey: "materialType",       title: "OEM" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/interiors-prepreg",
  catalog: { categoryId: "composites", datasetId: "prepregs", dashboardId: "pp-interiors", datasetName: "Prepregs" },
} as const;
