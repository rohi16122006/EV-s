// components/WhatIfScenarioLab.jsx
"use client";

import { useState } from "react";
import {
  Sparkles,
  Leaf,
  Package,
  Truck,
  RotateCcw,
  TrendingDown,
  CheckCircle2,
  Sliders,
  Award,
  Zap,
} from "lucide-react";
import { PACKAGING_OPTIONS, FARMING_PRACTICES, TRANSPORT_MODALITIES } from "@/lib/cropsData";

export default function WhatIfScenarioLab({
  cropData,
  lcaResult,
  selectedFarmingPracticeId,
  onSelectFarmingPractice,
  selectedPackagingId,
  onSelectPackaging,
  selectedTransportModeId,
  onSelectTransportMode,
  activeMitigations,
  onToggleMitigation,
  onResetMitigations,
}) {
  if (!cropData || !lcaResult) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-emerald">
                <Sparkles size={13} /> Simulation Sandbox
              </span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.4rem" }}>
                What-If Carbon Reduction & Decarbonization Lab
              </h2>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "3px" }}>
              Test real-world agronomic and supply-chain interventions to simulate immediate LCA emission reductions and boost your crop's Eco-Score.
            </p>
          </div>

          <button
            onClick={onResetMitigations}
            className="btn-secondary"
            style={{ fontSize: "0.82rem", padding: "0.5rem 0.9rem" }}
          >
            <RotateCcw size={14} />
            <span>Reset to Baseline</span>
          </button>
        </div>

        {/* Dynamic Comparison Dashboard Banner */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "1.5rem",
          background: "rgba(6, 12, 9, 0.75)",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-glass)",
        }}>
          {/* Baseline Box */}
          <div style={{
            padding: "1.25rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              CONVENTIONAL CROP REFERENCE BASELINE
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
              <span className="mono" style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-dim)" }}>
                {lcaResult.baselineTotalPerKg}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>kg CO₂e / kg</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Fossil Grid + Synthetic Nitrogen + Virgin PP Plastic + Diesel Reefer
            </div>
          </div>

          {/* Optimized Simulated Box */}
          <div style={{
            padding: "1.25rem",
            background: "rgba(16, 185, 129, 0.12)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-emerald)",
            boxShadow: "var(--glow-emerald)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--emerald-400)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                SIMULATED OPTIMIZED FOOTPRINT
              </div>
              <div className="eco-grade-badge" style={{
                width: 44,
                height: 44,
                fontSize: "1.2rem",
                color: lcaResult.ecoGradeColor,
                borderColor: lcaResult.ecoGradeColor,
                background: `${lcaResult.ecoGradeColor}22`,
              }}>
                {lcaResult.ecoGrade}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
              <span className="mono" style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff" }}>
                {lcaResult.totalPerKg}
              </span>
              <span style={{ color: "var(--emerald-300)", fontSize: "0.85rem" }}>kg CO₂e / kg</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.4rem" }}>
              <span className="badge badge-emerald">
                <TrendingDown size={12} /> {lcaResult.carbonReductionPercent}% Net CO₂e Reduction
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                ({((lcaResult.baselineTotalPerKg - lcaResult.totalPerKg) * 5000 / 1000).toFixed(2)} t CO₂e saved per 5t lot)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Levers Selection Workspace */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
      }}>
        {/* Lever Category 1: Agronomic Cultivation Practice */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Leaf size={18} color="var(--emerald-400)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>1. Farm Cultivation & Energy Practice</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FARMING_PRACTICES.map((fp) => {
              const isSelected = selectedFarmingPracticeId === fp.id;
              return (
                <div
                  key={fp.id}
                  onClick={() => onSelectFarmingPractice(fp.id)}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "rgba(16, 185, 129, 0.18)" : "rgba(10, 20, 15, 0.6)",
                    border: isSelected ? "1px solid var(--border-emerald)" : "1px solid var(--border-glass)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isSelected ? "#fff" : "var(--text-main)" }}>
                      {fp.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Cultivation Intensity: {Math.round(fp.cultivationMultiplier * 100)}% | Soil N₂O: {Math.round(fp.soilN2OMultiplier * 100)}%
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="var(--emerald-400)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lever Category 2: Packaging Materials */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Package size={18} color="var(--cyan-400)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>2. Produce Packaging Material</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {PACKAGING_OPTIONS.map((pack) => {
              const isSelected = selectedPackagingId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => onSelectPackaging(pack.id)}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: "var(--radius-sm)",
                    background: isSelected ? "rgba(6, 182, 212, 0.18)" : "rgba(10, 20, 15, 0.6)",
                    border: isSelected ? "1px solid var(--cyan-400)" : "1px solid var(--border-glass)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isSelected ? "#fff" : "var(--text-main)" }}>
                      {pack.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Emissions: {pack.carbonFactorKgCO2PerKgProduct} kg CO₂e / kg | Recyclability: {pack.recyclabilityPct}%
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="var(--cyan-400)" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crop-Specific Advanced Technological Interventions */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} color="var(--amber-400)" />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                High-Impact Mitigation Levers for {cropData.commonName}
              </h3>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "2px" }}>
              Toggle targeted technological levers specifically engineered for this crop's biological and supply-chain profile.
            </p>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}>
          {cropData.mitigationLevers?.map((lever) => {
            const isActive = activeMitigations.includes(lever.id);
            return (
              <div
                key={lever.id}
                onClick={() => onToggleMitigation(lever.id)}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(10, 20, 15, 0.6)",
                  border: isActive ? "1px solid var(--border-emerald)" : "1px solid var(--border-glass)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.2)" : "none",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>
                      -{lever.reductionPct}% in {lever.stage}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: isActive ? "#fff" : "var(--text-main)" }}>
                    {lever.name}
                  </div>
                </div>

                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "6px",
                  border: isActive ? "none" : "2px solid rgba(255,255,255,0.2)",
                  background: isActive ? "var(--emerald-500)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {isActive && <CheckCircle2 size={16} color="#05120a" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
