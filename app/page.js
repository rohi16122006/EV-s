// app/page.js - CropCarbon: Agricultural Life Cycle CO2 Tracker
// Configured with Indian Agro-Climatic Conditions & Global Benchmarks
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
  Globe2,
  MapPin,
  Sparkles,
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Header Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "#0d1318",
          padding: "1rem 0",
          position: "sticky",
          top: 0,
          zIndex: 20,
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
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <Leaf size={20} color="var(--accent-green-light)" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                  Crop<span style={{ color: "var(--accent-green)" }}>Carbon</span>
                </span>
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--accent-amber)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  India & Global LCA
                </span>
              </div>
              <span style={{ color: "var(--text-dim)", fontSize: "0.76rem" }}>
                Real-Time Agricultural Life Cycle CO₂e & Telemetry Engine
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="live-badge"
              style={{ cursor: "pointer", border: "1px solid rgba(16, 185, 129, 0.3)" }}
              title="Click to pause or resume real-time sensor stream"
            >
              <span className="live-dot" />
              <span>{isStreaming ? "Telemetry Live" : "Stream Paused"}</span>
            </button>

            <button
              onClick={() => setShowReport(true)}
              className="btn btn-primary"
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.95rem" }}
            >
              <FileText size={15} />
              <span>Audit Report</span>
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
          gap: "2rem",
          flex: 1,
        }}
      >
        {/* Step 1: Regional Agro-Climatic Selector & Crop Strip */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--accent-green)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Step 1 • Select Agro-Climatic Region & Crop
            </div>

            {/* Region Filter Buttons */}
            <div style={{ display: "flex", background: "var(--bg-input)", padding: "0.2rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              {[
                { id: "india", label: "🇮🇳 Indian Conditions", count: 4 },
                { id: "global", label: "🌍 Global / EU Benchmarks", count: 4 },
                { id: "all", label: "All Crops", count: 8 },
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
                      background: isActive ? "var(--accent-green)" : "transparent",
                      color: isActive ? "#04140b" : "var(--text-muted)",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.78rem",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "6px",
                      border: "none",
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
                    background: isSelected ? "var(--bg-card-subtle)" : "var(--bg-card)",
                    border: isSelected ? "2px solid var(--accent-green)" : "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.65rem 1.1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    color: isSelected ? "#fff" : "var(--text-muted)",
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: "0.9rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{c.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ lineHeight: 1.2 }}>{c.commonName.split(" ")[0]} {c.commonName.split(" ")[1] || ""}</div>
                    <div style={{ fontSize: "0.7rem", color: isSelected ? "var(--accent-green-light)" : "var(--text-dim)" }}>
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
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.82rem",
            }}
          >
            <div>
              <span style={{ color: "#fff", fontWeight: 600 }}>{crop.commonName}</span>{" "}
              <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>({crop.scientificName})</span>
              <p style={{ color: "var(--text-muted)", marginTop: "2px" }}>{crop.description}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-green-light)", fontSize: "0.78rem" }}>
              <MapPin size={14} />
              <span>
                {crop.originFarm.name} → {crop.originFarm.destination?.split("(")[0]} ({crop.originFarm.defaultDistanceKm} km)
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Real-time Live Sensor & Grid Telemetry Feed */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--accent-green)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step 2 • Real-Time IoT & Energy Grid Telemetry
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "2px" }}>
                Live Field & Logistics Monitoring
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                CEA Coal Baseline: {crop.baselineGridCarbon || 716} g/kWh
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: farm.soilCH4Flux ? "repeat(auto-fit, minmax(180px, 1fr))" : "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* Metric 1: Field Temperature */}
            <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--text-dim)",
                  fontSize: "0.78rem",
                  marginBottom: "0.3rem",
                }}
              >
                <Thermometer size={14} color="var(--accent-cyan)" />
                <span>Field Temperature</span>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>
                {farm.ambientTemp}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Humidity: {farm.relativeHumidity}% RH
              </div>
            </div>

            {/* Metric 2: Soil N2O Flux */}
            <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--text-dim)",
                  fontSize: "0.78rem",
                  marginBottom: "0.3rem",
                }}
              >
                <Wind size={14} color="var(--accent-green-light)" />
                <span>Soil N₂O Flux</span>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-green-light)" }}>
                {farm.soilN2OFlux} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>mg/m²/h</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Synthetic Urea Volatilization
              </div>
            </div>

            {/* Metric 2B (If Paddy): Soil Methane CH4 Flux */}
            {farm.soilCH4Flux && (
              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--accent-rose)",
                    fontSize: "0.78rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  <Flame size={14} />
                  <span>Paddy CH₄ Methane</span>
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-rose)" }}>
                  {farm.soilCH4Flux} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>mg/m²/h</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-rose)", opacity: 0.9 }}>
                  28× Global Warming Potential
                </div>
              </div>
            )}

            {/* Metric 3: Regional Grid Carbon */}
            <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--text-dim)",
                  fontSize: "0.78rem",
                  marginBottom: "0.3rem",
                }}
              >
                <Zap size={14} color="var(--accent-amber)" />
                <span>Grid Carbon Factor</span>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>
                {farm.gridCarbonIntensity} <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>gCO₂/kWh</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: farm.solarIrradiance > 600 ? "var(--accent-green-light)" : "var(--text-dim)" }}>
                {farm.solarIrradiance > 600 ? "☀️ PM-KUSUM Solar Active" : "Thermal Grid Standard"}
              </div>
            </div>

            {/* Metric 4: Transport Fleet & Spoilage Envelope */}
            <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--text-dim)",
                  fontSize: "0.78rem",
                  marginBottom: "0.3rem",
                }}
              >
                <Truck size={14} color="var(--accent-cyan)" />
                <span>Transit Cargo Temp</span>
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: transport.coldChainStatus === "critical" ? "var(--accent-rose)" : transport.coldChainStatus === "caution" ? "var(--accent-amber)" : "var(--accent-cyan)",
                }}
              >
                {transport.reeferCargoTemp}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
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
                    background: al.type === "warning" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                    border: `1px solid ${al.type === "warning" ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                    borderRadius: "6px",
                    padding: "0.6rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.8rem",
                    color: al.type === "warning" ? "var(--accent-amber)" : "var(--accent-green-light)",
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>
                    <strong>{al.title}:</strong> {al.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Total Carbon LCA Calculation */}
        <div className="card" style={{ borderLeft: `5px solid ${lca.ecoGradeColor}` }}>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--accent-green)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
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
                <span style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {lca.totalPerKg}
                </span>
                <span style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
                  kg CO₂e per 1 kg of {crop.commonName}
                </span>
              </div>
              <p style={{ color: lca.ecoGradeColor, fontWeight: 700, fontSize: "0.92rem", marginTop: "0.4rem" }}>
                Eco-Grade: {lca.ecoGrade} • {lca.ecoGradeLabel}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                BATCH FOOTPRINT (5,000 KG HARVEST)
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>
                {lca.batchTotalTonnes}{" "}
                <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>
                  Tonnes CO₂e
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-green-light)" }}>
                Requires {lca.equivalents.treesYearsToOffset} Tree-Years to neutralize
              </div>
            </div>
          </div>

          {/* 5-Stage Life Cycle Pipeline Breakdown */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.85rem" }}>
              Carbon Breakdown Across Supply Chain Stages:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {[
                { label: "1. Growth & Cultivation (Soil, Water Pumping & Nitrogen)", data: stages.cultivation, color: "#10b981" },
                { label: "2. Harvesting & Processing (Parboiling, Grading & Milling)", data: stages.processing, color: "#06b6d4" },
                { label: "3. Packaging Materials (Jute, HDPE Crate, or Polymers)", data: stages.packaging, color: "#f59e0b" },
                { label: "4. Transit & Mandi Logistics (Highway Truck / Kisan Rail)", data: stages.transport, color: "#3b82f6" },
                { label: "5. Mandi Display & Food Spoilage Loss (Perishability)", data: stages.retailAndWaste, color: "#a855f7" },
              ].map((st) => (
                <div key={st.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{st.label}</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>
                      {st.data?.kgCO2e} kg <span style={{ color: "var(--text-dim)" }}>({st.data?.pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: "7px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
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
              fontSize: "0.8rem",
              color: "var(--accent-green)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.4rem",
            }}
          >
            Step 4 • What-If Scenario Lab: Decarbonize the Value Chain
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Test Decarbonization Interventions
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "0.84rem", marginBottom: "1.25rem" }}>
            Select Indian government schemes (PM-KUSUM, Kisan Rail), indigenous jute sacks, or regenerative soil methods to calculate immediate CO₂ cuts:
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
                  color: "var(--text-muted)",
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
                  color: "var(--text-muted)",
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
                  color: "var(--text-muted)",
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
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "0.85rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "var(--accent-green-light)",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              <TrendingDown size={20} />
              <span>
                Verified Impact: These interventions reduce total lifecycle emissions by{" "}
                <strong>{lca.carbonReductionPercent}%</strong> compared to conventional baseline (saving{" "}
                {(((lca.baselineTotalPerKg - lca.totalPerKg) * 5000) / 1000).toFixed(2)} metric tonnes of CO₂e per 5,000 kg harvest).
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "1.25rem 0",
          color: "var(--text-dim)",
          fontSize: "0.8rem",
          textAlign: "center",
          background: "#080c0f",
        }}
      >
        <div className="container">
          CropCarbon Tracker • Calibrated with CEA India Grid Database (716 g/kWh) & IPCC Agriculture Guidelines
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
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={20} color="var(--accent-green)" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  Carbon Footprint Audit Certification
                </h3>
              </div>
              <button
                onClick={() => setShowReport(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                fontSize: "0.86rem",
                color: "var(--text-muted)",
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
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
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
