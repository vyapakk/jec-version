export const config = {
  dataUrl: "/data/airbus-orders.xlsx",
  title: "Airbus Commercial Aircraft Orders & Deliveries",
  subtitle: "Comprehensive Orders, Deliveries & Backlog Dashboard",
  routePath: "/dashboard/airbus-combined",
  backPath: "/dataset/aircraft-orders-deliveries",
  backLabel: "Back to Aircraft Orders & Deliveries",
  catalog: {
    categoryId: "aerospace-defense",
    datasetId: "aircraft-orders-deliveries",
    dashboardId: "airbus-combined",
    dashboardName: "Airbus Commercial Aircraft Orders & Deliveries",
  },
} as const;
