/** Boeing configuration — internalized for standalone commercial-aircraft dashboard. */
export const boeingConfig = {
  dataUrls: {
    orders: "/data/boeing-gross-orders.xlsx",
    deliveries: "/data/boeing-deliveries.xlsx",
    unfulfilled: "/data/boeing-unfulfilled-orders.xlsx",
  },
} as const;
