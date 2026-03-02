/**
 * Main Dashboard — Airbus Commercial Aircraft Orders & Deliveries.
 * Tabbed layout: Orders (active) | Deliveries (placeholder) | Pending Orders (placeholder).
 */

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { config } from "./config";
import { DashboardHeader, ScrollToTop } from "./layout";
import { OrdersTab } from "./OrdersTab";
import { DeliveriesTab } from "./DeliveriesTab";
import { FleetTab } from "./FleetTab";

const AirbusCombinedDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="aircraft-interiors-theme min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <DashboardHeader title={config.title} subtitle={config.subtitle} />

      <main className="container mx-auto px-4">
        <div className="flex items-center gap-4 pt-6 pb-4">
          <Button variant="ghost" onClick={() => navigate(config.backPath)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-secondary/30 border border-border rounded-lg p-1 h-auto flex-wrap">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Orders</TabsTrigger>
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Deliveries</TabsTrigger>
            <TabsTrigger value="fleet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Airline Orders, Deliveries & Fleet</TabsTrigger>
            <TabsTrigger value="pending-orders" disabled className="text-muted-foreground/50 px-4 py-2 text-sm font-medium cursor-not-allowed">Pending Orders (Coming Soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="deliveries"><DeliveriesTab /></TabsContent>
          <TabsContent value="fleet"><FleetTab /></TabsContent>
          <TabsContent value="pending-orders"><div className="py-20 text-center text-muted-foreground">Pending Orders tab coming soon.</div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AirbusCombinedDashboard;
