/**
 * Commercial Aircraft Orders & Deliveries — Combined Dashboard.
 * 100% STANDALONE. Zero imports from airbus-combined/ or boeing-combined/.
 * All components are internalized within this folder.
 */

import { useState } from "react";
import { ArrowLeft, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { config } from "./config";
import { boeingConfig } from "./boeing-config";
import { DashboardHeader, ScrollToTop } from "./layout";

// ── Airbus tab components (internalized) ──
import { AirbusOverviewTab } from "./airbus-OverviewTab";
import { AirbusOrdersTab } from "./airbus-OrdersTab";
import { AirbusDeliveriesTab } from "./airbus-DeliveriesTab";
import { AirbusFleetTab } from "./airbus-FleetTab";

// ── Boeing tab components (internalized) ──
import { BoeingOverviewContent, BoeingOverviewLoading, BoeingOverviewError } from "./boeing-OverviewTab";
import { BoeingGrossOrdersTab } from "./boeing-GrossOrdersTab";
import { BoeingDeliveriesTab } from "./boeing-DeliveriesTab";
import { BoeingPendingOrdersTab } from "./boeing-PendingOrdersTab";
import { useCombinedData } from "./boeing-data";

/* ------------------------------------------------------------------ */

function AirbusSection() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start bg-secondary/30 border border-border rounded-lg p-1 h-auto flex-wrap">
        <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Overview</TabsTrigger>
        <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Orders</TabsTrigger>
        <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Deliveries</TabsTrigger>
        <TabsTrigger value="fleet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Airline Orders, Deliveries & Fleet</TabsTrigger>
        <TabsTrigger value="pending-orders" disabled className="text-muted-foreground/50 px-4 py-2 text-sm font-medium cursor-not-allowed">Pending Orders (Coming Soon)</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><AirbusOverviewTab onTabChange={setActiveTab} /></TabsContent>
      <TabsContent value="orders"><AirbusOrdersTab /></TabsContent>
      <TabsContent value="deliveries"><AirbusDeliveriesTab /></TabsContent>
      <TabsContent value="fleet"><AirbusFleetTab /></TabsContent>
      <TabsContent value="pending-orders"><div className="py-20 text-center text-muted-foreground">Pending Orders tab coming soon.</div></TabsContent>
    </Tabs>
  );
}

function BoeingSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading, error, refetch } = useCombinedData(boeingConfig.dataUrls);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start bg-secondary/30 border border-border rounded-lg p-1 h-auto flex-wrap">
        <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Overview</TabsTrigger>
        <TabsTrigger value="gross-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Orders</TabsTrigger>
        <TabsTrigger value="deliveries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Deliveries</TabsTrigger>
        <TabsTrigger value="pending-orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm font-medium">Pending Orders</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {isLoading ? <BoeingOverviewLoading /> : error || !data ? <BoeingOverviewError error={error || "Unable to load data"} onRetry={refetch} /> : <BoeingOverviewContent data={data} onTabChange={setActiveTab} />}
      </TabsContent>
      <TabsContent value="gross-orders"><BoeingGrossOrdersTab /></TabsContent>
      <TabsContent value="deliveries"><BoeingDeliveriesTab /></TabsContent>
      <TabsContent value="pending-orders"><BoeingPendingOrdersTab /></TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ */

const CommercialAircraftDashboard = () => {
  const navigate = useNavigate();
  const [selectedOEM, setSelectedOEM] = useState("airbus");

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

        {/* ── OEM Selector ── */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedOEM("airbus")}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold border-2 transition-all duration-200
                ${selectedOEM === "airbus"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }
              `}
            >
              <Plane className="h-5 w-5" />
              Airbus
            </button>
            <button
              onClick={() => setSelectedOEM("boeing")}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold border-2 transition-all duration-200
                ${selectedOEM === "boeing"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }
              `}
            >
              <Plane className="h-5 w-5 -scale-x-100" />
              Boeing
            </button>
          </div>
        </div>

        {/* ── OEM Dashboard Content ── */}
        {selectedOEM === "airbus" ? <AirbusSection /> : <BoeingSection />}
      </main>
    </div>
  );
};

export default CommercialAircraftDashboard;
