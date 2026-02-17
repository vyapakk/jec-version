import { Layers, Plane, Car, Building2, MoreHorizontal } from "lucide-react";

/**
 * BACKEND INTEGRATION POINT: Dataset Categories & Purchase Status
 * 
 * Replace this static array with an API call. The API should return the same
 * structure but with `purchased` resolved per authenticated user at the DASHBOARD level.
 * 
 * Expected API: GET /api/datasets?user_id={userId}
 * Expected Response: Same structure as below, with `purchased: true/false` per dashboard
 * 
 * The `purchased` field on each dashboard controls:
 * - Dataset listing (DatasetList.tsx): Shows lock if NO dashboards are purchased
 * - Subscriptions (SubscriptionsSection.tsx): Shows dataset if ANY dashboard is purchased
 * - Detail page (DatasetDetail.tsx): Per-dashboard lock icon and access request
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
        dashboards: [
          { id: "cf-global", name: "Global Carbon Fiber Market Overview", purchased: false },
          { id: "cf-aerospace", name: "Aerospace Carbon Fiber Applications", purchased: false },
          { id: "cf-automotive", name: "Automotive Carbon Fiber Trends", purchased: false },
        ],
      },
      {
        id: "glass-fiber",
        name: "Glass Fiber Composites",
        dashboards: [
          { id: "gf-market", name: "Glass Fiber Market Analysis", purchased: false },
          { id: "gf-construction", name: "Construction Applications", purchased: false },
        ],
      },
      {
        id: "polymer-matrix",
        name: "Polymer Matrix Composites",
        dashboards: [
          { id: "pmc-overview", name: "PMC Market Overview", purchased: false },
          { id: "pmc-industrial", name: "Industrial Applications", purchased: false },
          { id: "pmc-forecast", name: "Market Forecast 2025-2030", purchased: false },
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
        dashboards: [
          { id: "ai-global", name: "Global Aircraft Interiors Market", purchased: true },
          { id: "ai-cabin-composites", name: "Aircraft Cabin Interior Composites Market", purchased: true },
          { id: "ai-soft-goods", name: "Aircraft Soft Goods Market", purchased: true },
          { id: "ai-water-waste", name: "Aircraft Water/Waste Water Market", purchased: true },
          { id: "ai-galley", name: "Aircraft Galley Market", purchased: true },
          { id: "ai-psu", name: "Aircraft PSU Market", purchased: true },
          { id: "ai-lavatory", name: "Aircraft Lavatory Market", purchased: true },
          { id: "ai-ohsb", name: "Aircraft OHSB Market", purchased: true },
          { id: "ai-stowages", name: "Aircraft Stowages Market", purchased: true },
          { id: "ai-floor-panels", name: "Aircraft Floor Panels Market", purchased: true },
          { id: "ai-cargo-liner", name: "Aircraft Cargo Liner Market", purchased: true },
          { id: "ai-cabin-lining", name: "Aircraft Cabin Lining Market", purchased: true },
          { id: "ai-cabin-interiors", name: "Aircraft Cabin Interiors Market", purchased: true },
          { id: "ai-sandwich-panels", name: "Aircraft Interior Sandwich Panels Market", purchased: true },
          { id: "ai-potted-inserts", name: "Aircraft Potted Inserts Market", purchased: true },
          { id: "ai-non-sandwich-panels", name: "Aircraft Interior Non-Sandwich Panel Composites Market", purchased: true },
          { id: "ai-extrusion", name: "Aircraft Interiors Extrusion Market", purchased: true },
          { id: "ai-thermoformed-parts", name: "Aircraft Interior Thermoformed Parts Market", purchased: true },
          { id: "ai-plastic", name: "Aircraft Interiors Plastic Market", purchased: true },
          { id: "ai-injection-molding", name: "Aircraft Interiors Injection Molding & Others Market", purchased: true },
          { id: "ai-thermoformed-sheets", name: "Aircraft Interior Thermoformed Sheets Market", purchased: true },
          { id: "ai-seats", name: "Aircraft Seats Market", purchased: true },
          { id: "ai-lighting", name: "Aircraft Interior Lighting Market", purchased: true },
          { id: "ai-ifec", name: "Aircraft IFEC Market", purchased: true },
        ],
      },
      {
        id: "commercial-aircraft",
        name: "Commercial Aircraft",
        dashboards: [
          { id: "ca-fleet", name: "Global Fleet Analysis", purchased: false },
          { id: "ca-deliveries", name: "Aircraft Deliveries Forecast", purchased: false },
          { id: "ca-oem", name: "OEM Market Share", purchased: false },
        ],
      },
      {
        id: "defense-systems",
        name: "Defense Systems",
        dashboards: [
          { id: "ds-spending", name: "Global Defense Spending", purchased: false },
          { id: "ds-uav", name: "UAV/Drone Market", purchased: false },
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
        dashboards: [
          { id: "ev-global", name: "Global EV Market Overview", purchased: false },
          { id: "ev-battery", name: "EV Battery Market", purchased: false },
          { id: "ev-charging", name: "Charging Infrastructure", purchased: false },
        ],
      },
      {
        id: "autonomous-driving",
        name: "Autonomous Driving",
        dashboards: [
          { id: "ad-tech", name: "AD Technology Landscape", purchased: false },
          { id: "ad-sensors", name: "Sensor Market Analysis", purchased: false },
        ],
      },
      {
        id: "lightweighting",
        name: "Automotive Lightweighting",
        dashboards: [
          { id: "lw-materials", name: "Lightweight Materials Market", purchased: false },
          { id: "lw-trends", name: "OEM Lightweighting Strategies", purchased: false },
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
        dashboards: [
          { id: "cc-rebar", name: "Composite Rebar Market", purchased: false },
          { id: "cc-panels", name: "FRP Panels Analysis", purchased: false },
        ],
      },
      {
        id: "smart-buildings",
        name: "Smart Buildings",
        dashboards: [
          { id: "sb-market", name: "Smart Building Market", purchased: false },
          { id: "sb-hvac", name: "Smart HVAC Systems", purchased: false },
          { id: "sb-lighting", name: "Smart Lighting Solutions", purchased: false },
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
        dashboards: [
          { id: "pp-thermoplastic", name: "Thermoplastic Prepreg Market", purchased: true },
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
        dashboards: [
          { id: "we-turbines", name: "Wind Turbine Market", purchased: false },
          { id: "we-blades", name: "Blade Materials Analysis", purchased: false },
        ],
      },
      {
        id: "marine",
        name: "Marine & Offshore",
        dashboards: [
          { id: "mo-vessels", name: "Marine Vessels Market", purchased: false },
          { id: "mo-composites", name: "Marine Composites", purchased: false },
        ],
      },
      {
        id: "sports-leisure",
        name: "Sports & Leisure",
        dashboards: [
          { id: "sl-equipment", name: "Sports Equipment Market", purchased: false },
        ],
      },
    ],
  },
];
