/**
 * Main Dashboard — Boeing Commercial Aircraft Orders & Deliveries.
 * Fully standalone — no imports from sibling dashboard folders.
 * Tabbed layout: Overview | Gross Orders | Deliveries | Pending Orders.
 */

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { config } from "./config";
import { useCombinedData } from "./data";
import { DashboardHeader, ScrollToTop } from "./layout";
import { OverviewTabContent, OverviewTabLoading, OverviewTabError } from "./OverviewTab";
import { GrossOrdersTab } from "./GrossOrdersTab";
import { DeliveriesTab } from "./DeliveriesTab";
import { PendingOrdersTab } from "./PendingOrdersTab";

const BoeingCombinedDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading, error, refetch } = useCombinedData(config.dataUrls);

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
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Overview</TabsTrigger>
            <TabsTrigger value="gross-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Gross Orders</TabsTrigger>
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Deliveries</TabsTrigger>
            <TabsTrigger value="pending-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Pending Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isLoading ? <OverviewTabLoading /> : error || !data ? <OverviewTabError error={error || "Unable to load data"} onRetry={refetch} /> : <OverviewTabContent data={data} onTabChange={setActiveTab} />}
          </TabsContent>
          <TabsContent value="gross-orders"><GrossOrdersTab /></TabsContent>
          <TabsContent value="deliveries"><DeliveriesTab /></TabsContent>
          <TabsContent value="pending-orders"><PendingOrdersTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BoeingCombinedDashboard;
