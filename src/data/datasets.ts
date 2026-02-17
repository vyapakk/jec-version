import { Layers, Plane, Car, Building2, MoreHorizontal } from "lucide-react";

/**
 * BACKEND INTEGRATION POINT: Dataset Categories & Purchase Status
 * 
 * Replace this static array with an API call. The API should return the same
 * structure but with `purchased` resolved per authenticated user.
 * 
 * Expected API: GET /api/datasets?user_id={userId}
 * Expected Response: Same structure as below, with `purchased: true/false` per dataset
 * 
 * The `purchased` field controls:
 * - Listing page (DatasetList.tsx): Shows lock icon on unpurchased datasets
 * - Detail page (DatasetDetail.tsx): Blocks dashboard access, shows access request form
 */
export const categories = [
  {
    id: "composites",
    title: "Composites",
    icon: Layers,
    color: "teal" as const,
    description: "Advanced composite materials market research including carbon fiber, glass fiber, and polymer matrix composites.",
    datasets: [
      {
        id: "carbon-fiber",
        name: "Carbon Fiber Market",
        purchased: false,
        dashboards: [
          { id: "cf-global", name: "Global Carbon Fiber Market Overview" },
          { id: "cf-aerospace", name: "Aerospace Carbon Fiber Applications" },
          { id: "cf-automotive", name: "Automotive Carbon Fiber Trends" },
        ],
      },
      {
        id: "glass-fiber",
        name: "Glass Fiber Composites",
        purchased: false,
        dashboards: [
          { id: "gf-market", name: "Glass Fiber Market Analysis" },
          { id: "gf-construction", name: "Construction Applications" },
        ],
      },
      {
        id: "polymer-matrix",
        name: "Polymer Matrix Composites",
        purchased: false,
        dashboards: [
          { id: "pmc-overview", name: "PMC Market Overview" },
          { id: "pmc-industrial", name: "Industrial Applications" },
          { id: "pmc-forecast", name: "Market Forecast 2025-2030" },
        ],
      },
    ],
  },
  {
    id: "aerospace-defense",
    title: "Aerospace & Defense",
    icon: Plane,
    color: "navy" as const,
    description: "Comprehensive aerospace and defense market intelligence covering aircraft, satellites, defense systems, and more.",
    datasets: [
      {
        id: "aircraft-interiors",
        name: "Aircraft Interiors",
        purchased: true,
        dashboards: [
          { id: "ai-global", name: "Global Aircraft Interiors Market" },
          { id: "ai-cabin-composites", name: "Aircraft Cabin Interior Composites Market" },
          { id: "ai-soft-goods", name: "Aircraft Soft Goods Market" },
          { id: "ai-water-waste", name: "Aircraft Water/Waste Water Market" },
          { id: "ai-galley", name: "Aircraft Galley Market" },
          { id: "ai-psu", name: "Aircraft PSU Market" },
          { id: "ai-lavatory", name: "Aircraft Lavatory Market" },
          { id: "ai-ohsb", name: "Aircraft OHSB Market" },
          { id: "ai-stowages", name: "Aircraft Stowages Market" },
          { id: "ai-floor-panels", name: "Aircraft Floor Panels Market" },
          { id: "ai-cargo-liner", name: "Aircraft Cargo Liner Market" },
          { id: "ai-cabin-lining", name: "Aircraft Cabin Lining Market" },
          { id: "ai-cabin-interiors", name: "Aircraft Cabin Interiors Market" },
          { id: "ai-sandwich-panels", name: "Aircraft Interior Sandwich Panels Market" },
          { id: "ai-potted-inserts", name: "Aircraft Potted Inserts Market" },
          { id: "ai-non-sandwich-panels", name: "Aircraft Interior Non-Sandwich Panel Composites Market" },
          { id: "ai-extrusion", name: "Aircraft Interiors Extrusion Market" },
          { id: "ai-thermoformed-parts", name: "Aircraft Interior Thermoformed Parts Market" },
          { id: "ai-plastic", name: "Aircraft Interiors Plastic Market" },
          { id: "ai-injection-molding", name: "Aircraft Interiors Injection Molding & Others Market" },
          { id: "ai-thermoformed-sheets", name: "Aircraft Interior Thermoformed Sheets Market" },
          { id: "ai-seats", name: "Aircraft Seats Market" },
          { id: "ai-lighting", name: "Aircraft Interior Lighting Market" },
          { id: "ai-ifec", name: "Aircraft IFEC Market" },
        ],
      },
      {
        id: "commercial-aircraft",
        name: "Commercial Aircraft",
        purchased: false,
        dashboards: [
          { id: "ca-fleet", name: "Global Fleet Analysis" },
          { id: "ca-deliveries", name: "Aircraft Deliveries Forecast" },
          { id: "ca-oem", name: "OEM Market Share" },
        ],
      },
      {
        id: "defense-systems",
        name: "Defense Systems",
        purchased: false,
        dashboards: [
          { id: "ds-spending", name: "Global Defense Spending" },
          { id: "ds-uav", name: "UAV/Drone Market" },
        ],
      },
    ],
  },
  {
    id: "automotive-transport",
    title: "Automotive & Transport",
    icon: Car,
    color: "mint" as const,
    description: "Automotive industry insights including electric vehicles, autonomous driving, and transportation trends.",
    datasets: [
      {
        id: "electric-vehicles",
        name: "Electric Vehicles",
        purchased: false,
        dashboards: [
          { id: "ev-global", name: "Global EV Market Overview" },
          { id: "ev-battery", name: "EV Battery Market" },
          { id: "ev-charging", name: "Charging Infrastructure" },
        ],
      },
      {
        id: "autonomous-driving",
        name: "Autonomous Driving",
        purchased: false,
        dashboards: [
          { id: "ad-tech", name: "AD Technology Landscape" },
          { id: "ad-sensors", name: "Sensor Market Analysis" },
        ],
      },
      {
        id: "lightweighting",
        name: "Automotive Lightweighting",
        purchased: false,
        dashboards: [
          { id: "lw-materials", name: "Lightweight Materials Market" },
          { id: "lw-trends", name: "OEM Lightweighting Strategies" },
        ],
      },
    ],
  },
  {
    id: "building-construction",
    title: "Building & Construction",
    icon: Building2,
    color: "teal-dark" as const,
    description: "Construction industry market research covering materials, infrastructure, and building technologies.",
    datasets: [
      {
        id: "construction-composites",
        name: "Construction Composites",
        purchased: false,
        dashboards: [
          { id: "cc-rebar", name: "Composite Rebar Market" },
          { id: "cc-panels", name: "FRP Panels Analysis" },
        ],
      },
      {
        id: "smart-buildings",
        name: "Smart Buildings",
        purchased: false,
        dashboards: [
          { id: "sb-market", name: "Smart Building Market" },
          { id: "sb-hvac", name: "Smart HVAC Systems" },
          { id: "sb-lighting", name: "Smart Lighting Solutions" },
        ],
      },
    ],
  },
  {
    id: "prepregs",
    title: "Prepregs",
    icon: Layers,
    color: "teal" as const,
    description: "Prepreg materials market research covering thermoplastic and thermoset prepregs across industries.",
    datasets: [
      {
        id: "prepregs",
        name: "Prepregs",
        purchased: true,
        dashboards: [
          { id: "pp-thermoplastic", name: "Thermoplastic Prepreg Market" },
        ],
      },
    ],
  },
  {
    id: "others",
    title: "Others",
    icon: MoreHorizontal,
    color: "teal" as const,
    description: "Additional market research datasets covering emerging industries and specialized sectors.",
    datasets: [
      {
        id: "wind-energy",
        name: "Wind Energy",
        purchased: false,
        dashboards: [
          { id: "we-turbines", name: "Wind Turbine Market" },
          { id: "we-blades", name: "Blade Materials Analysis" },
        ],
      },
      {
        id: "marine",
        name: "Marine & Offshore",
        purchased: false,
        dashboards: [
          { id: "mo-vessels", name: "Marine Vessels Market" },
          { id: "mo-composites", name: "Marine Composites" },
        ],
      },
      {
        id: "sports-leisure",
        name: "Sports & Leisure",
        purchased: false,
        dashboards: [
          { id: "sl-equipment", name: "Sports Equipment Market" },
        ],
      },
    ],
  },
];
