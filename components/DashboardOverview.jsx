// components/DashboardOverview.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Leaf,
  Truck,
  Package,
  Store,
  Wind,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingDown,
  TreeDeciduous,
  Car,
  Fuel,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function DashboardOverview({
  cropData,
  lcaResult,
  telemetry,
  telemetryHistory,
  onOpenPassport,
}) {
  const [selectedStageKey, setSelectedStageKey] = useState("cultivation");

  if (!lcaResult || !cropData) return null;

  const stages = lcaResult.stages || {};
  const stageList = [
    { key: "cultivation", icon: Leaf, ...stages.cultivation },
    { key: "processing", icon: Flame, ...stages.processing },
    { key: "packaging", icon: Package, ...stages.packaging },
    { key: "transport", icon: Truck, ...stages.transport },
    { key: "retailAndWaste", icon: Store, ...stages.retailAndWaste },
  ];

  const activeStage = stages[selectedStageKey] || stages.cultivation;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Hero Banner & Live Crop Twin */}
      <div className="glass-panel" style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        padding: "2rem",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "2rem",
        alignItems: "center",
      }}>
        {/* Background Subtle Ambience */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "55%",
          height: "100%",
          opacity: 0.22,
          pointerEvents: "none",
        }}>
          <img
            src="/agri-hero.jpg"
            alt="Agricultural Digital Twin"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Left Column: Crop Title & Real-time State */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <span className="badge badge-emerald">
              <span className="live-dot" /> Live Telemetry Linked
            </span>
            <span className="badge badge-cyan">{cropData.category}</span>
          </div>

          <h1 style={{ fontSize: "2.3rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "0.5rem" }}>
            {cropData.commonName} <span style={{ color: "var(--text-muted)", fontSize: "1.3rem", fontWeight: 400 }}>({cropData.scientificName})</span>
          </h1>

          <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem", maxWidth: "600px" }}>
            {cropData.description}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            background: "rgba(6, 12, 9, 0.65)",
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-glass)",
          }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>ORIGIN PRODUCTION NODE</div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", marginTop: "2px" }}>{cropData.originFarm.name}</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>{cropData.originFarm.location}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>DESTINATION TERMINAL</div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", marginTop: "2px" }}>{cropData.originFarm.destination}</div>
              <div style={{ color: "var(--emerald-400)", fontSize: "0.75rem", fontWeight: 600 }}>
                {cropData.originFarm.defaultDistanceKm.toLocaleString()} km Cold Corridor
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Digital Twin Visual Card */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-emerald)",
            boxShadow: "var(--glow-emerald)",
            position: "relative",
            aspectRatio: "16/9",
            background: "#030805",
          }}>
            <img
              src="/agri-hero.jpg"
              alt="Holographic Agro-Twin"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Holographic HUD Overlay */}
            <div style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              right: "10px",
              background: "rgba(6, 12, 9, 0.85)",
              backdropFilter: "blur(10px)",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
            }}>
              <div>
                <span style={{ color: "var(--emerald-400)", fontWeight: 700 }}>IOT NODE #ALM-04: </span>
                <span style={{ color: "#fff" }}>Continuous Respiration & N₂O Telemetry</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="live-dot" />
                <span className="mono" style={{ color: "var(--text-dim)" }}>
                  {telemetry?.farm?.ambientTemp ?? 22.5}°C / {telemetry?.farm?.soilMoisture ?? 58}% MST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Flagship KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
      }}>
        {/* Card 1: Total Footprint & Eco Grade */}
        <div className="glass-panel" style={{
          padding: "1.4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          borderLeft: `4px solid ${lcaResult.ecoGradeColor}`,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Life Cycle Carbon Intensity
              </span>
              <div className="eco-grade-badge" style={{
                background: `linear-gradient(135deg, ${lcaResult.ecoGradeColor}22 0%, ${lcaResult.ecoGradeColor}44 100%)`,
                color: lcaResult.ecoGradeColor,
                borderColor: lcaResult.ecoGradeColor,
                width: 52,
                height: 52,
                fontSize: "1.4rem",
              }}>
                {lcaResult.ecoGrade}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="mono" style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff" }}>
                {lcaResult.totalPerKg}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>kg CO₂e / kg</span>
            </div>

            <p style={{ color: lcaResult.ecoGradeColor, fontSize: "0.82rem", fontWeight: 600, marginTop: "0.25rem" }}>
              {lcaResult.ecoGradeLabel}
            </p>
          </div>

          <div style={{
            marginTop: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
          }}>
            <span style={{ color: "var(--text-dim)" }}>Conventional Baseline:</span>
            <span className="mono" style={{ color: "var(--text-muted)", textDecoration: "line-through" }}>
              {lcaResult.baselineTotalPerKg} kg
            </span>
            <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>
              <TrendingDown size={12} /> {lcaResult.carbonReductionPercent}% saved
            </span>
          </div>
        </div>

        {/* Card 2: Cultivation & Soil Sensor Node */}
        <div className="glass-panel" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Growth & Soil Flux
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wind size={20} color="var(--emerald-400)" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="mono" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff" }}>
                {stages.cultivation?.kgCO2e ?? 0}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>kg CO₂e ({stages.cultivation?.pct}%)</span>
            </div>

            <p style={{ color: "var(--emerald-400)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Soil N₂O Flux: {telemetry?.farm?.soilN2OFlux ?? 1.85} mg/m²/h
            </p>
          </div>

          <div style={{
            marginTop: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-glass)",
            fontSize: "0.78rem",
            color: "var(--text-dim)",
          }}>
            <span>Power Source: </span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{telemetry?.farm?.powerSource}</span>
          </div>
        </div>

        {/* Card 3: Cold-Chain Reefer Logistics */}
        <div className="glass-panel" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Cold-Chain Transport
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Truck size={20} color="var(--cyan-400)" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="mono" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff" }}>
                {stages.transport?.kgCO2e ?? 0}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>kg CO₂e ({stages.transport?.pct}%)</span>
            </div>

            <p style={{ color: "var(--cyan-400)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {lcaResult.transportMode?.name?.split("(")[0]}
            </p>
          </div>

          <div style={{
            marginTop: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
          }}>
            <span style={{ color: "var(--text-dim)" }}>Cargo Temp:</span>
            <span className="mono" style={{
              color: telemetry?.transport?.reeferCargoTemp > 4.5 ? "var(--rose-400)" : "var(--emerald-400)",
              fontWeight: 700
            }}>
              {telemetry?.transport?.reeferCargoTemp ?? 3.4}°C (Safe Envelope)
            </span>
          </div>
        </div>

        {/* Card 4: Equivalents & Offsets */}
        <div className="glass-panel" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Batch Batch Total (5,000 kg)
              </span>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(251, 191, 36, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TreeDeciduous size={20} color="var(--amber-400)" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="mono" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff" }}>
                {lcaResult.batchTotalTonnes}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Tonnes CO₂e</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.4rem", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--amber-400)" }}>
                <TreeDeciduous size={14} />
                <span>{lcaResult.equivalents?.treesYearsToOffset} Tree-Years</span>
              </div>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-dim)" }}>
                <Car size={14} />
                <span>{lcaResult.equivalents?.carMilesEquivalent.toLocaleString()} car km</span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.78rem",
          }}>
            <span style={{ color: "var(--text-dim)" }}>Diesel Equivalent:</span>
            <span className="mono" style={{ color: "var(--text-muted)" }}>
              {lcaResult.equivalents?.dieselLitersBurned} L burned
            </span>
          </div>
        </div>
      </div>

      {/* 5-Stage Agricultural Life Cycle Assessment Pipeline */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Life Cycle Assessment (LCA) Stage Breakdown
            </h2>
            <p style={{ color: "var(--text-dim)", fontSize: "0.84rem", marginTop: "2px" }}>
              Quantified greenhouse gas contributions from seed germination to consumer end-of-life (GHG Protocol Scope 1, 2 & 3).
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Click any stage below to inspect formula details:</span>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div style={{
          height: "16px",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          background: "rgba(255, 255, 255, 0.05)",
          marginBottom: "1.5rem",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        }}>
          {stageList.map((stage, i) => {
            const colors = ["#10b981", "#3b82f6", "#f59e0b", "#06b6d4", "#a855f7"];
            return (
              <div
                key={stage.key}
                style={{
                  width: `${stage.pct}%`,
                  background: colors[i % colors.length],
                  height: "100%",
                  transition: "width 0.4s ease",
                  title: `${stage.title}: ${stage.pct}%`,
                }}
              />
            );
          })}
        </div>

        {/* 5 Interactive Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
          {stageList.map((stage, i) => {
            const Icon = stage.icon;
            const isSelected = selectedStageKey === stage.key;
            return (
              <div
                key={stage.key}
                onClick={() => setSelectedStageKey(stage.key)}
                style={{
                  background: isSelected ? "rgba(16, 185, 129, 0.16)" : "rgba(10, 20, 15, 0.6)",
                  border: isSelected ? "1px solid var(--border-emerald)" : "1px solid var(--border-glass)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isSelected ? "translateY(-2px)" : "none",
                  boxShadow: isSelected ? "0 4px 16px rgba(16, 185, 129, 0.2)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STAGE 0{i + 1}</span>
                  <Icon size={16} color={isSelected ? "var(--emerald-400)" : "var(--text-dim)"} />
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: isSelected ? "#fff" : "var(--text-main)" }}>
                  {stage.title}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                  <span className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: isSelected ? "var(--emerald-300)" : "#fff" }}>
                    {stage.kgCO2e}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>kg ({stage.pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Inspection Detail Drawer */}
        <div style={{
          marginTop: "1.5rem",
          background: "rgba(6, 14, 10, 0.75)",
          border: "1px solid var(--border-emerald)",
          borderRadius: "var(--radius-sm)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-emerald">Selected Stage Diagnostic</span>
              <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{activeStage.title}</span>
            </div>
            <span className="mono" style={{ color: "var(--emerald-400)", fontWeight: 700 }}>
              {activeStage.kgCO2e} kg CO₂e / kg ({activeStage.pct}% of total crop footprint)
            </span>
          </div>

          <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.5 }}>
            {activeStage.description}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginTop: "0.5rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-glass)",
            fontSize: "0.82rem",
          }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Telemetry Sensor Input: </span>
              <span style={{ color: "var(--text-main)", fontWeight: 500 }}>
                {selectedStageKey === "cultivation" ? "Soil N₂O chamber flux + Microgrid Solar Inverter load" :
                 selectedStageKey === "transport" ? "Fleet GPS speed + Reefer compressor duty cycle + Ambient thermistors" :
                 selectedStageKey === "packaging" ? "Polymer mass balance + Resin recycled fraction tracking" :
                 selectedStageKey === "processing" ? "Hydro-cooler refrigeration power + Optical sorter optical watt-hours" :
                 "Cold cabinet retail runtime + Ethylene ripening sensor"}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Key Mitigation Strategy: </span>
              <span style={{ color: "var(--emerald-400)", fontWeight: 600 }}>
                {selectedStageKey === "cultivation" ? "Nitrification inhibitors + Solar thermal heat pump storage" :
                 selectedStageKey === "transport" ? "Switch to heavy battery-electric reefer (cuts 78% transport emissions)" :
                 selectedStageKey === "packaging" ? "Switch to molded sugarcane bagasse compostable punnets" :
                 selectedStageKey === "processing" ? "Heat recovery on post-harvest chilling lines" :
                 "Dynamic algorithmic clearance + Ethylene scavenger bio-coatings"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Historical Waveform Stream */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="live-dot" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Real-Time IoT Sensor Telemetry Stream</h2>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "2px" }}>
              High-frequency multi-sensor streaming from Farm Node #ALM-04 and Reefer Freight Vehicle #884X.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, background: "var(--emerald-400)", borderRadius: "2px" }} />
              <span style={{ color: "var(--text-dim)" }}>Soil N₂O Flux (mg/m²/h)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, background: "var(--cyan-400)", borderRadius: "2px" }} />
              <span style={{ color: "var(--text-dim)" }}>Reefer Temp (°C)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 10, height: 10, background: "var(--amber-400)", borderRadius: "2px" }} />
              <span style={{ color: "var(--text-dim)" }}>Hourly CO₂e Release (kg/h)</span>
            </div>
          </div>
        </div>

        {/* Animated Waveform Canvas Container */}
        <div style={{
          background: "rgba(5, 10, 7, 0.8)",
          borderRadius: "var(--radius-sm)",
          padding: "1rem 1.5rem",
          border: "1px solid var(--border-glass)",
          position: "relative",
          height: "180px",
          display: "flex",
          alignItems: "flex-end",
        }}>
          {telemetryHistory && telemetryHistory.length > 0 ? (
            <svg style={{ width: "100%", height: "100%", overflow: "visible" }} viewBox="0 0 600 120" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Line 1: Soil N2O (Emerald) */}
              <polyline
                fill="none"
                stroke="var(--emerald-400)"
                strokeWidth="2.5"
                points={telemetryHistory
                  .map((t, idx) => {
                    const x = (idx / (telemetryHistory.length - 1 || 1)) * 600;
                    const val = t.farm?.soilN2OFlux ?? 1.85;
                    const y = 120 - Math.min(110, Math.max(10, (val / 4.0) * 110));
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Line 2: Reefer Temp (Cyan) */}
              <polyline
                fill="none"
                stroke="var(--cyan-400)"
                strokeWidth="2.5"
                points={telemetryHistory
                  .map((t, idx) => {
                    const x = (idx / (telemetryHistory.length - 1 || 1)) * 600;
                    const val = t.transport?.reeferCargoTemp ?? 3.4;
                    const y = 120 - Math.min(110, Math.max(10, (val / 8.0) * 110));
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Line 3: Total Hourly CO2e (Amber) */}
              <polyline
                fill="none"
                stroke="var(--amber-400)"
                strokeWidth="2"
                strokeDasharray="3 3"
                points={telemetryHistory
                  .map((t, idx) => {
                    const x = (idx / (telemetryHistory.length - 1 || 1)) * 600;
                    const val = t.instantaneousMetrics?.totalHourlyCO2e ?? 28;
                    const y = 120 - Math.min(110, Math.max(10, (val / 50.0) * 110));
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          ) : (
            <div style={{ color: "var(--text-dim)", margin: "auto", fontSize: "0.85rem" }}>
              Initializing live telemetry wave buffer...
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}>
          <span>T - 60s Historical Buffer</span>
          <span>Sampling Frequency: Active Push (SSE / REST polling)</span>
          <span style={{ color: "var(--emerald-400)" }}>Current Time: {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : "Live"}</span>
        </div>
      </div>
    </div>
  );
}
