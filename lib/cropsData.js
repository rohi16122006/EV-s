// lib/cropsData.js - Agricultural LCA Database & Telemetry Baselines
// Powered by the 61-Crop Indian Agronomic & Cold-Chain Master Dataset
import { INDIAN_CROPS_DATA, calculateCropModel } from "./indianAgriDataset";

export { INDIAN_CROPS_DATA };

export const KAGGLE_SOURCE_INFO = {
  title: "Empirical Indian Agricultural Dataset (61 Crops)",
  source: "Ministry of Agriculture & Farmers Welfare / ICAR / Agro-LCA Survey",
  fieldsCount: 16,
  recordsCount: 61,
  featuredFruit: "Banana (Tamil Nadu / Maharashtra / Andhra Pradesh)",
};

// Map all 61 crops from the empirical dataset into full LCA engine profiles
export const CROPS = {};

// Helper for realistic destinations and logistics based on crop category and state
function getCropLogistics(item) {
  const states = item.top_states.split(";").map((s) => s.trim());
  const primaryState = states[0] || "Maharashtra";
  
  if (item.category === "Fruit") {
    if (item.id === "banana") {
      return {
        farmName: "Jalgaon - Theni Banana Agro-Cluster",
        location: `${primaryState}, India`,
        destination: "Azadpur Mandi, New Delhi / Vashi APMC, Mumbai",
        distanceKm: 1080,
      };
    }
    if (item.id === "apple") {
      return {
        farmName: "Sopore - Kotgarh Apple Belt",
        location: `${primaryState}, India`,
        destination: "Azadpur Mandi, New Delhi",
        distanceKm: 720,
      };
    }
    if (item.id === "mango") {
      return {
        farmName: "Konkan - Malihabad Mango Orchards",
        location: `${primaryState}, India`,
        destination: "Vashi APMC, Navi Mumbai / Export Hub",
        distanceKm: 540,
      };
    }
    if (item.id === "grapes") {
      return {
        farmName: "Nashik Grape Valley Commercial Vineyards",
        location: `${primaryState}, India`,
        destination: "Bengaluru Wholesale Market / Nhava Sheva Export",
        distanceKm: 980,
      };
    }
    if (item.id === "citrus") {
      return {
        farmName: "Nagpur Orange & Vidarbha Mandarin Belt",
        location: `${primaryState}, India`,
        destination: "Kolkata Fruit Market / Delhi Mandi",
        distanceKm: 1150,
      };
    }
    return {
      farmName: `${primaryState} Horticultural Cluster`,
      location: `${primaryState}, India`,
      destination: "Metro APMC Wholesale Terminal",
      distanceKm: 850,
    };
  }

  if (item.category === "Vegetable") {
    return {
      farmName: `${primaryState} Vegetable Precision Basin`,
      location: `${primaryState}, India`,
      destination: "Regional State APMC Mandi",
      distanceKm: 450,
    };
  }

  return {
    farmName: `${primaryState} Agricultural Farmland`,
    location: `${primaryState}, India`,
    destination: "Food Corporation of India (FCI) Terminal / Mill",
    distanceKm: 650,
  };
}

// Build Indian Crop LCA profiles
INDIAN_CROPS_DATA.forEach((item) => {
  const model = calculateCropModel(item);
  const logistics = getCropLogistics(item);

  CROPS[item.id] = {
    id: item.id,
    region: "india",
    regionName: `India (${item.top_states})`,
    commonName: item.crop,
    scientificName: item.crop,
    category: item.category,
    season: item.season,
    icon: item.icon || "🌱",
    cropDataRow: item, // Raw 16-column dataset row
    description: `Empirical dataset: ${item.category} crop (${item.season} season). Primary states: ${item.top_states}. Average yield: ${item.yield_kg_ha.toLocaleString()} kg/ha. Irrigated share: ${Math.round(item.irrigated_share * 100)}%. Post-harvest loss: ${item.handling_loss_pct}%.`,
    originFarm: {
      name: logistics.farmName,
      location: logistics.location,
      destination: logistics.destination,
      defaultDistanceKm: logistics.distanceKm,
      elevationMeters: 250,
      facilityType: item.irrigated_share > 0.5 ? "Irrigated Farmland (Tube-well / Canal Drip)" : "Rainfed Agro-Ecosystem",
    },
    growthCycleDays: item.growth_days,
    averageYieldKgPerM2: Number((item.yield_kg_ha / 10000).toFixed(2)),
    baselineGridCarbon: 716, // Central Electricity Authority (CEA) Baseline
    baselineLCA: {
      cultivation: model.breakdown.cultivation,
      harvestingProcessing: model.breakdown.processing,
      packaging: model.breakdown.packaging,
      transport: model.breakdown.transport,
      retailAndWaste: model.breakdown.retailAndWaste,
    },
    telemetryBounds: {
      ambientTemp: { min: 20, max: 42, optimal: 30.5, unit: "°C" },
      relativeHumidity: { min: 45, max: 90, optimal: 68, unit: "%" },
      soilMoisture: { min: 40, max: 85, optimal: 65, unit: "%" },
      solarIrradiance: { min: 250, max: 1000, optimal: 820, unit: "W/m²" },
      soilN2OFlux: { min: 0.4, max: 5.5, baseline: Math.max(0.6, Number((item.n_kg_ha * 0.018).toFixed(2))), unit: "mg N₂O/m²/h" },
      soilCH4Flux: item.ch4_kg_ha_day > 0 
        ? { min: 8.0, max: 32.0, baseline: Number((item.ch4_kg_ha_day * 14.2).toFixed(1)), unit: "mg CH₄/m²/h" } 
        : null,
      reeferCargoTemp: { 
        min: Math.max(0, item.reefer_temp_c - 1.5), 
        max: item.reefer_temp_c + 2.0, 
        optimal: item.reefer_temp_c, 
        unit: "°C" 
      },
      reeferCompressorKw: item.needs_cold_storage 
        ? { min: 1.5, max: 6.5, baseline: 3.4, unit: "kW" } 
        : { min: 0.0, max: 0.0, baseline: 0.0, unit: "kW" },
      truckFuelBurn: { min: 26.0, max: 38.0, baseline: 32.0, unit: "L/100km" },
    },
    mitigationLevers: [
      { id: "pm_kusum_solar", name: "PM-KUSUM Off-Grid Solar Pumping Network", reductionPct: 40, stage: "cultivation" },
      { id: "kisan_rail_cold", name: "Indian Railways 'Kisan Rail' Electrified Cold Corridor", reductionPct: 72, stage: "transport" },
      { id: "recycled_packaging", name: "Returnable HDPE Crates / Biodegradable Jute Gunny Sacks", reductionPct: 65, stage: "packaging" },
      { id: "solar_cold_storage", name: "Farm-Gate Solar Cold Storage Room (Thermal PCM)", reductionPct: 55, stage: "retailAndWaste" },
      { id: "precision_nano_urea", name: "IFFCO Nano-Urea Foliar Sprays & Nitrification Inhibitors", reductionPct: 30, stage: "cultivation" },
    ]
  };
});

// Also keep global benchmarks available
CROPS.vine_tomato = {
  id: "vine_tomato",
  region: "global",
  regionName: "Europe (Spain / UK Corridor)",
  commonName: "Vine-Ripened Greenhouse Tomato",
  scientificName: "Solanum lycopersicum",
  category: "Vegetable",
  icon: "🍅",
  description: "High-yield greenhouse vine tomatoes with intensive climate control, cold-chain logistics, and strict temperature-controlled storage.",
  originFarm: {
    name: "SolFresh Smart Agro-Park, Almería",
    location: "Almería, Spain (36.8381° N, 2.4597° W)",
    destination: "New Spitalfields Wholesale Market, London, UK",
    defaultDistanceKm: 2150,
    elevationMeters: 45,
    facilityType: "Closed-Loop Hydroponic High-Tech Greenhouse",
  },
  growthCycleDays: 110,
  averageYieldKgPerM2: 48.5,
  baselineGridCarbon: 265,
  baselineLCA: {
    cultivation: 0.68,
    harvestingProcessing: 0.16,
    packaging: 0.22,
    transport: 0.78,
    retailAndWaste: 0.36,
  },
  telemetryBounds: {
    ambientTemp: { min: 18, max: 28, optimal: 22.5, unit: "°C" },
    relativeHumidity: { min: 60, max: 85, optimal: 72, unit: "%" },
    soilMoisture: { min: 45, max: 70, optimal: 58, unit: "%" },
    solarIrradiance: { min: 150, max: 950, optimal: 650, unit: "W/m²" },
    soilN2OFlux: { min: 0.4, max: 4.8, baseline: 1.85, unit: "mg N₂O/m²/h" },
    reeferCargoTemp: { min: 2.0, max: 5.0, optimal: 3.5, unit: "°C" },
    reeferCompressorKw: { min: 2.5, max: 8.0, baseline: 4.2, unit: "kW" },
    truckFuelBurn: { min: 28.0, max: 38.0, baseline: 32.5, unit: "L/100km" },
  },
  mitigationLevers: [
    { id: "solar_hvac", name: "Rooftop Solar PV + Heat Pump", reductionPct: 38, stage: "cultivation" },
    { id: "precision_n2o", name: "Drip Fertigation with Nitrification Inhibitors", reductionPct: 28, stage: "cultivation" },
    { id: "molded_fiber", name: "Molded Sugarcane Bagasse Pulp Punnets", reductionPct: 75, stage: "packaging" },
    { id: "electric_reefer", name: "Battery-Electric Refrigerated Heavy Truck", reductionPct: 78, stage: "transport" },
    { id: "spoilage_control", name: "Ethylene Scavenger Film", reductionPct: 50, stage: "retailAndWaste" },
  ]
};

CROPS.avocado = {
  id: "avocado",
  region: "global",
  regionName: "North America (Michoacán, Mexico)",
  commonName: "Hass Avocado",
  scientificName: "Persea americana",
  category: "Fruit",
  icon: "🥑",
  description: "Perennial orchard crop requiring extensive irrigation, post-harvest cooling, controlled-atmosphere shipping, and multi-modal refrigerated freight.",
  originFarm: {
    name: "Tancítaro Volcanic Valley Orchard",
    location: "Michoacán, Mexico",
    destination: "Hunts Point Food Terminal, New York, USA",
    defaultDistanceKm: 3800,
    elevationMeters: 1850,
    facilityType: "High-Altitude Rain-Supplemented Orchard",
  },
  growthCycleDays: 365,
  averageYieldKgPerM2: 12.8,
  baselineGridCarbon: 420,
  baselineLCA: {
    cultivation: 0.85,
    harvestingProcessing: 0.24,
    packaging: 0.18,
    transport: 1.15,
    retailAndWaste: 0.48,
  },
  telemetryBounds: {
    ambientTemp: { min: 14, max: 32, optimal: 23.0, unit: "°C" },
    relativeHumidity: { min: 50, max: 80, optimal: 65, unit: "%" },
    soilMoisture: { min: 35, max: 65, optimal: 50, unit: "%" },
    solarIrradiance: { min: 200, max: 1100, optimal: 800, unit: "W/m²" },
    soilN2OFlux: { min: 0.6, max: 5.5, baseline: 2.4, unit: "mg N₂O/m²/h" },
    reeferCargoTemp: { min: 4.5, max: 7.0, optimal: 5.5, unit: "°C" },
    reeferCompressorKw: { min: 3.0, max: 9.5, baseline: 5.0, unit: "kW" },
    truckFuelBurn: { min: 30.0, max: 42.0, baseline: 34.8, unit: "L/100km" },
  },
  mitigationLevers: [
    { id: "solar_pumping", name: "Direct Solar Micro-Sprinkler Irrigation", reductionPct: 42, stage: "cultivation" },
    { id: "recycled_carton", name: "100% Recycled Kraft Corrugated", reductionPct: 60, stage: "packaging" },
    { id: "intermodal_rail", name: "Intermodal Rail Cold-Chain Freight", reductionPct: 62, stage: "transport" },
  ]
};

export const TRANSPORT_MODALITIES = [
  {
    id: "tata_ambient_truck",
    name: "Tata / Ashok Leyland BS-VI Diesel (Ambient Open-Body Mandi Freight)",
    icon: "🚚",
    emissionFactorGramPerTkm: 125,
    reeferFuelLitersPerHour: 0.0,
    refrigerantType: "None (Ambient Air Flow - High Spoilage Risk)",
    refrigerantLeakageGramPerYear: 0,
    averageSpeedKmH: 52,
    fuelCostPer100km: 42.0,
    carbonIntensityBadge: "High Ambient Spoilage",
    badgeColor: "#dc2626",
  },
  {
    id: "diesel_reefer_truck",
    name: "Conventional Diesel Reefer Truck (Euro VI / BS-VI)",
    icon: "🚛",
    emissionFactorGramPerTkm: 118,
    reeferFuelLitersPerHour: 2.8,
    refrigerantType: "R404A (High GWP = 3922)",
    refrigerantLeakageGramPerYear: 350,
    averageSpeedKmH: 74,
    fuelCostPer100km: 55.2,
    carbonIntensityBadge: "High Carbon",
    badgeColor: "#dc2626",
  },
  {
    id: "kisan_rail_reefer",
    name: "Indian Railways 'Kisan Rail' Electrified Reefer (94% Electrified Grid)",
    icon: "🚆",
    emissionFactorGramPerTkm: 16,
    reeferFuelLitersPerHour: 0.0,
    refrigerantType: "Propane R290 (GWP = 3)",
    refrigerantLeakageGramPerYear: 0,
    averageSpeedKmH: 68,
    fuelCostPer100km: 18.0,
    carbonIntensityBadge: "Ultra-Low Rail",
    badgeColor: "#16a34a",
  },
  {
    id: "ev_cargo_3w",
    name: "Last-Mile Commercial EV Cargo (Euler HiLoad / Mahindra Treo Zor)",
    icon: "⚡",
    emissionFactorGramPerTkm: 22,
    reeferFuelLitersPerHour: 0.0,
    refrigerantType: "Solid-State / Direct DC Chiller",
    refrigerantLeakageGramPerYear: 0,
    averageSpeedKmH: 42,
    fuelCostPer100km: 9.5,
    carbonIntensityBadge: "Zero Tailpipe",
    badgeColor: "#0284c7",
  },
  {
    id: "electric_reefer_truck",
    name: "Heavy Battery-Electric Reefer Truck (BEV 40T)",
    icon: "⚡",
    emissionFactorGramPerTkm: 24,
    reeferFuelLitersPerHour: 0.0,
    refrigerantType: "CO2 Transcritical R744 (Natural, GWP = 1)",
    refrigerantLeakageGramPerYear: 0,
    averageSpeedKmH: 74,
    fuelCostPer100km: 28.5,
    carbonIntensityBadge: "Ultra-Low Carbon",
    badgeColor: "#0284c7",
  },
  {
    id: "hvo_biodiesel_truck",
    name: "HVO100 Renewable Bio-Diesel Reefer Truck",
    icon: "🌱",
    emissionFactorGramPerTkm: 38,
    reeferFuelLitersPerHour: 2.6,
    refrigerantType: "R452A (Lower GWP = 2140)",
    refrigerantLeakageGramPerYear: 280,
    averageSpeedKmH: 78,
    fuelCostPer100km: 62.0,
    carbonIntensityBadge: "Low Carbon",
    badgeColor: "#16a34a",
  }
];

export const PACKAGING_OPTIONS = [
  {
    id: "jute_gunny_bag",
    name: "Indigenous West Bengal Jute Gunny Sack (Biodegradable & Carbon Negative Sink)",
    carbonFactorKgCO2PerKgProduct: 0.02,
    recyclabilityPct: 100,
    plasticWeightGrams: 0,
  },
  {
    id: "hdpe_mandi_crate",
    name: "Returnable Mandi HDPE Perforated Agri-Crate (Reusable 100+ Cycles)",
    carbonFactorKgCO2PerKgProduct: 0.035,
    recyclabilityPct: 96,
    plasticWeightGrams: 0,
  },
  {
    id: "cfb_telescopic_carton",
    name: "Export-Grade Telescopic Corrugated Fiberboard (CFB) Box",
    carbonFactorKgCO2PerKgProduct: 0.11,
    recyclabilityPct: 90,
    plasticWeightGrams: 12,
  },
  {
    id: "single_use_plastic",
    name: "Virgin Polypropylene (PP) Punnet + Flow-Wrap Film",
    carbonFactorKgCO2PerKgProduct: 0.22,
    recyclabilityPct: 32,
    plasticWeightGrams: 28,
  },
  {
    id: "recycled_rpet",
    name: "100% Post-Consumer Recycled rPET Clamshell",
    carbonFactorKgCO2PerKgProduct: 0.11,
    recyclabilityPct: 88,
    plasticWeightGrams: 24,
  },
  {
    id: "molded_fiber_compostable",
    name: "Molded Sugarcane Bagasse Fiber + Cellulose Netting",
    carbonFactorKgCO2PerKgProduct: 0.045,
    recyclabilityPct: 100,
    plasticWeightGrams: 0,
  }
];

export const FARMING_PRACTICES = [
  {
    id: "pm_kusum_solar",
    name: "PM-KUSUM Off-Grid Solar Pumping + Precision Drip & Neem-Coated Urea",
    cultivationMultiplier: 0.52,
    soilN2OMultiplier: 0.45,
  },
  {
    id: "awd_dsr_regenerative",
    name: "Alternate Wetting & Drying (AWD) / Direct Seeded Rice (DSR) + Zero Stubble Burn",
    cultivationMultiplier: 0.42,
    soilN2OMultiplier: 0.35,
  },
  {
    id: "conventional_fossil",
    name: "Conventional Fossil Grid (CEA 716 g/kWh) & Heavy Synthetic Urea",
    cultivationMultiplier: 1.0,
    soilN2OMultiplier: 1.0,
  },
  {
    id: "integrated_pest_precision",
    name: "Integrated Precision Drip with Nitrification Inhibitor",
    cultivationMultiplier: 0.78,
    soilN2OMultiplier: 0.65,
  },
  {
    id: "regenerative_solar_microgrid",
    name: "Regenerative Solar Microgrid + Biochar Composting",
    cultivationMultiplier: 0.48,
    soilN2OMultiplier: 0.35,
  }
];
