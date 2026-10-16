// components/LiveTelemetryTicker.jsx
"use client";

import { Activity, Thermometer, Wind, Zap, Gauge, Truck } from "lucide-react";

export default function LiveTelemetryTicker({ telemetry }) {
  if (!telemetry) return null;

  const farm = telemetry.farm || {};
  const transport = telemetry.transport || {};

  return (
    <div style={{
      background: "rgba(10, 20, 15, 0.95)",
      borderBottom: "1px solid var(--border-glass)",
      padding: "0.5rem 1.5rem",
      overflowX: "auto",
      whiteSpace: "nowrap",
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        fontSize: "0.82rem",
      }}>
        {/* Metric 1: Soil N2O */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Wind size={15} color="var(--emerald-400)" />
          <span style={{ color: "var(--text-dim)" }}>Soil N₂O Flux:</span>
          <span className="mono" style={{ color: "var(--text-main)", fontWeight: 700 }}>
            {farm.soilN2OFlux ?? 1.85} mg/m²/h
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--emerald-400)", background: "rgba(16, 185, 129, 0.15)", padding: "1px 5px", borderRadius: "3px" }}>
            273x GWP
          </span>
        </div>

        {/* Metric 2: Grid Carbon Intensity */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={15} color="var(--amber-400)" />
          <span style={{ color: "var(--text-dim)" }}>Grid Intensity:</span>
          <span className="mono" style={{ color: "var(--text-main)", fontWeight: 700 }}>
            {farm.gridCarbonIntensity ?? 210} gCO₂/kWh
          </span>
        </div>

        {/* Metric 3: Ambient Temp */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Thermometer size={15} color="var(--cyan-400)" />
          <span style={{ color: "var(--text-dim)" }}>Microclimate:</span>
          <span className="mono" style={{ color: "var(--text-main)", fontWeight: 700 }}>
            {farm.ambientTemp ?? 22.4}°C | {farm.relativeHumidity ?? 68}% RH
          </span>
        </div>

        {/* Metric 4: Reefer Cold Chain */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Truck size={15} color="var(--emerald-400)" />
          <span style={{ color: "var(--text-dim)" }}>Reefer Temp:</span>
          <span className="mono" style={{
            color: transport.reeferCargoTemp > 4.5 ? "var(--rose-400)" : "var(--emerald-400)",
            fontWeight: 700
          }}>
            {transport.reeferCargoTemp ?? 3.4}°C
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            (Target: 2.0-4.0°C)
          </span>
        </div>

        {/* Metric 5: Instantaneous Freight Fuel */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Gauge size={15} color="var(--cyan-400)" />
          <span style={{ color: "var(--text-dim)" }}>Fleet Speed / Burn:</span>
          <span className="mono" style={{ color: "var(--text-main)", fontWeight: 700 }}>
            {transport.truckSpeed ?? 78} km/h @ {transport.truckFuelBurn ?? 32.4} L/100km
          </span>
        </div>

        {/* Metric 6: Real-Time Total Hourly Emission */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginLeft: "auto",
          background: "rgba(16, 185, 129, 0.12)",
          padding: "0.2rem 0.6rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
        }}>
          <Activity size={14} color="var(--emerald-400)" />
          <span style={{ color: "var(--emerald-300)", fontWeight: 600 }}>Active Stream Output:</span>
          <span className="mono" style={{ color: "#fff", fontWeight: 800 }}>
            {telemetry.instantaneousMetrics?.totalHourlyCO2e ?? 28.4} kg CO₂e/hr
          </span>
        </div>
      </div>
    </div>
  );
}
