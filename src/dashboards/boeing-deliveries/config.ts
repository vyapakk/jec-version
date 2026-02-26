export const config = {
  dataUrl: "/data/boeing-deliveries.xlsx",
  title: "Boeing Deliveries",
  subtitle: "Historical Aircraft Deliveries Dashboard",
  defaultYear: 2024,
  routePath: "/dashboard/boeing-deliveries",
  backPath: "/dataset/aircraft-orders-deliveries",
  backLabel: "Back to Aircraft Orders & Deliveries",
  catalog: {
    categoryId: "aerospace-defense",
    datasetId: "aircraft-orders-deliveries",
    dashboardId: "boeing-deliveries",
    dashboardName: "Boeing Deliveries",
  },
} as const;
