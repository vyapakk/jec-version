export const config = {
  dataUrl: "/data/boeing-unfulfilled-orders.xlsx",
  title: "Boeing Unfulfilled Orders",
  subtitle: "Current Backlog of Pending Aircraft Orders",
  routePath: "/dashboard/boeing-unfulfilled-orders",
  backPath: "/dataset/aircraft-orders-deliveries",
  backLabel: "Back to Aircraft Orders & Deliveries",
  catalog: {
    categoryId: "aerospace-defense",
    datasetId: "aircraft-orders-deliveries",
    dashboardId: "boeing-unfulfilled-orders",
    dashboardName: "Boeing Unfulfilled Orders",
  },
} as const;
