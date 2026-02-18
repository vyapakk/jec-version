import { BarChart3, Globe, Users, Layers, Beaker, Cog } from "lucide-react";

export type TabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";
export interface TabConfig { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; }

export const config = {
  dataUrl: "/data/polymer-space-composite-matrix-market.json",
  title: "Polymer Space Composite Matrix Market",
  subtitle: "Global Market Research Dashboard",
  defaultYear: 2025, useMillions: true,
  footerText: "Polymer Space Composite Matrix Market Research Report",
  footerUnit: "All values in US$ Million unless otherwise specified",
  backPath: "/dataset/prepregs", backLabel: "Back to Prepregs",
  tabs: [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "endUser", label: "Application", icon: Users },
    { id: "aircraft", label: "Resin Type", icon: Beaker },
    { id: "application", label: "Fiber Type", icon: Layers },
    { id: "equipment", label: "Component", icon: Cog },
    { id: "region", label: "Region", icon: Globe },
  ] as TabConfig[],
  labels: {
    endUser: "Application",
    equipment: "Component",
    application: "Fiber Type",
    processType: "Process Type",
    materialType: "Material Type",
  },
  segmentMapping: {
    endUser:     { dataKey: "endUser",            title: "Application" },
    aircraft:    { dataKey: "aircraftType",       title: "Resin Type" },
    region:      { dataKey: "region",             title: "Region" },
    application: { dataKey: "application",        title: "Fiber Type" },
    equipment:   { dataKey: "furnishedEquipment", title: "Component" },
  } as Record<string, { dataKey: string; title: string }>,
  routePath: "/dashboard/polymer-space-composite",
  catalog: { categoryId: "prepregs", datasetId: "prepregs", dashboardId: "pp-pscm" },
} as const;
