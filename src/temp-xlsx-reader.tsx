import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function r2(v: any) { return typeof v === 'number' ? Math.round(v * 100) / 100 : 0; }

function parseSheet(ws: XLSX.WorkSheet) {
  const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const rows: { label: string; values: number[] }[] = [];
  for (const row of data) {
    if (!row[0] || typeof row[0] !== 'string' || row[0].trim() === '') continue;
    const label = String(row[0]).trim();
    const values = row.slice(1).map(r2);
    rows.push({ label, values });
  }
  return rows;
}

function findRow(rows: { label: string; values: number[] }[], label: string) {
  return rows.find(r => r.label === label)?.values || [];
}

function findRowStartsWith(rows: { label: string; values: number[] }[], prefix: string) {
  return rows.find(r => r.label.startsWith(prefix))?.values || [];
}

// Get values for 18 years (trim trailing 0 if 19)
function trim18(arr: number[]): number[] {
  return arr.length > 18 ? arr.slice(0, 18) : arr;
}

function buildInner(rows: { label: string; values: number[] }[]) {
  // Parse section by section using indices
  const sectionHeaders: { label: string; idx: number }[] = [];
  rows.forEach((r, i) => { sectionHeaders.push({ label: r.label, idx: i }); });

  function getValues(label: string) { return trim18(findRow(rows, label)); }
  function getValuesPrefix(prefix: string) { return trim18(findRowStartsWith(rows, prefix)); }

  // Find indices of key sections
  function findIdx(partial: string) { return rows.findIndex(r => r.label.includes(partial)); }
  
  // Get regional data for a segment: look for NA/EU/APAC/RoW rows right after the segment
  function getRegional(startIdx: number): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    for (let i = startIdx + 1; i < Math.min(startIdx + 5, rows.length); i++) {
      const l = rows[i].label;
      if (l === "North America") result["North America"] = trim18(rows[i].values);
      else if (l === "Europe") result["Europe"] = trim18(rows[i].values);
      else if (l.startsWith("Asia")) result["Asia-Pacific"] = trim18(rows[i].values);
      else if (l.startsWith("Rest")) result["Rest of the World"] = trim18(rows[i].values);
      else break;
    }
    return result;
  }

  // End-Use segments
  const endUseNames = ["Aerospace & Defense", "Wind Energy", "Sporting Goods", "Automotive", "Civil Engineering", "Marine", "Others"];
  const endUser: Record<string, number[]> = {};
  const endUserByRegion: Record<string, Record<string, number[]>> = {};
  
  for (const name of endUseNames) {
    const idx = rows.findIndex(r => r.label.startsWith(name.substring(0, 8)));
    if (idx >= 0) {
      endUser[name] = trim18(rows[idx].values);
      endUserByRegion[name] = getRegional(idx);
    }
  }

  // Resin Type  
  const resinIdx = findIdx("Resin-Type") !== -1 ? findIdx("Resin-Type") : findIdx("By Resin");
  const thermosetRow = rows.find(r => r.label === "Thermoset Prepreg");
  const thermoplasticRow = rows.find(r => r.label === "Thermoplastic Prepreg" && rows.indexOf(r) > (resinIdx || 0));
  
  const aircraftType: Record<string, number[]> = {};
  if (thermosetRow) aircraftType["Thermoset"] = trim18(thermosetRow.values);
  if (thermoplasticRow) aircraftType["Thermoplastic"] = trim18(thermoplasticRow.values);

  // Thermoset sub-types with regional
  const thermosetSubs = ["Epoxy Prepreg", "Phenolic Prepreg", "BMI Prepreg", "Cyanate Ester Prepreg", "Other Prepreg"];
  const thermosetSubRegional: Record<string, Record<string, number[]>> = {};
  
  const bifurcIdx = findIdx("Thermoset Bifurcation");
  if (bifurcIdx >= 0) {
    for (const sub of thermosetSubs) {
      const idx = rows.findIndex((r, i) => i > bifurcIdx && r.label === sub);
      if (idx >= 0) {
        const cleanName = sub.replace(" Prepreg", "");
        thermosetSubRegional[cleanName] = getRegional(idx);
      }
    }
  }
  
  // Thermoplastic sub-types
  const tpSubNames = ["PPS Prepreg", "PEEK Prepreg", "Other Prepregs"];
  const tpIdx = rows.findIndex((r, i) => i > (bifurcIdx || 0) && r.label === "Thermoplastic Prepreg" && rows[i+1]?.label === "PPS Prepreg");
  const thermoplasticSubRegional: Record<string, Record<string, number[]>> = {};
  
  if (tpIdx >= 0) {
    for (const sub of tpSubNames) {
      const idx = rows.findIndex((r, i) => i > tpIdx && r.label === sub);
      if (idx >= 0) {
        const cleanName = sub.replace(" Prepreg", "").replace(" Prepregs", "");
        thermoplasticSubRegional[cleanName] = getRegional(idx);
      }
    }
  }

  // Derive Resin Type by Region (sum sub-types)
  const regions = ["North America", "Europe", "Asia-Pacific", "Rest of the World"];
  const aircraftTypeByRegion: Record<string, Record<string, number[]>> = {};
  
  // Thermoset by region
  const thermosetByRegion: Record<string, number[]> = {};
  for (const reg of regions) {
    const arr = new Array(18).fill(0);
    for (const sub of Object.values(thermosetSubRegional)) {
      if (sub[reg]) sub[reg].forEach((v, i) => { if (i < 18) arr[i] += v; });
    }
    thermosetByRegion[reg] = arr.map(v => Math.round(v * 100) / 100);
  }
  aircraftTypeByRegion["Thermoset"] = thermosetByRegion;

  const thermoplasticByRegion: Record<string, number[]> = {};
  for (const reg of regions) {
    const arr = new Array(18).fill(0);
    for (const sub of Object.values(thermoplasticSubRegional)) {
      if (sub[reg]) sub[reg].forEach((v, i) => { if (i < 18) arr[i] += v; });
    }
    thermoplasticByRegion[reg] = arr.map(v => Math.round(v * 100) / 100);
  }
  aircraftTypeByRegion["Thermoplastic"] = thermoplasticByRegion;

  // Region
  const regionData: Record<string, number[]> = {};
  for (const reg of regions) {
    const arr = new Array(18).fill(0);
    for (const eu of endUseNames) {
      if (endUserByRegion[eu]?.[reg]) {
        endUserByRegion[eu][reg].forEach((v, i) => { if (i < 18) arr[i] += v; });
      }
    }
    regionData[reg] = arr.map(v => Math.round(v * 100) / 100);
  }

  // Fiber Type
  const fiberNames = ["Carbon Fiber Prepreg", "Glass Fiber Prepreg", "Aramid Fiber Prepreg"];
  const fiberClean = ["Carbon Fiber", "Glass Fiber", "Aramid Fiber"];
  const application: Record<string, number[]> = {};
  const applicationByRegion: Record<string, Record<string, number[]>> = {};
  
  for (let f = 0; f < fiberNames.length; f++) {
    const idx = rows.findIndex(r => r.label === fiberNames[f]);
    if (idx >= 0) {
      application[fiberClean[f]] = trim18(rows[idx].values);
      applicationByRegion[fiberClean[f]] = getRegional(idx);
    }
  }

  // Form Type
  const formNames = ["Fabric Prepreg", "UD Prepreg"];
  const formClean = ["Fabric", "UD"];
  const furnishedEquipment: Record<string, number[]> = {};
  const equipmentByRegion: Record<string, Record<string, number[]>> = {};
  
  for (let f = 0; f < formNames.length; f++) {
    const idx = rows.findIndex(r => r.label === formNames[f]);
    if (idx >= 0) {
      furnishedEquipment[formClean[f]] = trim18(rows[idx].values);
      equipmentByRegion[formClean[f]] = getRegional(idx);
    }
  }

  // Process Type
  const procIdx = findIdx("Process-Wise");
  const procNames = [
    { raw: "Autoclave", clean: "Autoclave" },
    { raw: "OoA", clean: "OoA" },
    { raw: "Others", clean: "Others" }
  ];
  const processType: Record<string, number[]> = {};
  const processTypeByRegion: Record<string, Record<string, number[]>> = {};
  
  if (procIdx >= 0) {
    for (const p of procNames) {
      const idx = rows.findIndex((r, i) => i > procIdx && r.label === p.raw);
      if (idx >= 0) {
        processType[p.clean] = trim18(rows[idx].values);
        processTypeByRegion[p.clean] = getRegional(idx);
      }
    }
  }

  // Build countryDataByRegion (empty - no country data in this dataset)
  const countryDataByRegion: Record<string, Record<string, number[]>> = {};
  
  // endUserByAircraftType (empty)
  const endUserByAircraftType: Record<string, Record<string, number[]>> = {};

  return {
    totalMarket: trim18(rows.find(r => r.label.includes("Total (in"))?.values || []),
    endUser,
    aircraftType,
    region: regionData,
    application,
    furnishedEquipment,
    processType,
    countryDataByRegion,
    endUserByAircraftType,
    endUserByRegion,
    aircraftTypeByRegion,
    applicationByRegion,
    equipmentByRegion,
    processTypeByRegion,
  };
}

export default function TempXlsxReader() {
  const [output, setOutput] = useState("Loading...");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/total-prepreg-temp.xlsx");
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });

        const years = [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031];

        const weightRows = parseSheet(wb.Sheets["in Million Lbs"]);
        const valueRows = parseSheet(wb.Sheets["in US$ Mn"]);

        const json = {
          years,
          value: buildInner(valueRows),
          weight: buildInner(weightRows),
        };

        const jsonStr = JSON.stringify(json, null, 2);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(jsonStr);
        
        setOutput("JSON generated and copied to clipboard! Length: " + jsonStr.length + "\n\nPreview:\n" + jsonStr.substring(0, 5000));
      } catch (e: any) {
        setOutput("Error: " + e.message + "\n" + e.stack);
      }
    })();
  }, []);

  return (
    <div className="p-4 bg-black min-h-screen font-mono text-xs whitespace-pre-wrap overflow-auto" style={{color:'#0f0'}}>
      {output}
    </div>
  );
}
