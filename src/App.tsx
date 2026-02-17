import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouteScrollToTop } from "@/components/RouteScrollToTop";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DatasetDetail from "./pages/DatasetDetail";
import AircraftInteriorsDashboard from "./dashboards/aircraft-interiors/Dashboard";
import CabinCompositesDashboard from "./dashboards/cabin-composites/Dashboard";
import SoftGoodsDashboard from "./dashboards/soft-goods/Dashboard";
import WaterWasteWaterDashboard from "./dashboards/water-waste-water/Dashboard";
import GalleyMarketDashboard from "./dashboards/galley-market/Dashboard";
import PSUMarketDashboard from "./dashboards/psu-market/Dashboard";
import LavatoryMarketDashboard from "./dashboards/lavatory-market/Dashboard";
import OHSBMarketDashboard from "./dashboards/ohsb-market/Dashboard";
import StowagesMarketDashboard from "./dashboards/stowages-market/Dashboard";
import FloorPanelsMarketDashboard from "./dashboards/floor-panels-market/Dashboard";
import CargoLinerMarketDashboard from "./dashboards/cargo-liner-market/Dashboard";
import CabinLiningMarketDashboard from "./dashboards/cabin-lining-market/Dashboard";
import CabinInteriorsDashboard from "./dashboards/cabin-interiors-market/Dashboard";
import SandwichPanelsMarketDashboard from "./dashboards/sandwich-panels-market/Dashboard";
import PottedInsertsMarketDashboard from "./dashboards/potted-inserts-market/Dashboard";
import NonSandwichPanelCompositesDashboard from "./dashboards/non-sandwich-panel-composites/Dashboard";
import ExtrusionMarketDashboard from "./dashboards/extrusion-market/Dashboard";
import ThermoformedPartsMarketDashboard from "./dashboards/thermoformed-parts-market/Dashboard";
import PlasticMarketDashboard from "./dashboards/plastic-market/Dashboard";
import InjectionMoldingMarketDashboard from "./dashboards/injection-molding-market/Dashboard";
import ThermoformedSheetsMarketDashboard from "./dashboards/thermoformed-sheets-market/Dashboard";
import SeatsMarketDashboard from "./dashboards/seats-market/Dashboard";
import LightingMarketDashboard from "./dashboards/lighting-market/Dashboard";
import IFECMarketDashboard from "./dashboards/ifec-market/Dashboard";
import ThermoplasticPrepregDashboard from "./dashboards/thermoplastic-prepreg/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dataset/:datasetId" element={<DatasetDetail />} />
          <Route path="/dashboard/aircraft-interiors" element={<AircraftInteriorsDashboard />} />
          <Route path="/dashboard/cabin-composites" element={<CabinCompositesDashboard />} />
          <Route path="/dashboard/soft-goods" element={<SoftGoodsDashboard />} />
          <Route path="/dashboard/water-waste-water" element={<WaterWasteWaterDashboard />} />
          <Route path="/dashboard/galley-market" element={<GalleyMarketDashboard />} />
          <Route path="/dashboard/psu-market" element={<PSUMarketDashboard />} />
          <Route path="/dashboard/lavatory-market" element={<LavatoryMarketDashboard />} />
          <Route path="/dashboard/ohsb-market" element={<OHSBMarketDashboard />} />
          <Route path="/dashboard/stowages-market" element={<StowagesMarketDashboard />} />
          <Route path="/dashboard/floor-panels-market" element={<FloorPanelsMarketDashboard />} />
          <Route path="/dashboard/cargo-liner-market" element={<CargoLinerMarketDashboard />} />
          <Route path="/dashboard/cabin-lining-market" element={<CabinLiningMarketDashboard />} />
          <Route path="/dashboard/cabin-interiors-market" element={<CabinInteriorsDashboard />} />
          <Route path="/dashboard/sandwich-panels-market" element={<SandwichPanelsMarketDashboard />} />
          <Route path="/dashboard/potted-inserts-market" element={<PottedInsertsMarketDashboard />} />
          <Route path="/dashboard/non-sandwich-panel-composites-market" element={<NonSandwichPanelCompositesDashboard />} />
          <Route path="/dashboard/extrusion-market" element={<ExtrusionMarketDashboard />} />
          <Route path="/dashboard/thermoformed-parts-market" element={<ThermoformedPartsMarketDashboard />} />
          <Route path="/dashboard/plastic-market" element={<PlasticMarketDashboard />} />
          <Route path="/dashboard/injection-molding-market" element={<InjectionMoldingMarketDashboard />} />
          <Route path="/dashboard/thermoformed-sheets-market" element={<ThermoformedSheetsMarketDashboard />} />
          <Route path="/dashboard/seats-market" element={<SeatsMarketDashboard />} />
          <Route path="/dashboard/lighting-market" element={<LightingMarketDashboard />} />
          <Route path="/dashboard/ifec-market" element={<IFECMarketDashboard />} />
          <Route path="/dashboard/thermoplastic-prepreg-market" element={<ThermoplasticPrepregDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
