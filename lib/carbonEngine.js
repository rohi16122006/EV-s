// lib/carbonEngine.js - Agricultural Life Cycle Assessment & Real-Time Telemetry Engine
// Fully calibrated for Kaggle Benchmark Datasets ("Food_Production.csv") & Indian Conditions
import { CROPS, TRANSPORT_MODALITIES, PACKAGING_OPTIONS, FARMING_PRACTICES } from "./cropsData";

/**
 * Calculates complete 5-stage Life Cycle Assessment (LCA) in kg CO2e / kg of harvested produce
 */
export function calculateLCA({
  cropId = "banana",
  batchSizeKg = 5000,
  transportDistanceKm = null,
  transportModeId = "tata_ambient_truck",
  packagingId = "cfb_telescopic_carton",
  farmingPracticeId = "conventional_fossil",
  activeMitigations = [],
  telemetryAdjustments = null,
}) {
  const crop = CROPS[cropId] || CROPS.banana;
  const transportMode = TRANSPORT_MODALITIES.find((t) => t.id === transportModeId) || TRANSPORT_MODALITIES[0];
  const packaging = PACKAGING_OPTIONS.find((p) => p.id === packagingId) || PACKAGING_OPTIONS[0];
  const farmingPractice = FARMING_PRACTICES.find((f) => f.id === farmingPracticeId) || FARMING_PRACTICES[0];

  const distance = transportDistanceKm !== null ? Number(transportDistanceKm) : crop.originFarm.defaultDistanceKm;

  // 1. Cultivation Stage
  let cultivationBase = crop.baselineLCA.cultivation * farmingPractice.cultivationMultiplier;
  
  // Real-time telemetry adjustment (soil N2O flux or CH4 methane flux)
  if (telemetryAdjustments?.soilN2OFluxRatio) {
    cultivationBase *= (0.6 + 0.4 * telemetryAdjustments.soilN2OFluxRatio);
  }
  if (telemetryAdjustments?.gridCarbonRatio) {
    // 35% of cultivation is electricity/irrigation pumping
    cultivationBase = cultivationBase * 0.65 + cultivationBase * 0.35 * telemetryAdjustments.gridCarbonRatio;
  }
  
  // Apply active mitigations for cultivation
  activeMitigations.forEach((mitId) => {
    const mit = crop.mitigationLevers.find((m) => m.id === mitId && m.stage === "cultivation");
    if (mit) {
      cultivationBase *= 1 - mit.reductionPct / 100;
    }
  });

  // 2. Harvesting & Processing Stage
  let processingBase = crop.baselineLCA.harvestingProcessing;
  activeMitigations.forEach((mitId) => {
    const mit = crop.mitigationLevers.find((m) => m.id === mitId && m.stage === "harvestingProcessing");
    if (mit) {
      processingBase *= 1 - mit.reductionPct / 100;
    }
  });

  // 3. Packaging Stage
  let packagingBase = packaging.carbonFactorKgCO2PerKgProduct;
  activeMitigations.forEach((mitId) => {
    const mit = crop.mitigationLevers.find((m) => m.id === mitId && m.stage === "packaging");
    if (mit) {
      packagingBase *= 1 - mit.reductionPct / 100;
    }
  });

  // 4. Transport & Logistics Stage
  const baselineDistance = crop.originFarm.defaultDistanceKm || 1000;
  const transportFactorRatio = transportMode.emissionFactorGramPerTkm / 118;
  const distanceRatio = distance / baselineDistance;
  let transportBase = crop.baselineLCA.transport * transportFactorRatio * distanceRatio;

  if (telemetryAdjustments?.reeferCompressorKwRatio && transportMode.reeferFuelLitersPerHour > 0) {
    transportBase *= 0.85 + 0.15 * telemetryAdjustments.reeferCompressorKwRatio;
  }
  activeMitigations.forEach((mitId) => {
    const mit = crop.mitigationLevers.find((m) => m.id === mitId && m.stage === "transport");
    if (mit) {
      transportBase *= 1 - mit.reductionPct / 100;
    }
  });

  // 5. Retail & Post-Consumer Waste Stage (Spoilage Loss)
  let retailWasteBase = crop.baselineLCA.retailAndWaste;
  
  // Ambient transport penalty for highly perishable produce like bananas/tomatoes under tropical heat
  if (transportMode.id === "tata_ambient_truck" && (crop.id === "kolar_tomato" || crop.id === "tomato" || crop.id === "strawberry")) {
    retailWasteBase *= 1.25;
  }

  activeMitigations.forEach((mitId) => {
    const mit = crop.mitigationLevers.find((m) => m.id === mitId && m.stage === "retailAndWaste");
    if (mit) {
      retailWasteBase *= 1 - mit.reductionPct / 100;
    }
  });

  // Round values
  const cultivation = Math.max(0.02, Number(cultivationBase.toFixed(3)));
  const processing = Math.max(0.01, Number(processingBase.toFixed(3)));
  const packagingFinal = Math.max(0.01, Number(packagingBase.toFixed(3)));
  const transport = Math.max(0.01, Number(transportBase.toFixed(3)));
  const retailAndWaste = Math.max(0.01, Number(retailWasteBase.toFixed(3)));

  const totalPerKg = Number((cultivation + processing + packagingFinal + transport + retailAndWaste).toFixed(3));
  const batchTotalKgCO2e = Number((totalPerKg * batchSizeKg).toFixed(1));
  const batchTotalTonnes = Number((batchTotalKgCO2e / 1000).toFixed(2));

  // Baseline comparison
  const baselineTotalPerKg = Number(
    (
      crop.baselineLCA.cultivation +
      crop.baselineLCA.harvestingProcessing +
      crop.baselineLCA.packaging +
      crop.baselineLCA.transport +
      crop.baselineLCA.retailAndWaste
    ).toFixed(3)
  );

  const carbonReductionPercent = Number((((baselineTotalPerKg - totalPerKg) / baselineTotalPerKg) * 100).toFixed(1));

  // Determine Eco-Grade (A+ to E)
  let ecoGrade = "C";
  let ecoGradeColor = "#d97706";
  let ecoGradeLabel = "Standard Industry Baseline";

  if (totalPerKg < 0.65) {
    ecoGrade = "A+";
    ecoGradeColor = "#16a34a";
    ecoGradeLabel = "Exemplary Low Carbon";
  } else if (totalPerKg < 1.1) {
    ecoGrade = "A";
    ecoGradeColor = "#16a34a";
    ecoGradeLabel = "Low Carbon Certified";
  } else if (totalPerKg < 1.65) {
    ecoGrade = "B";
    ecoGradeColor = "#65a30d";
    ecoGradeLabel = "Below Average Emissions";
  } else if (totalPerKg < 2.4) {
    ecoGrade = "C";
    ecoGradeColor = "#d97706";
    ecoGradeLabel = "Standard Industry Baseline";
  } else if (totalPerKg < 3.2) {
    ecoGrade = "D";
    ecoGradeColor = "#ea580c";
    ecoGradeLabel = "Elevated Carbon Intensity";
  } else {
    ecoGrade = "E";
    ecoGradeColor = "#dc2626";
    ecoGradeLabel = "High Carbon Intensity";
  }

  // Equivalent impact benchmarks
  const carMilesEquivalent = Math.round(batchTotalKgCO2e / 0.21);
  const treesYearsToOffset = Number((batchTotalKgCO2e / 22.0).toFixed(1));
  const dieselLitersBurned = Number((batchTotalKgCO2e / 2.68).toFixed(1));

  return {
    crop: {
      id: crop.id,
      region: crop.region,
      regionName: crop.regionName,
      commonName: crop.commonName,
      scientificName: crop.scientificName,
      originFarm: crop.originFarm,
      kaggleVerified: crop.kaggleVerified || false,
      kaggleData: crop.kaggleData || null,
    },
    batchSizeKg,
    transportDistanceKm: distance,
    transportMode,
    packaging,
    farmingPractice,
    stages: {
      cultivation: {
        kgCO2e: cultivation,
        pct: Number(((cultivation / totalPerKg) * 100).toFixed(1)),
        title: "Growth & Cultivation",
        description: crop.id === "basmati_rice" 
          ? "Anaerobic soil methanogenesis (CH₄), deep groundwater borewell pumping, synthetic urea fertilization."
          : "Soil N₂O nitrification flux, groundwater irrigation pumping, synthetic fertilizer synthesis.",
      },
      processing: {
        kgCO2e: processing,
        pct: Number(((processing / totalPerKg) * 100).toFixed(1)),
        title: "Harvest & Post-Harvest Facility",
        description: crop.id === "banana"
          ? "De-handing, alum post-harvest washing, fungicidal treatment, forced-air pre-cooling."
          : "Harvest fuel, parboiling/milling, mechanical grading, optical sorting, washing.",
      },
      packaging: {
        kgCO2e: packagingFinal,
        pct: Number(((packagingFinal / totalPerKg) * 100).toFixed(1)),
        title: "Primary & Secondary Packaging",
        description: crop.id === "banana"
          ? "Telescopic Corrugated Fiberboard (CFB) master carton with micro-perforated liner."
          : "Material extraction, polymer synthesis, natural jute fiber harvesting, or corrugated carton manufacturing.",
      },
      transport: {
        kgCO2e: transport,
        pct: Number(((transport / totalPerKg) * 100).toFixed(1)),
        title: "Transit & Mandi Logistics",
        description: "Highway freight fuel combustion, electrified railway grid traction, or urban delivery fleet.",
      },
      retailAndWaste: {
        kgCO2e: retailAndWaste,
        pct: Number(((retailAndWaste / totalPerKg) * 100).toFixed(1)),
        title: "Mandi Display & Spoilage Loss",
        description: crop.id === "banana"
          ? "Controlled ethylene ripening chambers (13.5°C), retail shelf life decay, consumer discarded peel."
          : "Ambient heat decay, wholesale terminal handling, shelf degradation, and landfill disposal.",
      },
    },
    totalPerKg,
    batchTotalKgCO2e,
    batchTotalTonnes,
    baselineTotalPerKg,
    carbonReductionPercent,
    ecoGrade,
    ecoGradeColor,
    ecoGradeLabel,
    equivalents: {
      carMilesEquivalent,
      treesYearsToOffset,
      dieselLitersBurned,
    },
  };
}

/**
 * Generates dynamic, realistic real-time telemetry simulating active IoT sensors, regional grid emissions, and freight
 */
export function generateLiveTelemetry(cropId = "banana", tickCount = 0) {
  const crop = CROPS[cropId] || CROPS.banana;
  const bounds = crop.telemetryBounds;
  const baseGrid = crop.baselineGridCarbon || 716;

  // Sinusoidal day/night and stochastic sensor fluctuations
  const time = Date.now() / 1000;
  const wave = Math.sin(time / 20);
  const microWave = Math.sin(time / 4) * 0.5 + Math.cos(time / 7) * 0.5;

  // Farm environmental telemetry
  const ambientTemp = Number((bounds.ambientTemp.optimal + wave * 3.5 + microWave * 0.8).toFixed(1));
  const relativeHumidity = Math.round(bounds.relativeHumidity.optimal - wave * 6 + microWave * 3);
  const soilMoisture = Number((bounds.soilMoisture.optimal + microWave * 2.2).toFixed(1));
  const solarIrradiance = Math.max(0, Math.round(bounds.solarIrradiance.optimal + wave * 220 + microWave * 45));

  // Soil N2O flux (mg N2O/m2/h)
  const soilN2OFlux = Number((bounds.soilN2OFlux.baseline + (wave > 0 ? wave * 0.45 : 0) + microWave * 0.2).toFixed(2));

  // Soil Methane flux for flooded crops (e.g. Basmati Rice)
  let soilCH4Flux = null;
  if (bounds.soilCH4Flux) {
    soilCH4Flux = Number((bounds.soilCH4Flux.baseline + (wave > 0 ? wave * 3.2 : 0) + microWave * 1.5).toFixed(1));
  }

  // Regional power grid carbon intensity (CEA Baseline v19 ~716 gCO2/kWh in India)
  const solarShare = Math.min(0.85, Math.max(0.15, solarIrradiance / 1000));
  const gridCarbonIntensity = Math.round(baseGrid * (1 - solarShare * 0.55) + (microWave * 15));

  // Transport fleet telemetry
  const tripProgressPct = ((tickCount * 1.5 + 38) % 100);
  const truckSpeed = tripProgressPct > 98 ? 0 : Math.round((crop.region === "india" ? 54 : 76) + microWave * 6);
  const reeferCargoTemp = Number((bounds.reeferCargoTemp.optimal + microWave * 0.35).toFixed(1));
  const reeferCompressorKw = Number((bounds.reeferCompressorKw.baseline + (ambientTemp > 30 ? 1.4 : 0) + microWave * 0.4).toFixed(1));
  const truckFuelBurn = Number((bounds.truckFuelBurn.baseline + (truckSpeed > 60 ? 1.8 : -0.8) + microWave * 0.8).toFixed(1));

  // Real-time instantaneous emissions
  const n2oHourlyCO2e = soilN2OFlux * 273 * 0.001 * 10;
  const ch4HourlyCO2e = soilCH4Flux ? (soilCH4Flux * 28 * 0.001 * 10) : 0;
  const gridHourlyCO2e = gridCarbonIntensity * 0.001 * 14;
  const farmHourlyCO2e = Number((n2oHourlyCO2e + ch4HourlyCO2e + gridHourlyCO2e).toFixed(2));

  // Freight instantaneous kg CO2e / hour
  const freightHourlyCO2e = Number(((truckFuelBurn * 2.68 * (truckSpeed / 100)) + (reeferCompressorKw * 0.42)).toFixed(2));

  // Cold chain integrity check
  let coldChainStatus = "optimal";
  let coldChainMessage = "Cargo conditions within expected thermal envelope.";
  
  if (crop.id === "banana") {
    if (reeferCargoTemp < 13.0) {
      coldChainStatus = "critical";
      coldChainMessage = `Warning: Cargo temperature dropped to ${reeferCargoTemp}°C! Below 13°C causes irreversible banana chilling injury (under-peel darkening).`;
    } else if (reeferCargoTemp > 16.0) {
      coldChainStatus = "caution";
      coldChainMessage = `Notice: Cargo temperature at ${reeferCargoTemp}°C. Premature banana ripening risk increased.`;
    }
  } else if (crop.id === "kolar_tomato" && reeferCargoTemp > 30) {
    coldChainStatus = "caution";
    coldChainMessage = `Notice: Ambient transit in tropical heat (${reeferCargoTemp}°C). High respiration rate causing accelerated tomato softening.`;
  } else if (bounds.reeferCargoTemp.max > 0 && reeferCargoTemp > bounds.reeferCargoTemp.max) {
    coldChainStatus = "critical";
    coldChainMessage = `Warning: Cargo temperature at ${reeferCargoTemp}°C exceeds max limit of ${bounds.reeferCargoTemp.max}°C! Spoilage risk escalated.`;
  }

  // Alerts
  const alerts = [];
  if (crop.id === "banana") {
    alerts.push({
      id: "kaggle_verified_badge",
      type: "info",
      title: "Kaggle Dataset Benchmark Active",
      message: `Calibrated with Kaggle 'Food_Production.csv' (Poore & Nemecek): Total LCA 0.86 kg CO₂e/kg, Freshwater: 114.5 L/kg, Land: 1.93 m²/kg.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  if (solarIrradiance > 750) {
    alerts.push({
      id: "solar_peak",
      type: "success",
      title: crop.region === "india" ? "PM-KUSUM Solar Generation Peak" : "Clean Agrivoltaic Generation",
      message: `Solar peak detected (${solarIrradiance} W/m²). Irrigation tube-wells running 100% on off-grid solar, displacing coal grid.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  if (ambientTemp > 38.0) {
    alerts.push({
      id: "heatwave_alert",
      type: "warning",
      title: "Tropical Heatwave Alert",
      message: `Ambient temperature reached ${ambientTemp}°C. Produce post-harvest respiration rate increased by 2.4×. Pre-cooling recommended.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  return {
    timestamp: new Date().toISOString(),
    cropId: crop.id,
    cropName: crop.commonName,
    tickCount,
    farm: {
      farmName: crop.originFarm.name,
      location: crop.originFarm.location,
      regionName: crop.regionName,
      ambientTemp,
      relativeHumidity,
      soilMoisture,
      solarIrradiance,
      soilN2OFlux,
      soilCH4Flux,
      gridCarbonIntensity,
      baselineGridCarbon: baseGrid,
      farmHourlyCO2e,
      powerSource: solarIrradiance > 600 
        ? "PM-KUSUM Solar Microgrid (0 gCO₂/kWh)" 
        : `Regional Coal Grid (${gridCarbonIntensity} gCO₂/kWh)`,
    },
    transport: {
      vehicleId: crop.region === "india" ? "MH-19-TR-4288 (Banana Cargo)" : "REEFER-SMART-884X",
      destination: crop.originFarm.destination,
      totalDistanceKm: crop.originFarm.defaultDistanceKm,
      tripProgressPct: Number(tripProgressPct.toFixed(1)),
      truckSpeed,
      reeferCargoTemp,
      reeferCompressorKw,
      truckFuelBurn,
      freightHourlyCO2e,
      coldChainStatus,
      coldChainMessage,
    },
    instantaneousMetrics: {
      totalHourlyCO2e: Number((farmHourlyCO2e + freightHourlyCO2e).toFixed(2)),
      soilN2OFluxRatio: Number((soilN2OFlux / bounds.soilN2OFlux.baseline).toFixed(3)),
      gridCarbonRatio: Number((gridCarbonIntensity / baseGrid).toFixed(3)),
      reeferCompressorKwRatio: bounds.reeferCompressorKw.baseline > 0 
        ? Number((reeferCompressorKw / bounds.reeferCompressorKw.baseline).toFixed(3)) 
        : 1.0,
    },
    alerts,
  };
}
