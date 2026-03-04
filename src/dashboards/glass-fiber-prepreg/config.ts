import { BarChart3, Globe, Users, Layers, Beaker, Cog } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "process";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/glass-fiber-prepreg-market.json",
  title: "Glass Fiber Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Glass Fiber Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "End-Use Industry", icon: Users },
    { id: "aircraft", label: "Resin Type", icon: Beaker },
    { id: "application", label: "Prepreg Type", icon: Layers },
    { id: "process", label: "Process Type", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "End-Use Industry",
    equipment: "Equipment",
    application: "Prepreg Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "End-Use Industry" },
    aircraft:    { dataKey: "aircraftType",       title: "Resin Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Prepreg Type" },
    process:     { dataKey: "processType",        title: "Process Type" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/glass-fiber-prepreg",
  catalog: { categoryId: "composites", datasetId: "prepregs", dashboardId: "pp-glass-fiber", datasetName: "Prepregs" },
} as const;
