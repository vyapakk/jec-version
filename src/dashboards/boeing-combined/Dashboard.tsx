/**
 * Main Dashboard — Boeing Commercial Aircraft Orders & Deliveries.
 * Tabbed layout: Overview | Gross Orders | Deliveries | Pending Orders.
 * Each sub-tab renders the existing standalone dashboard content.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { config } from "./config";
import { useCombinedData } from "./data";
import { DashboardHeader, DashboardSkeleton, ScrollToTop } from "./layout";
import { OverviewTabContent, OverviewTabLoading, OverviewTabError } from "./OverviewTab";

// Import existing dashboards as tab content
import BoeingGrossOrdersDashboard from "@/dashboards/boeing-gross-orders/Dashboard";
import BoeingDeliveriesDashboard from "@/dashboards/boeing-deliveries/Dashboard";
import BoeingUnfulfilledOrdersDashboard from "@/dashboards/boeing-unfulfilled-orders/Dashboard";

const BoeingCombinedDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading, error, refetch } = useCombinedData(config.dataUrls);

  return (
    <div className="aircraft-interiors-theme min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <DashboardHeader title={config.title} subtitle={config.subtitle} />

      <main className="container mx-auto px-4">
        {/* Back button */}
        <div className="flex items-center gap-4 pt-6 pb-4">
          <Button variant="ghost" onClick={() => navigate(config.backPath)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-secondary/30 border border-border rounded-lg p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="gross-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">
              Gross Orders
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="pending-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">
              Pending Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isLoading ? (
              <OverviewTabLoading />
            ) : error || !data ? (
              <OverviewTabError error={error || "Unable to load data"} onRetry={refetch} />
            ) : (
              <OverviewTabContent data={data} />
            )}
          </TabsContent>

          <TabsContent value="gross-orders">
            <BoeingGrossOrdersDashboard />
          </TabsContent>

          <TabsContent value="deliveries">
            <BoeingDeliveriesDashboard />
          </TabsContent>

          <TabsContent value="pending-orders">
            <BoeingUnfulfilledOrdersDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BoeingCombinedDashboard;
