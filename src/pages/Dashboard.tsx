import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import WelcomeSection from "@/components/WelcomeSection";
import SubscriptionsSection from "@/components/SubscriptionsSection";
import DatasetList from "@/components/DatasetList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { categories } from "@/data/datasets";
import stratviewLogo from "@/assets/stratview-logo.png";

const tabs = [
  { id: "all", label: "All" },
  { id: "composites", label: "Composites" },
  { id: "aerospace-defense", label: "Aerospace & Defense" },
  { id: "automotive-transport", label: "Automotive & Transport" },
  { id: "building-construction", label: "Building & Construction" },
  { id: "prepregs", label: "Prepregs" },
  { id: "others", label: "Others" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("all");

  const totalDatasets = categories.reduce((acc, cat) => acc + cat.datasets.length, 0);
  const filteredDatasets =
    activeTab === "all"
      ? totalDatasets
      : categories.find((cat) => cat.id === activeTab)?.datasets.length || 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardHeader />
      <WelcomeSection />

      <main className="container px-4 md:px-6 py-8">
        <SubscriptionsSection />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Available Datasets
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse our comprehensive collection of market research datasets
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredDatasets} dataset{filteredDatasets !== 1 ? "s" : ""}
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <DatasetList categories={categories} activeTab={tab.id} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <img
                src={stratviewLogo}
                alt="Stratview Research"
                className="h-8 w-auto object-contain"
              />
              <span>© {new Date().getFullYear()} Stratview Research. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="mailto:support@stratviewresearch.com" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
