import { BarChart3, Globe, Users, Layers, Beaker, Cog, Package } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/global-prepreg-market.json",
  title: "Global Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Global Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "End-Use Industry", icon: Users },
    { id: "aircraft", label: "Resin Type", icon: Beaker },
    { id: "application", label: "Fiber Type", icon: Layers },
    { id: "equipment", label: "Form Type", icon: Package },
    { id: "process", label: "Process Type", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "End-Use Industry",
    equipment: "Form Type",
    application: "Fiber Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "End-Use Industry" },
    aircraft:    { dataKey: "aircraftType",       title: "Resin Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Fiber Type" },
    equipment:   { dataKey: "furnishedEquipment", title: "Form Type" },
    process:     { dataKey: "processType",        title: "Process Type" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/global-prepreg",
  catalog: { categoryId: "composites", datasetId: "prepregs", dashboardId: "pp-global", datasetName: "Prepregs" },
} as const;
