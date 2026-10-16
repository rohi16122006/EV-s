// app/page.js - Simple, Clean, Light-Themed Agricultural Carbon Tracker
// Single Clean Dropdown Selector powered by the 61-Crop Indian Master Dataset
"use client";

import { useState, useEffect } from "react";
import { CROPS, TRANSPORT_MODALITIES, PACKAGING_OPTIONS, FARMING_PRACTICES, INDIAN_CROPS_DATA } from "@/lib/cropsData";
import { calculateLCA, generateLiveTelemetry } from "@/lib/carbonEngine";
import {
  Leaf,
  Thermometer,
  Wind,
  Zap,
  Truck,
  TrendingDown,
  FileText,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Flame,
  MapPin,
  Database,
  Table,
  Snowflake,
} from "lucide-react";

export default function Home() {
  const [activeCropId, setActiveCropId] = useState("banana"); // Featured fruit: Banana
  const [isStreaming, setIsStreaming] = useState(true);
  const [tick, setTick] = useState(0);

  // Supply chain choices
  const [farmingId, setFarmingId] = useState("conventional_fossil");
  const [transportId, setTransportId] = useState("diesel_reefer_truck");
  const [packagingId, setPackagingId] = useState("cfb_telescopic_carton");

  // Telemetry, LCA, & Modal states
  const [telemetry, setTelemetry] = useState(null);
  const [lca, setLca] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showDatasetTable, setShowDatasetTable] = useState(false);

  const crop = CROPS[activeCropId] || CROPS.banana;
  const row = crop.cropDataRow || {};

  // Sync default options when crop changes
  useEffect(() => {
    if (row.needs_cold_storage === 1) {
      setTransportId("diesel_reefer_truck");
    } else {
      setTransportId("tata_ambient_truck");
    }

    if (row.category === "Fruit") {
      setPackagingId("cfb_telescopic_carton");
    } else if (row.category === "Vegetable") {
      setPackagingId("hdpe_mandi_crate");
    } else {
      setPackagingId("jute_gunny_bag");
    }
  }, [activeCropId]);

  // Stream live data every 3 seconds
  useEffect(() => {
    const frame = generateLiveTelemetry(activeCropId, tick);
    setTelemetry(frame);
  }, [activeCropId]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setTick((t) => {
        const next = t + 1;
        setTelemetry(generateLiveTelemetry(activeCropId, next));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isStreaming, activeCropId]);

  // Recalculate LCA dynamically
  useEffect(() => {
    const adjustments = telemetry?.instantaneousMetrics
      ? {
          soilN2OFluxRatio: telemetry.instantaneousMetrics.soilN2OFluxRatio,
          gridCarbonRatio: telemetry.instantaneousMetrics.gridCarbonRatio,
          reeferCompressorKwRatio: telemetry.instantaneousMetrics.reeferCompressorKwRatio,
        }
      : null;

    const res = calculateLCA({
      cropId: activeCropId,
      batchSizeKg: 5000,
      transportDistanceKm: crop.originFarm.defaultDistanceKm,
      transportModeId: transportId,
      packagingId: packagingId,
      farmingPracticeId: farmingId,
      activeMitigations: [],
      telemetryAdjustments: adjustments,
    });
    setLca(res);
  }, [activeCropId, farmingId, transportId, packagingId, telemetry]);

  if (!lca || !telemetry) return null;

  const farm = telemetry.farm || {};
  const transport = telemetry.transport || {};
  const stages = lca.stages || {};
  const alerts = telemetry.alerts || [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* 1. Header Navbar - Clean, Light */}
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: "0.9rem 0",
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #bbf7d0",
              }}
            >
              <Leaf size={20} color="#15803d" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#0f172a" }}>
                  Crop<span style={{ color: "#16a34a" }}>Carbon</span>
                </span>
                <span
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Database size={12} /> 61 Indian Crops Dataset
                </span>
              </div>
              <span style={{ color: "#64748b", fontSize: "0.76rem" }}>
                Empirical Agricultural Carbon & Cold-Chain Tracker
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              onClick={() => setShowDatasetTable(true)}
              className="btn btn-outline"
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem" }}
              title="View all 61 crops in a master table"
            >
              <Table size={15} />
              <span>Dataset Table</span>
            </button>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="live-badge"
              style={{ cursor: "pointer" }}
              title="Click to pause or resume real-time sensor updates"
            >
              <span className="live-dot" />
              <span>{isStreaming ? "Live Feed Active" : "Feed Paused"}</span>
            </button>

            <button
              onClick={() => setShowReport(true)}
              className="btn btn-primary"
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.95rem" }}
            >
              <FileText size={15} />
              <span>Summary Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="container"
        style={{
          padding: "2rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
          flex: 1,
        }}
      >
        {/* Step 1: Clean, Single Dropdown for All 61 Crops */}
        <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#15803d",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Step 1 • Select Crop
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                Choose Produce from 61 Indian Crops Dataset
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#15803d",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              <MapPin size={15} />
              <span>
                {crop.originFarm.name} → {crop.originFarm.destination?.split("(")[0]} ({crop.originFarm.defaultDistanceKm} km)
              </span>
            </div>
          </div>

          {/* THE SINGLE CLEAN DROPDOWN */}
          <div>
            <select
              className="select-input"
              value={activeCropId}
              onChange={(e) => setActiveCropId(e.target.value)}
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid #16a34a",
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                color: "#0f172a",
                cursor: "pointer",
              }}
            >
              <optgroup label="🍎 Fruits (10 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Fruit").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha (Target Reefer: {c.reefer_temp_c}°C)
                  </option>
                ))}
              </optgroup>

              <optgroup label="🥦 Vegetables (14 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Vegetable").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>

              <optgroup label="🌾 Cereals (7 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Cereal").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>

              <optgroup label="🫘 Pulses (6 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Pulse").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>

              <optgroup label="🌻 Oilseeds (6 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Oilseed").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>

              <optgroup label="🧄 Spices (8 Crops)">
                {INDIAN_CROPS_DATA.filter((c) => c.category === "Spice").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>

              <optgroup label="☕ Plantation & Cash Crops (10 Crops)">
                {INDIAN_CROPS_DATA.filter(
                  (c) => c.category === "Plantation" || c.category === "Cash crop" || c.category === "Fibre"
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.crop} • Yield: {c.yield_kg_ha.toLocaleString()} kg/ha
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Context Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.85rem",
              fontSize: "0.82rem",
              color: "#475569",
              paddingTop: "0.6rem",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <div>
              <strong>Producing States:</strong> {row.top_states}
            </div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span>Season: <strong>{row.season}</strong></span>
              <span>•</span>
              <span>Growth: <strong>{row.growth_days} days</strong></span>
              <span>•</span>
              <span>
                Storage:{" "}
                <strong style={{ color: row.needs_cold_storage ? "#0284c7" : "#475569" }}>
                  {row.needs_cold_storage ? `Reefer at ${row.reefer_temp_c}°C` : "Ambient"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Dataset Parameter Ground-Truth Card */}
        {row.yield_kg_ha && (
          <div
            className="card"
            style={{
              borderLeft: "5px solid #16a34a",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "6px",
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Database size={16} color="#15803d" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                    Dataset Parameters: {crop.commonName}
                  </h3>
                  <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                    Agronomic inputs, water balance, and cold-chain values from the master dataset
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {row.needs_cold_storage === 1 ? (
                  <span
                    style={{
                      fontSize: "0.74rem",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #bae6fd",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Snowflake size={12} /> Reefer Temp: {row.reefer_temp_c}°C
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "0.74rem",
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontWeight: 600,
                    }}
                  >
                    Ambient Storage
                  </span>
                )}
              </div>
            </div>

            {/* 8-Tile Agronomic Parameter Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {/* Tile 1: Yield */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>ANNUAL YIELD</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {row.yield_kg_ha?.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>kg/ha</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#16a34a" }}>Season: {row.season}</div>
              </div>

              {/* Tile 2: Nitrogen Fertilizer */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>NITROGEN INPUT</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {row.n_kg_ha} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>kg N/ha</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {((row.n_kg_ha * 7.29) / row.yield_kg_ha).toFixed(3)} kg CO₂e/kg
                </div>
              </div>

              {/* Tile 3: Growth Cycle & Kc */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>GROWTH DAYS & Kc</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {row.growth_days} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>days</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#0284c7" }}>Crop Kc Factor: {row.kc}</div>
              </div>

              {/* Tile 4: Irrigated Share */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#0284c7", fontWeight: 600 }}>IRRIGATED SHARE</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0284c7", marginTop: "2px" }}>
                  {Math.round(row.irrigated_share * 100)}%
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Grid Pumping Power</div>
              </div>

              {/* Tile 5: On-farm Diesel */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>FARM DIESEL BURN</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {row.diesel_l_ha} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>L/ha</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {((row.diesel_l_ha * 2.68) / row.yield_kg_ha).toFixed(3)} kg CO₂e/kg
                </div>
              </div>

              {/* Tile 6: Handling Loss */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>HANDLING LOSS</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#dc2626", marginTop: "2px" }}>
                  {row.handling_loss_pct}%
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Field-to-truck loss</div>
              </div>

              {/* Tile 7: Spoilage Rate at 13°C */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "#d97706", fontWeight: 600 }}>DAILY SPOILAGE</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#d97706", marginTop: "2px" }}>
                  {row.spoil_rate_pct_day_13c}% <span style={{ fontSize: "0.72rem", fontWeight: 500 }}>/day</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>@ 13°C storage</div>
              </div>

              {/* Tile 8: Methane or Pesticide */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: row.ch4_kg_ha_day > 0 ? "#dc2626" : "#64748b", fontWeight: 600 }}>
                  {row.ch4_kg_ha_day > 0 ? "METHANE FLUX" : "PESTICIDE ACTIVE"}
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: row.ch4_kg_ha_day > 0 ? "#dc2626" : "#0f172a",
                    marginTop: "2px",
                  }}
                >
                  {row.ch4_kg_ha_day > 0 ? `${row.ch4_kg_ha_day} kg/d` : `${row.pest_kg_ai_ha} kg/ha`}
                </div>
                <div style={{ fontSize: "0.72rem", color: row.ch4_kg_ha_day > 0 ? "#dc2626" : "#64748b" }}>
                  {row.ch4_kg_ha_day > 0 ? "28× GWP Methanogenesis" : "Crop protection input"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Real-time Live Sensor & Grid Telemetry */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#15803d",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Step 2 • Real-Time Field & Energy Telemetry
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                Live Sensors & Cold-Chain Monitoring
              </h2>
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  background: "#f1f5f9",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                CEA Grid Baseline: {crop.baselineGridCarbon || 716} g/kWh
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: farm.soilCH4Flux
                ? "repeat(auto-fit, minmax(170px, 1fr))"
                : "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* Metric 1: Field Temperature */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#0284c7",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                <Thermometer size={15} />
                <span>Field Temperature</span>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                {farm.ambientTemp}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Humidity: {farm.relativeHumidity}% RH
              </div>
            </div>

            {/* Metric 2: Soil N2O Flux */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#166534",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                <Wind size={15} />
                <span>Soil N₂O Flux</span>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#15803d" }}>
                {farm.soilN2OFlux} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>mg/m²/h</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#166534" }}>
                N Input: {row.n_kg_ha} kg/ha
              </div>
            </div>

            {/* Metric 2B (If Paddy): Soil Methane CH4 Flux */}
            {farm.soilCH4Flux && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "#dc2626",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginBottom: "0.3rem",
                  }}
                >
                  <Flame size={15} />
                  <span>Paddy CH₄ Methane</span>
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#b91c1c" }}>
                  {farm.soilCH4Flux} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>mg/m²/h</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#b91c1c" }}>
                  Rate: {row.ch4_kg_ha_day} kg/ha/day
                </div>
              </div>
            )}

            {/* Metric 3: Regional Grid Carbon */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "1rem", borderRadius: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#b45309",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                <Zap size={15} />
                <span>Grid Carbon Factor</span>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#92400e" }}>
                {farm.gridCarbonIntensity} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>gCO₂/kWh</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#b45309" }}>
                {farm.solarIrradiance > 600 ? "☀️ PM-KUSUM Solar Active" : "Thermal Grid Standard"}
              </div>
            </div>

            {/* Metric 4: Transport Fleet & Cargo Envelope */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#2563eb",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                <Truck size={15} />
                <span>Transit Cargo Temp</span>
              </div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color:
                    transport.coldChainStatus === "critical"
                      ? "#dc2626"
                      : transport.coldChainStatus === "caution"
                      ? "#d97706"
                      : "#0f172a",
                }}
              >
                {transport.reeferCargoTemp}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Target: {row.reefer_temp_c}°C • Speed: {transport.truckSpeed} km/h
              </div>
            </div>
          </div>

          {/* Active Sensor Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {alerts.map((al) => (
                <div
                  key={al.id}
                  style={{
                    background: al.type === "warning" ? "#fffbeb" : al.type === "error" ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${
                      al.type === "warning" ? "#fde68a" : al.type === "error" ? "#fecaca" : "#bbf7d0"
                    }`,
                    borderRadius: "6px",
                    padding: "0.65rem 0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.84rem",
                    color: al.type === "warning" ? "#92400e" : al.type === "error" ? "#b91c1c" : "#166534",
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    <strong>{al.title}:</strong> {al.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Total Carbon LCA Calculation */}
        <div className="card" style={{ borderLeft: `6px solid ${lca.ecoGradeColor}` }}>
          <div
            style={{
              fontSize: "0.82rem",
              color: "#15803d",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            Step 3 • Life Cycle Assessment (LCA) Carbon Result
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                <span style={{ fontSize: "3.2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {lca.totalPerKg}
                </span>
                <span style={{ fontSize: "1.1rem", color: "#475569", fontWeight: 500 }}>
                  kg CO₂e per 1 kg of {crop.commonName}
                </span>
              </div>
              <p style={{ color: lca.ecoGradeColor, fontWeight: 700, fontSize: "0.95rem", marginTop: "0.4rem" }}>
                Eco-Grade: {lca.ecoGrade} • {lca.ecoGradeLabel}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                BATCH FOOTPRINT (5,000 KG HARVEST)
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                {lca.batchTotalTonnes}{" "}
                <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#64748b" }}>
                  Tonnes CO₂e
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#15803d", fontWeight: 600 }}>
                Neutralized by {lca.equivalents.treesYearsToOffset} Tree-Years
              </div>
            </div>
          </div>

          {/* 5-Stage Life Cycle Pipeline Breakdown */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.85rem" }}>
              Emissions by Supply Chain Stage:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[
                { label: "1. Growth & Cultivation (Fertilizer N, Diesel & Irrigation)", data: stages.cultivation, color: "#16a34a" },
                { label: "2. Harvesting & Processing (Grading, Washing & Staging)", data: stages.processing, color: "#0284c7" },
                { label: "3. Packaging Materials (CFB Box, Jute, or Crates)", data: stages.packaging, color: "#d97706" },
                { label: "4. Transit Logistics (Highway Truck or Kisan Rail)", data: stages.transport, color: "#2563eb" },
                { label: "5. Mandi Spoilage Loss (Handling & Daily Decay)", data: stages.retailAndWaste, color: "#9333ea" },
              ].map((st) => (
                <div key={st.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.84rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span style={{ color: "#334155", fontWeight: 500 }}>{st.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {st.data?.kgCO2e} kg <span style={{ color: "#64748b", fontWeight: 400 }}>({st.data?.pct}%)</span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "#f1f5f9",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: `${st.data?.pct || 0}%`,
                        height: "100%",
                        background: st.color,
                        borderRadius: "4px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: What-If Carbon Reduction Controls */}
        <div className="card">
          <div
            style={{
              fontSize: "0.82rem",
              color: "#15803d",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            Step 4 • What-If Scenario Lab: Decarbonize the Value Chain
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>
            Test Decarbonization Interventions
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Change farming methods, transport, or packaging to calculate immediate carbon cuts:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {/* Control 1: Farm Energy & Soil Practice */}
            <div>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.4rem",
                  color: "#334155",
                }}
              >
                Irrigation & Soil Practice:
              </label>
              <select
                className="select-input"
                value={farmingId}
                onChange={(e) => setFarmingId(e.target.value)}
              >
                {FARMING_PRACTICES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Control 2: Transport Modality */}
            <div>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.4rem",
                  color: "#334155",
                }}
              >
                Freight Modality:
              </label>
              <select
                className="select-input"
                value={transportId}
                onChange={(e) => setTransportId(e.target.value)}
              >
                {TRANSPORT_MODALITIES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Control 3: Packaging Material */}
            <div>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.4rem",
                  color: "#334155",
                }}
              >
                Packaging Material:
              </label>
              <select
                className="select-input"
                value={packagingId}
                onChange={(e) => setPackagingId(e.target.value)}
              >
                {PACKAGING_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Savings Callout */}
          {lca.carbonReductionPercent > 0 && (
            <div
              style={{
                marginTop: "1.25rem",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "0.85rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#166534",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              <TrendingDown size={20} color="#16a34a" />
              <span>
                Verified Reduction: These choices lower total lifecycle emissions by{" "}
                <strong>{lca.carbonReductionPercent}%</strong> compared to conventional baseline (saving{" "}
                {(((lca.baselineTotalPerKg - lca.totalPerKg) * 5000) / 1000).toFixed(2)} metric tonnes of CO₂e per 5,000 kg harvest).
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Light, Clean */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "1.25rem 0",
          color: "#64748b",
          fontSize: "0.82rem",
          textAlign: "center",
          background: "#ffffff",
        }}
      >
        <div className="container">
          CropCarbon Tracker • Driven by the 61-Crop Indian Agronomic & Cold-Chain Master Dataset (CEA Grid Baseline 716 g/kWh)
        </div>
      </footer>

      {/* Modal 1: 61-Crop Master Dataset Table Inspector */}
      {showDatasetTable && (
        <div className="modal-backdrop" onClick={() => setShowDatasetTable(false)}>
          <div className="modal-content" style={{ maxWidth: "980px" }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Table size={20} color="#16a34a" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                  Empirical Master Dataset (All 61 Indian Crops)
                </h3>
              </div>
              <button
                onClick={() => setShowDatasetTable(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: "1rem" }}>
              Contains all 16 agronomic columns. Click any row to immediately select that crop in the single dropdown.
            </p>

            <div style={{ overflowX: "auto", maxHeight: "60vh", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#334155" }}>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Crop</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Category</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Season</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Yield (kg/ha)</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>N (kg/ha)</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Days</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Kc</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Irrig.</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Diesel</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Loss %</th>
                    <th style={{ padding: "0.6rem 0.75rem" }}>Reefer °C</th>
                  </tr>
                </thead>
                <tbody>
                  {INDIAN_CROPS_DATA.map((r) => {
                    const isCurrent = activeCropId === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          setActiveCropId(r.id);
                          setShowDatasetTable(false);
                        }}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: isCurrent ? "#f0fdf4" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#0f172a" }}>
                          {r.icon} {r.crop}
                        </td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#64748b" }}>{r.category}</td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#64748b" }}>{r.season}</td>
                        <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#0f172a" }}>
                          {r.yield_kg_ha.toLocaleString()}
                        </td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#334155" }}>{r.n_kg_ha}</td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#334155" }}>{r.growth_days}</td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#334155" }}>{r.kc}</td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#334155" }}>
                          {Math.round(r.irrigated_share * 100)}%
                        </td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#334155" }}>{r.diesel_l_ha} L</td>
                        <td style={{ padding: "0.55rem 0.75rem", color: "#dc2626", fontWeight: 600 }}>
                          {r.handling_loss_pct}%
                        </td>
                        <td
                          style={{
                            padding: "0.55rem 0.75rem",
                            color: r.needs_cold_storage ? "#0284c7" : "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {r.needs_cold_storage ? `${r.reefer_temp_c}°C` : "Ambient"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                onClick={() => setShowDatasetTable(false)}
                className="btn btn-primary"
                style={{ fontSize: "0.82rem" }}
              >
                Close Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Printable Audit Report Modal */}
      {showReport && (
        <div className="modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
                  Carbon Footprint Audit Certification
                </h3>
              </div>
              <button
                onClick={() => setShowReport(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                fontSize: "0.88rem",
                color: "#334155",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <strong>Crop / Produce:</strong> {crop.commonName} ({row.category})
              </div>
              <div>
                <strong>Top Production States:</strong> {row.top_states}
              </div>
              <div>
                <strong>Dataset Benchmark Yield:</strong> {row.yield_kg_ha?.toLocaleString()} kg/ha (Growth:{" "}
                {row.growth_days} days)
              </div>
              <div>
                <strong>Fertilizer & Energy:</strong> Nitrogen {row.n_kg_ha} kg N/ha • Diesel {row.diesel_l_ha} L/ha •
                Irrigated {Math.round((row.irrigated_share || 0) * 100)}%
              </div>
              <div>
                <strong>Cold Chain Parameters:</strong>{" "}
                {row.needs_cold_storage ? `Refrigerated at ${row.reefer_temp_c}°C` : "Ambient"} (Handling loss:{" "}
                {row.handling_loss_pct}%)
              </div>
              <div>
                <strong>Power Grid Baseline:</strong> {crop.baselineGridCarbon || 716} g CO₂/kWh (Central Electricity
                Authority Baseline)
              </div>
              <div>
                <strong>Total Lifecycle Footprint:</strong>{" "}
                <span style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.05rem" }}>
                  {lca.totalPerKg} kg CO₂e / kg produce
                </span>
              </div>
              <div>
                <strong>Eco-Score Rating:</strong> Grade {lca.ecoGrade} ({lca.ecoGradeLabel})
              </div>
              <div>
                <strong>Batch Harvest Total (5,000 kg):</strong> {lca.batchTotalTonnes} Metric Tonnes CO₂e
              </div>
              <div>
                <strong>Net Carbon Reduction:</strong> {lca.carbonReductionPercent}% achieved through active mitigation
                choices
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => window.print()} className="btn btn-outline" style={{ fontSize: "0.82rem" }}>
                <Printer size={15} />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="btn btn-primary"
                style={{ fontSize: "0.82rem" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
