import { BarChart3, Globe, Layers, Beaker, Cog } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/sporting-goods-prepreg-market.json",
  title: "Sporting Goods Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Sporting Goods Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "Fiber Type", icon: Layers },
    { id: "aircraft", label: "Resin Type", icon: Beaker },
    { id: "application", label: "Form Type", icon: Cog },
    { id: "process", label: "Process Type", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "Fiber Type",
    equipment: "Equipment",
    application: "Form Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "Fiber Type" },
    aircraft:    { dataKey: "aircraftType",       title: "Resin Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Form Type" },
    process:     { dataKey: "processType",        title: "Process Type" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/sporting-goods-prepreg",
  catalog: { categoryId: "composites", datasetId: "prepregs", dashboardId: "pp-sporting-goods", datasetName: "Prepregs" },
} as const;
