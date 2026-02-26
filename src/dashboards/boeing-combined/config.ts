export const config = {
  dataUrls: {
    orders: "/data/boeing-gross-orders.xlsx",
    deliveries: "/data/boeing-deliveries.xlsx",
    unfulfilled: "/data/boeing-unfulfilled-orders.xlsx",
  },
  title: "Boeing Commercial Aircraft Orders & Deliveries",
  subtitle: "Comprehensive Orders, Deliveries & Backlog Dashboard",
  defaultYear: 2024,
  routePath: "/dashboard/boeing-combined",
  backPath: "/dataset/aircraft-orders-deliveries",
  backLabel: "Back to Aircraft Orders & Deliveries",
  catalog: {
    categoryId: "aerospace-defense",
    datasetId: "aircraft-orders-deliveries",
    dashboardId: "boeing-combined",
    dashboardName: "Boeing Commercial Aircraft Orders & Deliveries",
  },
} as const;
