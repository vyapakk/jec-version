/**
 * Main Dashboard Page — BMI Prepreg with Value/Weight toggle.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft, DollarSign, Weight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppFooter from "@/components/AppFooter";

import { config, TabType } from "./config";
import { useMarketData, UnitContext, VALUE_UNIT, WEIGHT_UNIT } from "./data";
import { DashboardHeader, DashboardSkeleton, ScrollToTop, MainNavigation } from "./layout";
import { MarketOverviewTab } from "./MarketOverviewTab";
import { SegmentDetailTab } from "./SegmentDetailTab";

type UnitMode = "value" | "weight";

const BMIPrepregDashboard = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(config.defaultYear);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [unitMode, setUnitMode] = useState<UnitMode>("value");
  const { valueData, weightData, isLoading, error, refetch } = useMarketData(config.dataUrl);

  const unitConfig = unitMode === "value" ? VALUE_UNIT : WEIGHT_UNIT;
  const marketData = unitMode === "value" ? valueData : weightData;

  if (isLoading) return <DashboardSkeleton />;

  if (error || !valueData || !weightData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Failed to Load Data</h1>
        <p className="text-muted-foreground">{error || "Unable to load market data"}</p>
        <Button onClick={refetch} className="mt-4"><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
      </div>
    );
  }

  if (!marketData) return null;

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

  const footerUnit = unitMode === "value"
    ? "All values in US$ Million unless otherwise specified"
    : "All values in Million Lbs unless otherwise specified";

  return (
    <UnitContext.Provider value={unitConfig}>
      <div className="composites-theme min-h-screen">
        <ScrollToTop />
        <DashboardHeader title={config.title} subtitle={config.subtitle} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => navigate(config.backPath)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> {config.backLabel}
            </Button>

            {/* Unit Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5">
              <button
                onClick={() => setUnitMode("value")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  unitMode === "value"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Value (US$ M)</span>
              </button>
              <button
                onClick={() => setUnitMode("weight")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  unitMode === "weight"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Weight className="h-3.5 w-3.5" />
                <span>Weight (M Lbs)</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <MainNavigation value={activeTab} onChange={setActiveTab} selectedYear={selectedYear} onYearChange={setSelectedYear} showYearSelector tabs={config.tabs} years={marketData.years} />
          </div>

          {renderTabContent()}

          <AppFooter variant="dark" sourceText={config.footerText} unitText={footerUnit} />
        </main>
      </div>
    </UnitContext.Provider>
  );
};

export default BMIPrepregDashboard;
