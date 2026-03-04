/**
 * Segment Detail Tab — self-contained for Global Prepreg dashboard.
 * Reads labels and display rules from config.ts.
 */

import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "./ui-helpers";
import { MarketTrendChart, SegmentPieChart, ComparisonTable, DrillDownModal, StackedBarChart, CHART_COLORS } from "./charts";
import { YearlyData, SegmentData, MarketData, calculateCAGR, useDrillDown } from "./data";
import { config, TabType } from "./config";

interface SegmentDetailTabProps {
  segmentType: TabType;
  segmentData: SegmentData[];
  totalMarket: YearlyData[];
  marketData: MarketData;
  title: string;
  selectedYear: number;
}

export function SegmentDetailTab({ segmentType, segmentData, totalMarket, marketData, title, selectedYear }: SegmentDetailTabProps) {
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();
  const { useMillions, labels, segmentMapping } = config;
  const aircraftLabel = segmentMapping.aircraft?.title ?? "Resin Type";

  const currentYearTotal = segmentData.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0), 0);
  const firstYear = marketData.years[0];
  const lastYear = marketData.years[marketData.years.length - 1];
  const valueFirstTotal = segmentData.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === firstYear)?.value ?? 0), 0);
  const valueLastTotal = segmentData.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === lastYear)?.value ?? 0), 0);
  const cagr = calculateCAGR(valueFirstTotal, valueLastTotal, lastYear - firstYear);

  const aircraftTypeNames = marketData.aircraftType.map((s) => s.name);
  const regionNames = marketData.region.map((s) => s.name);
  const applicationNames = marketData.application.map((s) => s.name);
  const equipmentNames = marketData.furnishedEquipment.map((s) => s.name);
  const endUserNames = marketData.endUser.map((s) => s.name);
  const processTypeNames = marketData.processType?.map((s) => s.name) || [];

  const getAllCountries = (): SegmentData[] => {
    const all: SegmentData[] = [];
    Object.values(marketData.countryDataByRegion).forEach((c) => all.push(...c));
    return all;
  };

  // ── Stacked bar data builders ───────────────────────────────

  const buildByNestedData = (parentSegments: SegmentData[], nestedData: Record<string, SegmentData[]> | undefined, reverseKey = false) => {
    if (!nestedData || Object.keys(nestedData).length === 0) return [];
    if (reverseKey) {
      return Object.keys(nestedData).map((key) => {
        const segments = nestedData[key] || [];
        const total = segments.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0), 0);
        return { name: key, segments: segments.map((seg) => ({ name: seg.name, value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0, fullData: seg.data })), total };
      });
    }
    return parentSegments.map((parent) => {
      const segments = nestedData[parent.name] || [];
      const total = segments.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0), 0);
      return { name: parent.name, segments: segments.map((seg) => ({ name: seg.name, value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0, fullData: seg.data })), total };
    });
  };

  const getEquipmentByRegionData = () => {
    if (!marketData.equipmentByRegion) return [];
    return marketData.furnishedEquipment.map((equip) => {
      const segments = marketData.equipmentByRegion[equip.name] || [];
      const total = segments.reduce((sum, seg) => sum + (seg.data.find((d) => d.year === selectedYear)?.value ?? 0), 0);
      return { name: equip.name, segments: segments.map((seg) => ({ name: seg.name, value: seg.data.find((d) => d.year === selectedYear)?.value ?? 0, fullData: seg.data })), total };
    });
  };

  // Compute stacked bar data based on active segment type
  const aircraftTypeStackedData = segmentType === "endUser" ? buildByNestedData([], marketData.endUserByAircraftType, true) : [];
  const regionStackedDataForEndUser = segmentType === "endUser" ? buildByNestedData([], marketData.endUserByRegion, true) : [];
  const aircraftByRegionData = segmentType === "aircraft" ? buildByNestedData(marketData.aircraftType, marketData.aircraftTypeByRegion) : [];
  const aircraftByEndUserData = segmentType === "aircraft" && Object.keys(marketData.endUserByAircraftType || {}).length > 0
    ? marketData.aircraftType.map((aircraft) => {
        const segments = endUserNames.map((euName) => {
          const euData = marketData.endUserByAircraftType?.[euName]?.find(s => s.name === aircraft.name);
          const value = euData?.data.find(d => d.year === selectedYear)?.value ?? 0;
          return { name: euName, value, fullData: euData?.data || [] };
        });
        return { name: aircraft.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
      }) : [];

  const regionByAircraftData = segmentType === "region" ? marketData.region.map((region) => {
    const segments = marketData.aircraftType.map((aircraft) => {
      const d = marketData.aircraftTypeByRegion?.[aircraft.name]?.find(r => r.name === region.name);
      return { name: aircraft.name, value: d?.data.find(dd => dd.year === selectedYear)?.value ?? 0, fullData: d?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByApplicationData = (segmentType === "region" && marketData.application.length > 0 && marketData.applicationByRegion && Object.keys(marketData.applicationByRegion).length > 0) ? marketData.region.map((region) => {
    const segments = marketData.application.map((app) => {
      const d = marketData.applicationByRegion?.[app.name]?.find(r => r.name === region.name);
      return { name: app.name, value: d?.data.find(dd => dd.year === selectedYear)?.value ?? 0, fullData: d?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByEndUserData = segmentType === "region" ? marketData.region.map((region) => {
    const segments = endUserNames.map((euName) => {
      const d = marketData.endUserByRegion?.[euName]?.find(r => r.name === region.name);
      return { name: euName, value: d?.data.find(dd => dd.year === selectedYear)?.value ?? 0, fullData: d?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByEquipmentData = segmentType === "region" ? marketData.region.map((region) => {
    const equipSegments = marketData.furnishedEquipment.map((equip) => {
      const entries = marketData.equipmentByRegion?.[equip.name];
      const re = entries?.find(r => r.name === region.name);
      return { name: equip.name, value: re?.data.find(d => d.year === selectedYear)?.value ?? 0, fullData: re?.data || [] };
    });
    return { name: region.name, segments: equipSegments, total: equipSegments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const regionByProcessData = segmentType === "region" && marketData.processType ? marketData.region.map((region) => {
    const segments = (marketData.processType || []).map((pt) => {
      const d = marketData.processTypeByRegion?.[pt.name]?.find(r => r.name === region.name);
      return { name: pt.name, value: d?.data.find(dd => dd.year === selectedYear)?.value ?? 0, fullData: d?.data || [] };
    });
    return { name: region.name, segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }) : [];

  const applicationByRegionData = segmentType === "application" ? buildByNestedData(marketData.application, marketData.applicationByRegion) : [];
  const equipmentByRegionData = segmentType === "equipment" ? getEquipmentByRegionData() : [];
  const processTypeByRegionData = segmentType === "process" ? buildByNestedData(marketData.processType || [], marketData.processTypeByRegion) : [];

  const allCountries = segmentType === "region" ? getAllCountries() : [];

  // ── Drill-down handlers ─────────────────────────────────────

  const getRelatedSegmentsForDrillDown = (segmentName: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[segmentName])
      return { title: `Countries in ${segmentName}`, data: marketData.countryDataByRegion[segmentName] };
    if (segmentType === "aircraft") return { title: `${labels.application} for this ${aircraftLabel}`, data: marketData.application };
    if (segmentType === "endUser") return { title: `Regions for this ${labels.endUser}`, data: marketData.region };
    if (segmentType === "application") return { title: `${aircraftLabel} by ${labels.application}`, data: marketData.aircraftType };
    if (segmentType === "equipment") {
      const rd = marketData.equipmentByRegion?.[segmentName];
      if (rd) return { title: `Regions for ${segmentName}`, data: rd };
      return { title: "Regions", data: marketData.region };
    }
    if (segmentType === "process") {
      const prd = marketData.processTypeByRegion?.[segmentName];
      if (prd) return { title: `Regions for ${segmentName}`, data: prd };
      return { title: "Regions", data: marketData.region };
    }
    return undefined;
  };

  const handlePieSegmentClick = (name: string, data: YearlyData[], color: string) => openDrillDown(name, data, color, getRelatedSegmentsForDrillDown(name));
  const handleBarClick = (name: string, data: YearlyData[], color: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[name])
      openDrillDown(name, data, color, { title: `Countries in ${name}`, data: marketData.countryDataByRegion[name] });
    else openDrillDown(name, data, color, getRelatedSegmentsForDrillDown(name));
  };
  const handleTrendSegmentClick = (name: string, data: YearlyData[], color: string) => openDrillDown(name, data, color, getRelatedSegmentsForDrillDown(name));
  const handleTableRowClick = (name: string, data: YearlyData[], color: string) => openDrillDown(name, data, color, getRelatedSegmentsForDrillDown(name));
  const handleStackedBarClick = (endUserType: string, segmentName: string, _value: number, color: string, fullData?: YearlyData[]) => {
    if (fullData) openDrillDown(`${segmentName} (${endUserType})`, fullData, color, undefined);
  };

  return (
    <div className="space-y-8">
      {segmentData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MarketTrendChart data={totalMarket} segments={segmentData} title={`${title} - Market Trend`}
              subtitle="Historical and forecast data - Click legend to drill down" showSegments onSegmentClick={handleTrendSegmentClick} useMillions={useMillions} />
          </div>
          <SegmentPieChart data={segmentData} year={selectedYear} title={title} onSegmentClick={handlePieSegmentClick} />
        </div>
      )}

      {segmentType === "region" && allCountries.length > 0 && (
        <MarketTrendChart data={totalMarket} segments={allCountries} title="Countries - Market Trend"
          subtitle="All countries historical and forecast data" showSegments onSegmentClick={handleTrendSegmentClick} useMillions={useMillions} />
      )}

      {segmentType === "endUser" && (
        <>
          {aircraftTypeStackedData.length > 0 && aircraftTypeStackedData.some(d => d.total > 0) && (
            <StackedBarChart data={aircraftTypeStackedData} year={selectedYear} title={`${labels.endUser} by ${aircraftLabel}`}
              subtitle={`${selectedYear} breakdown`} segmentColors={CHART_COLORS} segmentNames={aircraftTypeNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {regionStackedDataForEndUser.length > 0 && regionStackedDataForEndUser.some(d => d.total > 0) && (
            <StackedBarChart data={regionStackedDataForEndUser} year={selectedYear} title={`${labels.endUser} by Region`}
              subtitle={`${selectedYear} breakdown`} segmentColors={CHART_COLORS} segmentNames={regionNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
        </>
      )}

      {segmentType === "aircraft" && (
        <>
          {aircraftByRegionData.length > 0 && aircraftByRegionData.some(d => d.total > 0) && (
            <StackedBarChart data={aircraftByRegionData} year={selectedYear} title={`${aircraftLabel} by Region`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={regionNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {aircraftByEndUserData.length > 0 && aircraftByEndUserData.some(d => d.total > 0) && (
            <StackedBarChart data={aircraftByEndUserData} year={selectedYear} title={`${aircraftLabel} by ${labels.endUser}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={endUserNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
        </>
      )}

      {segmentType === "region" && (
        <>
          {regionByAircraftData.length > 0 && regionByAircraftData.some(d => d.total > 0) && (
            <StackedBarChart data={regionByAircraftData} year={selectedYear} title={`Region by ${aircraftLabel}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={aircraftTypeNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {regionByApplicationData.length > 0 && regionByApplicationData.some(d => d.total > 0) && (
            <StackedBarChart data={regionByApplicationData} year={selectedYear} title={`Region by ${labels.application}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={applicationNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {regionByEndUserData.length > 0 && regionByEndUserData.some(d => d.total > 0) && (
            <StackedBarChart data={regionByEndUserData} year={selectedYear} title={`Region by ${labels.endUser}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={endUserNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {regionByEquipmentData.length > 0 && regionByEquipmentData.some(d => d.total > 0) && (
            <StackedBarChart data={regionByEquipmentData} year={selectedYear} title={`Region by ${labels.equipment}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={equipmentNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
          {regionByProcessData.length > 0 && regionByProcessData.some(d => d.total > 0) && (
            <StackedBarChart data={regionByProcessData} year={selectedYear} title={`Region by ${labels.processType}`} subtitle={`${selectedYear} breakdown`}
              segmentColors={CHART_COLORS} segmentNames={processTypeNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
          )}
        </>
      )}

      {segmentType === "application" && applicationByRegionData.length > 0 && applicationByRegionData.some(d => d.total > 0) && (
        <StackedBarChart data={applicationByRegionData} year={selectedYear} title={`${labels.application} by Region`} subtitle={`${selectedYear} breakdown`}
          segmentColors={CHART_COLORS} segmentNames={regionNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
      )}

      {segmentType === "equipment" && equipmentByRegionData.length > 0 && equipmentByRegionData.some(d => d.total > 0) && (
        <StackedBarChart data={equipmentByRegionData} year={selectedYear} title={`${labels.equipment} by Region`} subtitle={`${selectedYear} breakdown`}
          segmentColors={CHART_COLORS} segmentNames={regionNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
      )}

      {segmentType === "process" && processTypeByRegionData.length > 0 && processTypeByRegionData.some(d => d.total > 0) && (
        <StackedBarChart data={processTypeByRegionData} year={selectedYear} title={`${labels.processType} by Region`} subtitle={`${selectedYear} breakdown`}
          segmentColors={CHART_COLORS} segmentNames={regionNames} onSegmentClick={handleStackedBarClick} useMillions={useMillions} />
      )}

      {segmentData.length > 0 && (
        <ComparisonTable data={segmentData} startYear={firstYear} endYear={lastYear} title={`${title} - Growth Analysis`} onRowClick={handleTableRowClick} />
      )}

      <DrillDownModal isOpen={drillDownState.isOpen} onClose={closeDrillDown} segmentName={drillDownState.segmentName}
        segmentData={drillDownState.segmentData} color={drillDownState.color} useMillions={useMillions} />
    </div>
  );
}
