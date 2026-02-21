import { BarChart3, Plane, Globe, Users, Layers, Cog, Beaker } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/thermoplastic-prepreg-market.json",
  title: "Global Thermoplastic Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Global Thermoplastic Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "End-Use Industry", icon: Users },
    { id: "application", label: "Resin Type", icon: Beaker },
    { id: "equipment", label: "Product Form", icon: Layers },
    { id: "aircraft", label: "Fiber Type", icon: Plane },
    { id: "process", label: "Process Type", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "End-Use Industry",
    equipment: "Product Form",
    application: "Resin Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "End-Use Industry" },
    aircraft:    { dataKey: "aircraftType",       title: "Fiber Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Resin Type" },
    equipment:   { dataKey: "furnishedEquipment", title: "Product Form" },
    process:     { dataKey: "processType",        title: "Process Type" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/thermoplastic-prepreg",
  catalog: { categoryId: "composites", datasetId: "prepregs", dashboardId: "pp-thermoplastic", datasetName: "Prepregs" },
} as const;
