// app/page.js - Simple, Clean, Light-Themed Agricultural Carbon Footprint Tracker
"use client";

import { useState, useEffect } from "react";
import { CROPS, TRANSPORT_MODALITIES, PACKAGING_OPTIONS, FARMING_PRACTICES } from "@/lib/cropsData";
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
} from "lucide-react";

export default function Home() {
  const [activeRegion, setActiveRegion] = useState("india"); // "india" | "global" | "all"
  const [activeCropId, setActiveCropId] = useState("basmati_rice");
  const [isStreaming, setIsStreaming] = useState(true);
  const [tick, setTick] = useState(0);

  // Supply chain choices
  const [farmingId, setFarmingId] = useState("conventional_fossil");
  const [transportId, setTransportId] = useState("tata_ambient_truck");
  const [packagingId, setPackagingId] = useState("jute_gunny_bag");

  // Telemetry & LCA state
  const [telemetry, setTelemetry] = useState(null);
  const [lca, setLca] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const crop = CROPS[activeCropId] || CROPS.basmati_rice;

  // Sync default options when crop changes
  useEffect(() => {
    if (crop.region === "india") {
      if (crop.id === "basmati_rice") {
        setTransportId("tata_ambient_truck");
        setPackagingId("jute_gunny_bag");
        setFarmingId("conventional_fossil");
      } else if (crop.id === "kolar_tomato") {
        setTransportId("tata_ambient_truck");
        setPackagingId("single_use_plastic");
      } else if (crop.id === "alphonso_mango") {
        setTransportId("diesel_reefer_truck");
        setPackagingId("hdpe_mandi_crate");
      }
    } else {
      setTransportId("diesel_reefer_truck");
      setPackagingId("single_use_plastic");
      setFarmingId("conventional_fossil");
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

  // Filter crops based on selected region
  const cropList = Object.values(CROPS).filter((c) => {
    if (activeRegion === "all") return true;
    return c.region === activeRegion;
  });

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
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                    border: "1px solid #fde68a",
                  }}
                >
                  India & Global
                </span>
              </div>
              <span style={{ color: "#64748b", fontSize: "0.76rem" }}>
                Agricultural Life Cycle CO₂e & Telemetry Tracker
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="live-badge"
              style={{ cursor: "pointer" }}
              title="Click to pause or resume real-time data"
            >
              <span className="live-dot" />
              <span>{isStreaming ? "Live Feed Connected" : "Feed Paused"}</span>
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
        {/* Step 1: Regional Agro-Climatic Selector & Crop Strip */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.82rem",
                color: "#15803d",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Step 1 • Select Region & Crop
            </div>

            {/* Region Filter Buttons */}
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                padding: "0.25rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {[
                { id: "india", label: "🇮🇳 Indian Conditions (4)" },
                { id: "global", label: "🌍 Global Benchmarks (4)" },
                { id: "all", label: "All Crops (8)" },
              ].map((r) => {
                const isActive = activeRegion === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRegion(r.id);
                      if (r.id === "india" && crop.region !== "india") {
                        setActiveCropId("basmati_rice");
                      } else if (r.id === "global" && crop.region !== "global") {
                        setActiveCropId("tomato");
                      }
                    }}
                    style={{
                      background: isActive ? "#ffffff" : "transparent",
                      color: isActive ? "#0f172a" : "#64748b",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.78rem",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "6px",
                      border: "none",
                      boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crop Buttons */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {cropList.map((c) => {
              const isSelected = activeCropId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCropId(c.id)}
                  style={{
                    background: isSelected ? "#f0fdf4" : "#ffffff",
                    border: isSelected ? "2px solid #16a34a" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.65rem 1.1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    color: isSelected ? "#15803d" : "#334155",
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: "0.9rem",
                    boxShadow: isSelected ? "0 2px 4px rgba(22, 163, 74, 0.1)" : "0 1px 2px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{c.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ lineHeight: 1.2 }}>
                      {c.commonName.split(" ")[0]} {c.commonName.split(" ")[1] || ""}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: isSelected ? "#166534" : "#64748b",
                      }}
                    >
                      {c.region === "india" ? "🇮🇳 " + c.regionName.replace("India ", "") : "🌍 " + c.regionName.split(" ")[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Crop Description Banner */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0.85rem 1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.85rem",
              color: "#334155",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>{crop.commonName}</span>{" "}
              <span style={{ color: "#64748b", fontStyle: "italic" }}>({crop.scientificName})</span>
              <p style={{ color: "#475569", marginTop: "3px" }}>{crop.description}</p>
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
        </div>

        {/* Step 2: Real-time Live Sensor & Grid Telemetry */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
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
                Live Sensors & Freight Monitoring
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
                CEA Coal Baseline: {crop.baselineGridCarbon || 716} g/kWh
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: farm.soilCH4Flux ? "repeat(auto-fit, minmax(170px, 1fr))" : "repeat(auto-fit, minmax(210px, 1fr))",
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
                Nitrogen Volatilization
              </div>
            </div>

            {/* Metric 2B (If Paddy): Soil Methane CH4 Flux */}
            {farm.soilCH4Flux && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "8px" }}>
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
                  28× Global Warming Impact
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
                  color: transport.coldChainStatus === "critical" ? "#dc2626" : transport.coldChainStatus === "caution" ? "#d97706" : "#0f172a",
                }}
              >
                {transport.reeferCargoTemp}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Speed: {transport.truckSpeed} km/h • {transport.vehicleId.split(" ")[0]}
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
                    background: al.type === "warning" ? "#fffbeb" : "#f0fdf4",
                    border: `1px solid ${al.type === "warning" ? "#fde68a" : "#bbf7d0"}`,
                    borderRadius: "6px",
                    padding: "0.65rem 0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.84rem",
                    color: al.type === "warning" ? "#92400e" : "#166534",
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
                { label: "1. Growth & Cultivation (Water, Soil & Fertilizers)", data: stages.cultivation, color: "#16a34a" },
                { label: "2. Harvesting & Processing (Milling & Washing)", data: stages.processing, color: "#0284c7" },
                { label: "3. Packaging Materials (Jute, HDPE Crate, or Plastic)", data: stages.packaging, color: "#d97706" },
                { label: "4. Transit & Mandi Logistics (Truck or Kisan Rail)", data: stages.transport, color: "#2563eb" },
                { label: "5. Mandi Display & Food Spoilage (Perishability)", data: stages.retailAndWaste, color: "#9333ea" },
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
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
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
                <strong>{lca.carbonReductionPercent}%</strong> compared to conventional methods (saving{" "}
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
          CropCarbon Tracker • Calibrated with CEA India Grid Database (716 g/kWh) & IPCC Guidelines
        </div>
      </footer>

      {/* Printable Audit Report Modal */}
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
                <strong>Crop / Produce:</strong> {crop.commonName} ({crop.scientificName})
              </div>
              <div>
                <strong>Agro-Climatic Zone:</strong> {crop.regionName}
              </div>
              <div>
                <strong>Origin Farm:</strong> {crop.originFarm.name} ({crop.originFarm.location})
              </div>
              <div>
                <strong>Market Destination:</strong> {crop.originFarm.destination} ({crop.originFarm.defaultDistanceKm} km)
              </div>
              <div>
                <strong>Power Grid Baseline:</strong> {crop.baselineGridCarbon || 716} g CO₂/kWh (Central Electricity Authority Baseline)
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
                <strong>Net Carbon Reduction:</strong> {lca.carbonReductionPercent}% achieved through active mitigation choices
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
