/**
 * Main Dashboard Page — self-contained.
 * All behavior is driven by config.ts. No shared component imports.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

import { config, TabType } from "./config";
import { useMarketData } from "./data";
import { DashboardHeader, DashboardSkeleton, ScrollToTop, MainNavigation } from "./layout";
import { MarketOverviewTab } from "./MarketOverviewTab";
import { SegmentDetailTab } from "./SegmentDetailTab";

const ThermoplasticPrepregDashboard = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(config.defaultYear);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { data: marketData, isLoading, error, refetch } = useMarketData(config.dataUrl);

  if (isLoading) return <DashboardSkeleton />;

  if (error || !marketData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Failed to Load Data</h1>
        <p className="text-muted-foreground">{error || "Unable to load market data"}</p>
        <Button onClick={refetch} className="mt-4"><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
      </div>
    );
  }

  const getSegmentInfo = () => {
    const mapping = config.segmentMapping[activeTab];
    if (!mapping) return { data: marketData.endUser, title: "End User" };
    const dataKey = mapping.dataKey as keyof typeof marketData;
    return { data: (marketData[dataKey] as any) || [], title: mapping.title };
  };

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return <MarketOverviewTab marketData={marketData} selectedYear={selectedYear} onYearChange={setSelectedYear} onNavigateToTab={setActiveTab} />;
    }
    const segmentInfo = getSegmentInfo();
    return (
      <SegmentDetailTab
        segmentType={activeTab}
        segmentData={segmentInfo.data}
        totalMarket={marketData.totalMarket}
        marketData={marketData}
        title={segmentInfo.title}
        selectedYear={selectedYear}
      />
    );
  };

  return (
    <div className="aircraft-interiors-theme min-h-screen">
      <ScrollToTop />
      <DashboardHeader title={config.title} subtitle={config.subtitle} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(config.backPath)} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
        </Button>

        <div className="mb-8">
          <MainNavigation value={activeTab} onChange={setActiveTab} selectedYear={selectedYear} onYearChange={setSelectedYear} showYearSelector tabs={config.tabs} years={marketData.years} />
        </div>

        {renderTabContent()}

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <p className="text-sm text-muted-foreground">{config.footerText}</p>
              <p className="text-xs text-muted-foreground/70">{config.footerUnit}</p>
            </div>
            <img src={stratviewLogoWhite} alt="Stratview Research" className="h-10 w-auto" />
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default ThermoplasticPrepregDashboard;
