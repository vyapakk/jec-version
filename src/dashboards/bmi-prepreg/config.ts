import { BarChart3, Globe, Users, Layers, Beaker, Cog, Plane } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/bmi-prepreg-market.json",
  title: "BMI Prepreg Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "BMI Prepreg Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "End-Use Industry", icon: Users },
    { id: "application", label: "Application Type", icon: Layers },
    { id: "aircraft", label: "Reinforcement Type", icon: Plane },
    { id: "equipment", label: "Curing Type", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "End-Use Industry",
    equipment: "Curing Type",
    application: "Application Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "End-Use Industry" },
    aircraft:    { dataKey: "aircraftType",       title: "Reinforcement Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Application Type" },
    equipment:   { dataKey: "furnishedEquipment", title: "Curing Type" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/bmi-prepreg",
  catalog: { categoryId: "prepregs", datasetId: "prepregs", dashboardId: "pp-bmi" },
} as const;
