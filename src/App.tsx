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
import AircraftInteriorsDashboard from "./pages/AircraftInteriorsDashboard";
import CabinCompositesDashboard from "./pages/CabinCompositesDashboard";
import SoftGoodsDashboard from "./pages/SoftGoodsDashboard";
import WaterWasteWaterDashboard from "./pages/WaterWasteWaterDashboard";
import GalleyMarketDashboard from "./pages/GalleyMarketDashboard";
import PSUMarketDashboard from "./pages/PSUMarketDashboard";
import LavatoryMarketDashboard from "./pages/LavatoryMarketDashboard";
import OHSBMarketDashboard from "./pages/OHSBMarketDashboard";
import StowagesMarketDashboard from "./pages/StowagesMarketDashboard";
import FloorPanelsMarketDashboard from "./pages/FloorPanelsMarketDashboard";
import CargoLinerMarketDashboard from "./pages/CargoLinerMarketDashboard";
import CabinLiningMarketDashboard from "./pages/CabinLiningMarketDashboard";
import CabinInteriorsDashboard from "./pages/CabinInteriorsDashboard";
import SandwichPanelsMarketDashboard from "./pages/SandwichPanelsMarketDashboard";
import PottedInsertsMarketDashboard from "./pages/PottedInsertsMarketDashboard";
import NonSandwichPanelCompositesDashboard from "./pages/NonSandwichPanelCompositesDashboard";
import ExtrusionMarketDashboard from "./pages/ExtrusionMarketDashboard";
import ThermoformedPartsMarketDashboard from "./pages/ThermoformedPartsMarketDashboard";
import PlasticMarketDashboard from "./pages/PlasticMarketDashboard";
import InjectionMoldingMarketDashboard from "./pages/InjectionMoldingMarketDashboard";
import ThermoformedSheetsMarketDashboard from "./pages/ThermoformedSheetsMarketDashboard";
import SeatsMarketDashboard from "./pages/SeatsMarketDashboard";
import LightingMarketDashboard from "./pages/LightingMarketDashboard";
import IFECMarketDashboard from "./pages/IFECMarketDashboard";
import ThermoplasticPrepregDashboard from "./pages/ThermoplasticPrepregDashboard";
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
