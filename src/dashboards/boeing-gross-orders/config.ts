import { BarChart3 } from "lucide-react";

export const config = {
  dataUrl: "/data/boeing-gross-orders.xlsx",
  title: "Boeing Gross Orders",
  subtitle: "Historical Aircraft Orders Dashboard",
  defaultYear: 2024,
  routePath: "/dashboard/boeing-gross-orders",
  backPath: "/dataset/aircraft-orders-deliveries",
  backLabel: "Back to Aircraft Orders & Deliveries",
  catalog: {
    categoryId: "aerospace-defense",
    datasetId: "aircraft-orders-deliveries",
    dashboardId: "boeing-gross-orders",
    dashboardName: "Boeing Gross Orders",
  },
} as const;
