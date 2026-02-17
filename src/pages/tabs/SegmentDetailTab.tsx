import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/aircraft-interiors/KPICard";
import { MarketTrendChart } from "@/components/aircraft-interiors/MarketTrendChart";
import { SegmentPieChart } from "@/components/aircraft-interiors/SegmentPieChart";

import { ComparisonTable } from "@/components/aircraft-interiors/ComparisonTable";
import { DrillDownModal } from "@/components/aircraft-interiors/DrillDownModal";
import { StackedBarChart } from "@/components/aircraft-interiors/StackedBarChart";
import { useDrillDown } from "@/hooks/useDrillDown";
import { YearlyData, SegmentData, MarketData, calculateCAGR } from "@/hooks/useMarketData";

type SegmentType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment" | "process" | "material";

interface SegmentDetailTabProps {
  segmentType: SegmentType;
  segmentData: SegmentData[];
  totalMarket: YearlyData[];
  marketData: MarketData;
  title: string;
  selectedYear: number;
  endUserLabel?: string;
  equipmentLabel?: string;
  applicationLabel?: string;
  processTypeLabel?: string;
  materialTypeLabel?: string;
  useMillions?: boolean;
}

export function SegmentDetailTab({
  segmentType,
  segmentData,
  totalMarket,
  marketData,
  title,
  selectedYear,
  endUserLabel = "End User",
  equipmentLabel = "Equipment Type",
  applicationLabel = "Application",
  processTypeLabel = "Process Type",
  materialTypeLabel = "Material Type",
  useMillions = false,
}: SegmentDetailTabProps) {
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();

  // Calculate KPI values
  const currentYearTotal = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === selectedYear)?.value ?? 0;
    return sum + value;
  }, 0);

  const firstYear = marketData.years[0];
  const lastYear = marketData.years[marketData.years.length - 1];

  const valueFirstTotal = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === firstYear)?.value ?? 0;
    return sum + value;
  }, 0);

  const valueLastTotal = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === lastYear)?.value ?? 0;
    return sum + value;
  }, 0);

  const cagr = calculateCAGR(valueFirstTotal, valueLastTotal, lastYear - firstYear);

  const SEGMENT_COLORS = [
    "hsl(192, 95%, 55%)",
    "hsl(38, 92%, 55%)",
    "hsl(262, 83%, 58%)",
    "hsl(142, 71%, 45%)",
    "hsl(346, 77%, 50%)",
    "hsl(199, 89%, 48%)",
    "hsl(28, 80%, 52%)",
    "hsl(180, 70%, 45%)",
  ];

  // Segment name arrays for reuse
  const aircraftTypeNames = marketData.aircraftType.map((s) => s.name);
  const regionNames = marketData.region.map((s) => s.name);
  const applicationNames = marketData.application.map((s) => s.name);
  const equipmentNames = marketData.furnishedEquipment.map((s) => s.name);
  const endUserNames = marketData.endUser.map((s) => s.name);
  const processTypeNames = marketData.processType?.map((s) => s.name) || [];
  const materialTypeNames = marketData.materialType?.map((s) => s.name) || [];

  // Get all countries from all regions
  const getAllCountries = (): SegmentData[] => {
    const allCountries: SegmentData[] = [];
    Object.values(marketData.countryDataByRegion).forEach((countries) => {
      allCountries.push(...countries);
    });
    return allCountries;
  };

  // End User by Aircraft Type - uses direct data
  const getEndUserByAircraftTypeData = () => {
    if (!marketData.endUserByAircraftType || Object.keys(marketData.endUserByAircraftType).length === 0) return [];
    
    return Object.keys(marketData.endUserByAircraftType).map((endUserKey) => {
      const segments = marketData.endUserByAircraftType[endUserKey] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: endUserKey,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // End User by Region - uses direct data
  const getEndUserByRegionData = () => {
    if (!marketData.endUserByRegion) return [];
    
    return Object.keys(marketData.endUserByRegion).map((endUserKey) => {
      const segments = marketData.endUserByRegion[endUserKey] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: endUserKey,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Aircraft Type by Region - uses direct data
  const getAircraftByRegionData = () => {
    if (!marketData.aircraftTypeByRegion) return [];
    
    return marketData.aircraftType.map((aircraft) => {
      const segments = marketData.aircraftTypeByRegion[aircraft.name] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: aircraft.name,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Application by Region - uses direct data
  const getApplicationByRegionData = () => {
    if (!marketData.applicationByRegion) return [];
    
    return marketData.application.map((app) => {
      const segments = marketData.applicationByRegion[app.name] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: app.name,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Equipment by Region - uses direct data (supports both short keys like BFE/SFE and full names)
  const getEquipmentByRegionData = () => {
    if (!marketData.equipmentByRegion) return [];
    
    return marketData.furnishedEquipment.map((equip) => {
      // Try full name first, then BFE/SFE shortname for backward compatibility
      let segments = marketData.equipmentByRegion[equip.name];
      if (!segments) {
        const shortName = equip.name.includes("BFE") ? "BFE" : equip.name.includes("SFE") ? "SFE" : equip.name;
        segments = marketData.equipmentByRegion[shortName] || [];
      }
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: equip.name,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Process Type by Region
  const getProcessTypeByRegionData = () => {
    if (!marketData.processType || !marketData.processTypeByRegion) return [];
    
    return marketData.processType.map((pt) => {
      const segments = marketData.processTypeByRegion?.[pt.name] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: pt.name,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Material Type by Region
  const getMaterialTypeByRegionData = () => {
    if (!marketData.materialType || !marketData.materialTypeByRegion) return [];
    
    return marketData.materialType.map((mt) => {
      const segments = marketData.materialTypeByRegion?.[mt.name] || [];
      const total = segments.reduce((sum, seg) => {
        return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
      }, 0);

      return {
        name: mt.name,
        segments: segments.map((seg) => ({
          name: seg.name,
          value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
          fullData: seg.data,
        })),
        total,
      };
    });
  };

  // Prepare stacked bar data using direct JSON data
  const aircraftTypeStackedData = segmentType === "endUser" ? getEndUserByAircraftTypeData() : [];
  const regionStackedDataForEndUser = segmentType === "endUser" ? getEndUserByRegionData() : [];

  const aircraftByRegionData = segmentType === "aircraft" ? getAircraftByRegionData() : [];
  const aircraftByEndUserData = segmentType === "aircraft" && Object.keys(marketData.endUserByAircraftType || {}).length > 0
    ? marketData.aircraftType.map((aircraft) => {
        const segments = endUserNames.map((euName) => {
          const euData = marketData.endUserByAircraftType?.[euName]?.find(s => s.name === aircraft.name);
          const value = euData?.data.find(d => d.year === selectedYear)?.value ?? 0;
          return { name: euName, value, fullData: euData?.data || [] };
        });
        return {
          name: aircraft.name,
          segments,
          total: segments.reduce((s, seg) => s + seg.value, 0),
        };
      })
    : [];

  // For region charts
  const regionByAircraftData = segmentType === "region" ? marketData.region.map((region) => {
    const segments = marketData.aircraftType.map((aircraft) => {
      const aircraftRegionData = marketData.aircraftTypeByRegion?.[aircraft.name]?.find(r => r.name === region.name);
      const value = aircraftRegionData?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: aircraft.name, value, fullData: aircraftRegionData?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByApplicationData = (segmentType === "region" && marketData.application.length > 0 && marketData.applicationByRegion && Object.keys(marketData.applicationByRegion).length > 0) ? marketData.region.map((region) => {
    const segments = marketData.application.map((app) => {
      const appRegionData = marketData.applicationByRegion?.[app.name]?.find(r => r.name === region.name);
      const value = appRegionData?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: app.name, value, fullData: appRegionData?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByEndUserData = segmentType === "region" ? marketData.region.map((region) => {
    const segments = endUserNames.map((euName) => {
      const euRegionData = marketData.endUserByRegion?.[euName]?.find(r => r.name === region.name);
      const value = euRegionData?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: euName, value, fullData: euRegionData?.data || [] };
    });
    return {
      name: region.name,
      segments,
      total: segments.reduce((s, seg) => s + seg.value, 0),
    };
  }) : [];

  const regionByEquipmentData = segmentType === "region" ? marketData.region.map((region) => {
    const equipSegments = marketData.furnishedEquipment.map((equip) => {
      let equipRegionEntries = marketData.equipmentByRegion?.[equip.name];
      if (!equipRegionEntries) {
        const shortName = equip.name.includes("BFE") ? "BFE" : equip.name.includes("SFE") ? "SFE" : equip.name;
        equipRegionEntries = marketData.equipmentByRegion?.[shortName];
      }
      const regionEntry = equipRegionEntries?.find(r => r.name === region.name);
      const value = regionEntry?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: equip.name, value, fullData: regionEntry?.data || [] };
    });
    return {
      name: region.name,
      segments: equipSegments,
      total: equipSegments.reduce((s, seg) => s + seg.value, 0),
    };
  }) : [];

  const regionByProcessData = segmentType === "region" && marketData.processType ? marketData.region.map((region) => {
    const segments = (marketData.processType || []).map((pt) => {
      const ptRegionData = marketData.processTypeByRegion?.[pt.name]?.find(r => r.name === region.name);
      const value = ptRegionData?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: pt.name, value, fullData: ptRegionData?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const applicationByRegionData = segmentType === "application" ? getApplicationByRegionData() : [];

  const equipmentByRegionData = segmentType === "equipment" ? getEquipmentByRegionData() : [];

  const processTypeByRegionData = segmentType === "process" ? getProcessTypeByRegionData() : [];

  const processTypeByApplicationData = segmentType === "process" && marketData.processTypeByApplication
    ? (marketData.processType || []).map((pt) => {
        const segments = marketData.processTypeByApplication?.[pt.name] || [];
        const total = segments.reduce((sum, seg) => {
          return sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0);
        }, 0);
        return {
          name: pt.name,
          segments: segments.map((seg) => ({
            name: seg.name,
            value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0,
            fullData: seg.data,
          })),
          total,
        };
      })
    : [];

  const processTypeApplicationNames = segmentType === "process" && marketData.processTypeByApplication
    ? [...new Set(
        Object.values(marketData.processTypeByApplication).flatMap(segments => segments.map(s => s.name))
      )]
    : [];

  const materialTypeByRegionData = segmentType === "material" ? getMaterialTypeByRegionData() : [];

  const regionByMaterialData = segmentType === "region" && marketData.materialType ? marketData.region.map((region) => {
    const segments = (marketData.materialType || []).map((mt) => {
      const mtRegionData = marketData.materialTypeByRegion?.[mt.name]?.find(r => r.name === region.name);
      const value = mtRegionData?.data.find(d => d.year === selectedYear)?.value ?? 0;
      return { name: mt.name, value, fullData: mtRegionData?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const allCountries = segmentType === "region" ? getAllCountries() : [];

  // Get related segments for drill-down
  const getRelatedSegmentsForDrillDown = (segmentName: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[segmentName]) {
      return { title: `Countries in ${segmentName}`, data: marketData.countryDataByRegion[segmentName] };
    }
    if (segmentType === "aircraft") {
      return { title: "Applications for this Aircraft Type", data: marketData.application };
    }
    if (segmentType === "endUser") {
      return { title: "Regions for this End User", data: marketData.region };
    }
    if (segmentType === "application") {
      return { title: "Aircraft Types by Application", data: marketData.aircraftType };
    }
    if (segmentType === "equipment") {
      let regionalData = marketData.equipmentByRegion?.[segmentName];
      if (!regionalData) {
        const shortName = segmentName.includes("BFE") ? "BFE" : segmentName.includes("SFE") ? "SFE" : segmentName;
        regionalData = marketData.equipmentByRegion?.[shortName];
      }
      if (regionalData) {
        return { title: `Regions for ${segmentName}`, data: regionalData };
      }
      return { title: "Regions", data: marketData.region };
    }
    if (segmentType === "process") {
      const processRegionData = marketData.processTypeByRegion?.[segmentName];
      if (processRegionData) {
        return { title: `Regions for ${segmentName}`, data: processRegionData };
      }
      return { title: "Regions", data: marketData.region };
    }
    if (segmentType === "material") {
      const materialRegionData = marketData.materialTypeByRegion?.[segmentName];
      if (materialRegionData) {
        return { title: `Regions for ${segmentName}`, data: materialRegionData };
      }
      return { title: "Regions", data: marketData.region };
    }
    return undefined;
  };

  // Handle drill-down for pie chart segments
  const handlePieSegmentClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for bar chart
  const handleBarClick = (segmentName: string, data: YearlyData[], color: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[segmentName]) {
      openDrillDown(segmentName, data, color, { title: `Countries in ${segmentName}`, data: marketData.countryDataByRegion[segmentName] });
    } else {
      openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
    }
  };

  // Handle drill-down for trend chart legend
  const handleTrendSegmentClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for comparison table rows
  const handleTableRowClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for stacked bar chart
  const handleStackedBarClick = (
    endUserType: string,
    segmentName: string,
    value: number,
    color: string,
    fullData?: YearlyData[]
  ) => {
    const displayName = `${segmentName} (${endUserType})`;
    if (fullData) {
      openDrillDown(displayName, fullData, color, undefined);
    }
  };

  // All segment tabs hide KPI cards
  const hideKPIs = segmentType === "endUser" || segmentType === "aircraft" || segmentType === "region" || segmentType === "application" || segmentType === "equipment" || segmentType === "process" || segmentType === "material";

  return (
    <div className="space-y-8">
      {/* KPI Cards - Hidden for specialized tabs */}
      {!hideKPIs && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard
            title={`${selectedYear} Market Size`}
            value={useMillions ? currentYearTotal : currentYearTotal / 1000}
            suffix={useMillions ? "M" : "B"}
            icon={DollarSign}
            delay={0}
            accentColor="primary"
          />
          <KPICard
            title={`CAGR (${firstYear}-${lastYear})`}
            value={cagr}
            prefix=""
            suffix="%"
            icon={BarChart3}
            delay={0.1}
            accentColor="chart-4"
          />
          <KPICard
            title={`${lastYear} Forecast`}
            value={useMillions ? valueLastTotal : valueLastTotal / 1000}
            suffix={useMillions ? "M" : "B"}
            icon={TrendingUp}
            delay={0.2}
            accentColor="accent"
          />
        </div>
      )}

      {/* Main Charts Row */}
      {segmentData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MarketTrendChart
              data={totalMarket}
              segments={segmentData}
              title={`${title} - Market Trend`}
              subtitle="Historical and forecast data (US$ Millions) - Click legend to drill down"
              showSegments
              onSegmentClick={handleTrendSegmentClick}
              useMillions={useMillions}
            />
          </div>
          <SegmentPieChart
            data={segmentData}
            year={selectedYear}
            title={title}
            onSegmentClick={handlePieSegmentClick}
          />
        </div>
      )}

      {/* Region Tab: Country Line Chart */}
      {segmentType === "region" && allCountries.length > 0 && (
        <MarketTrendChart
          data={totalMarket}
          segments={allCountries}
          title="Countries - Market Trend"
          subtitle="All countries historical and forecast data (US$ Millions)"
          showSegments
          onSegmentClick={handleTrendSegmentClick}
          useMillions={useMillions}
        />
      )}

      {/* End User Specific: Stacked Bar Charts */}
      {segmentType === "endUser" && (
        <>
          {aircraftTypeStackedData.length > 0 && aircraftTypeStackedData.some(d => d.total > 0) && (
            <StackedBarChart
              data={aircraftTypeStackedData}
              year={selectedYear}
              title={`OE vs Aftermarket by Aircraft Type`}
              subtitle={`${selectedYear} breakdown - bars represent ${endUserLabel.toLowerCase()} segments, stacks show aircraft types`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={aircraftTypeNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {regionStackedDataForEndUser.length > 0 && regionStackedDataForEndUser.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionStackedDataForEndUser}
              year={selectedYear}
              title={`${endUserLabel} by Region`}
              subtitle={`${selectedYear} breakdown - bars represent ${endUserLabel.toLowerCase()} segments, stacks show regions`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={regionNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
        </>
      )}

      {/* Aircraft Type Specific: Stacked Bar Charts */}
      {segmentType === "aircraft" && (
        <>
          {aircraftByRegionData.length > 0 && aircraftByRegionData.some(d => d.total > 0) && (
            <StackedBarChart
              data={aircraftByRegionData}
              year={selectedYear}
              title="Aircraft Type by Region"
              subtitle={`${selectedYear} breakdown - bars represent aircraft types, stacks show regions`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={regionNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {aircraftByEndUserData.length > 0 && aircraftByEndUserData.some(d => d.total > 0) && (
            <StackedBarChart
              data={aircraftByEndUserData}
              year={selectedYear}
              title={`Aircraft Type by ${endUserLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent aircraft types, stacks show ${endUserLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={endUserNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
        </>
      )}

      {/* Region Specific: Stacked Bar Charts */}
      {segmentType === "region" && (
        <>
          {regionByAircraftData.length > 0 && regionByAircraftData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByAircraftData}
              year={selectedYear}
              title="Region by Aircraft Type"
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show aircraft types`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={aircraftTypeNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {regionByApplicationData.length > 0 && regionByApplicationData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByApplicationData}
              year={selectedYear}
              title={`Region by ${applicationLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show ${applicationLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={applicationNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {regionByEndUserData.length > 0 && regionByEndUserData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByEndUserData}
              year={selectedYear}
              title={`Region by ${endUserLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show ${endUserLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={endUserNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {regionByEquipmentData.length > 0 && regionByEquipmentData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByEquipmentData}
              year={selectedYear}
              title={`Region by ${equipmentLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show ${equipmentLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={equipmentNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
          {regionByProcessData.length > 0 && regionByProcessData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByProcessData}
              year={selectedYear}
              title={`Region by ${processTypeLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show ${processTypeLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={processTypeNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
           />
          )}
          {regionByMaterialData.length > 0 && regionByMaterialData.some(d => d.total > 0) && (
            <StackedBarChart
              data={regionByMaterialData}
              year={selectedYear}
              title={`Region by ${materialTypeLabel}`}
              subtitle={`${selectedYear} breakdown - bars represent regions, stacks show ${materialTypeLabel.toLowerCase()}`}
              segmentColors={SEGMENT_COLORS}
              segmentNames={materialTypeNames}
              onSegmentClick={handleStackedBarClick}
              useMillions={useMillions}
            />
          )}
        </>
      )}

      {/* Application Specific: Stacked Bar Charts */}
      {segmentType === "application" && applicationByRegionData.length > 0 && applicationByRegionData.some(d => d.total > 0) && (
        <StackedBarChart
          data={applicationByRegionData}
          year={selectedYear}
          title={`${applicationLabel} by Region`}
          subtitle={`${selectedYear} breakdown - bars represent ${applicationLabel.toLowerCase()}, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
          useMillions={useMillions}
        />
      )}

      {/* Equipment Specific: Stacked Bar Charts */}
      {segmentType === "equipment" && equipmentByRegionData.length > 0 && equipmentByRegionData.some(d => d.total > 0) && (
        <StackedBarChart
          data={equipmentByRegionData}
          year={selectedYear}
          title={`${equipmentLabel} by Region`}
          subtitle={`${selectedYear} breakdown - bars represent ${equipmentLabel.toLowerCase()}, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
          useMillions={useMillions}
        />
      )}

      {/* Process Type Specific: Stacked Bar Charts */}
      {segmentType === "process" && processTypeByRegionData.length > 0 && processTypeByRegionData.some(d => d.total > 0) && (
        <StackedBarChart
          data={processTypeByRegionData}
          year={selectedYear}
          title={`${processTypeLabel} by Region`}
          subtitle={`${selectedYear} breakdown - bars represent ${processTypeLabel.toLowerCase()}, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
          useMillions={useMillions}
        />
      )}
      {segmentType === "process" && processTypeByApplicationData.length > 0 && processTypeByApplicationData.some(d => d.total > 0) && (
        <StackedBarChart
          data={processTypeByApplicationData}
          year={selectedYear}
          title={`${processTypeLabel} by Application`}
          subtitle={`${selectedYear} breakdown - bars represent ${processTypeLabel.toLowerCase()}, stacks show applications`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={processTypeApplicationNames}
          onSegmentClick={handleStackedBarClick}
          useMillions={useMillions}
        />
      )}

      {/* Material Type Specific: Stacked Bar Charts */}
      {segmentType === "material" && materialTypeByRegionData.length > 0 && materialTypeByRegionData.some(d => d.total > 0) && (
        <StackedBarChart
          data={materialTypeByRegionData}
          year={selectedYear}
          title={`${materialTypeLabel} by Region`}
          subtitle={`${selectedYear} breakdown - bars represent ${materialTypeLabel.toLowerCase()}, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
          useMillions={useMillions}
        />
      )}

      {/* Comparison Table */}
      {segmentData.length > 0 && (
        <ComparisonTable
          data={segmentData}
          startYear={firstYear}
          endYear={lastYear}
          title={`${title} - Growth Analysis`}
          onRowClick={handleTableRowClick}
        />
      )}

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownState.isOpen}
        onClose={closeDrillDown}
        segmentName={drillDownState.segmentName}
        segmentData={drillDownState.segmentData}
        color={drillDownState.color}
        useMillions={useMillions}
      />
    </div>
  );
}
