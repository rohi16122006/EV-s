// components/TransportFleetTracker.jsx
"use client";

import { useState } from "react";
import {
  Truck,
  MapPin,
  Thermometer,
  Gauge,
  Navigation,
  Fuel,
  TrendingDown,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { TRANSPORT_MODALITIES } from "@/lib/cropsData";

export default function TransportFleetTracker({
  cropData,
  telemetry,
  selectedTransportModeId,
  onSelectTransportMode,
}) {
  const [customDistanceKm, setCustomDistanceKm] = useState(
    cropData?.originFarm?.defaultDistanceKm || 2150
  );
  const [cargoWeightTonnes, setCargoWeightTonnes] = useState(18); // Typical 40ft reefer payload

  const transport = telemetry?.transport || {};
  const origin = cropData?.originFarm || {};

  // Calculate carbon emissions for all modalities across custom distance & cargo weight
  const modalityComparisons = TRANSPORT_MODALITIES.map((mode) => {
    // Formula: (Distance * CargoWeight * EmissionFactor_g_tkm) / 1,000,000 => Metric Tonnes CO2e
    const totalEmissionsTonnes = Number(
      ((customDistanceKm * cargoWeightTonnes * mode.emissionFactorGramPerTkm) / 1000000).toFixed(2)
    );
    // Baseline is diesel truck
    const baselineTonnes = Number(
      ((customDistanceKm * cargoWeightTonnes * TRANSPORT_MODALITIES[0].emissionFactorGramPerTkm) / 1000000).toFixed(2)
    );
    const savingsTonnes = Number((baselineTonnes - totalEmissionsTonnes).toFixed(2));
    const savingsPercent = Math.round(((baselineTonnes - totalEmissionsTonnes) / baselineTonnes) * 100);

    return {
      ...mode,
      totalEmissionsTonnes,
      savingsTonnes,
      savingsPercent,
    };
  });

  const activeMode = modalityComparisons.find((m) => m.id === selectedTransportModeId) || modalityComparisons[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Route Header Banner */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-cyan">
                <Navigation size={12} /> Active Cold-Chain Transit
              </span>
              <span className="mono" style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>
                Vehicle: {transport.vehicleId ?? "REEFER-SMART-884X"}
              </span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.4rem" }}>
              Cold-Chain Freight Route & Real-Time Emissions Tracker
            </h2>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
              Monitoring live thermodynamic reefer temperatures and fuel consumption on the long-haul agricultural distribution corridor.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              background: "rgba(10, 20, 15, 0.7)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-sm)",
              padding: "0.6rem 1rem",
              textAlign: "right",
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>INSTANTANEOUS FREIGHT CO₂ RATE</div>
              <div className="mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--cyan-400)" }}>
                {transport.freightHourlyCO2e ?? 24.5} kg CO₂e/h
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Transit Route Visual Corridor */}
        <div style={{
          background: "rgba(6, 12, 9, 0.8)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          border: "1px solid var(--border-glass)",
        }}>
          {/* Waypoints line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--emerald-400)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ORIGIN DEPARTURE</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{origin.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{origin.location}</div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <span className="badge badge-emerald" style={{ fontSize: "0.75rem" }}>
                {transport.tripProgressPct ?? 48}% Complete
              </span>
              <div className="mono" style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "4px" }}>
                {Math.round((customDistanceKm * (transport.tripProgressPct || 48)) / 100)} / {customDistanceKm.toLocaleString()} km
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", textAlign: "right" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>FINAL DESTINATION</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{origin.destination?.split("(")[0]}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--emerald-400)" }}>Primary Logistics Hub</div>
              </div>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--cyan-400)" }} />
            </div>
          </div>

          {/* Interactive Route Progress Bar with Moving Truck */}
          <div style={{ position: "relative", height: "12px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "6px", margin: "1.5rem 0 2rem" }}>
            <div style={{
              width: `${transport.tripProgressPct ?? 48}%`,
              height: "100%",
              borderRadius: "6px",
              background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
              position: "relative",
            }}>
              {/* Animated Vehicle Indicator */}
              <div style={{
                position: "absolute",
                right: "-18px",
                top: "-14px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#08130d",
                border: "2px solid var(--cyan-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(6, 182, 212, 0.8)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}>
                <Truck size={18} color="var(--cyan-400)" />
              </div>
            </div>
          </div>

          {/* Real-time Fleet Telemetry Gauges Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            background: "rgba(10, 20, 15, 0.5)",
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
          }}>
            {/* Gauge 1: Reefer Temp */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                background: transport.reeferCargoTemp > 4.5 ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Thermometer size={20} color={transport.reeferCargoTemp > 4.5 ? "var(--rose-400)" : "var(--emerald-400)"} />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>REEFER CARGO TEMP</div>
                <div className="mono" style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: transport.reeferCargoTemp > 4.5 ? "var(--rose-400)" : "var(--emerald-400)",
                }}>
                  {transport.reeferCargoTemp ?? 3.4}°C
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Setpoint: 2.0 - 4.0°C</div>
              </div>
            </div>

            {/* Gauge 2: Vehicle Speed */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Gauge size={20} color="var(--cyan-400)" />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>HIGHWAY SPEED</div>
                <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
                  {transport.truckSpeed ?? 78} km/h
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Cruise Eco-Mode</div>
              </div>
            </div>

            {/* Gauge 3: Compressor Power */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "8px", background: "rgba(251, 191, 36, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={20} color="var(--amber-400)" />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>CHILLER COMPRESSOR</div>
                <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--amber-400)" }}>
                  {transport.reeferCompressorKw ?? 4.2} kW
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Duty Cycle: 68%</div>
              </div>
            </div>

            {/* Gauge 4: Fuel Consumption */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Fuel size={20} color="#c084fc" />
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>FUEL BURN RATE</div>
                <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#c084fc" }}>
                  {transport.truckFuelBurn ?? 32.5} L/100km
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Instantaneous Flow</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task: Multi-Modal Transport Carbon Optimizer */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-emerald">Interactive Decision Task</span>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                Freight Modality Carbon & Logistics Optimizer
              </h2>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "2px" }}>
              Simulate carbon reductions across 4 alternative cold-chain freight modalities based on trip distance and batch tonnage.
            </p>
          </div>
        </div>

        {/* Dynamic Sliders */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          background: "rgba(10, 20, 15, 0.65)",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem",
        }}>
          {/* Distance Slider */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                Transport Route Distance:
              </label>
              <span className="mono" style={{ color: "var(--emerald-400)", fontWeight: 700, fontSize: "1rem" }}>
                {customDistanceKm.toLocaleString()} km
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="6000"
              step="50"
              value={customDistanceKm}
              onChange={(e) => setCustomDistanceKm(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>Local Distribution (200 km)</span>
              <span>Default Route ({cropData.originFarm.defaultDistanceKm} km)</span>
              <span>Transcontinental (6,000 km)</span>
            </div>
          </div>

          {/* Payload Slider */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                Cargo Payload Weight:
              </label>
              <span className="mono" style={{ color: "var(--cyan-400)", fontWeight: 700, fontSize: "1rem" }}>
                {cargoWeightTonnes} Metric Tonnes
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={cargoWeightTonnes}
              onChange={(e) => setCargoWeightTonnes(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>Light Box Truck (2 t)</span>
              <span>Standard Semi-Trailer (18 t)</span>
              <span>Max Capacity (24 t)</span>
            </div>
          </div>
        </div>

        {/* Modality Comparison Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}>
          {modalityComparisons.map((mode) => {
            const isSelected = selectedTransportModeId === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => onSelectTransportMode(mode.id)}
                style={{
                  background: isSelected ? "rgba(16, 185, 129, 0.16)" : "rgba(10, 20, 15, 0.7)",
                  border: isSelected ? "2px solid var(--emerald-400)" : "1px solid var(--border-glass)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  transform: isSelected ? "translateY(-3px)" : "none",
                  boxShadow: isSelected ? "0 8px 24px rgba(16, 185, 129, 0.25)" : "none",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.6rem" }}>{mode.icon}</span>
                    <span
                      className="badge"
                      style={{
                        background: `${mode.badgeColor}22`,
                        color: mode.badgeColor,
                        borderColor: `${mode.badgeColor}44`,
                        fontSize: "0.72rem",
                      }}
                    >
                      {mode.carbonIntensityBadge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    {mode.name}
                  </h3>

                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    Emission Factor: <span className="mono" style={{ color: "var(--text-dim)" }}>{mode.emissionFactorGramPerTkm} g CO₂e/t-km</span>
                  </div>

                  <div style={{
                    background: "rgba(6, 12, 9, 0.8)",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "1rem",
                  }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>TOTAL TRIP EMISSIONS</div>
                    <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>
                      {mode.totalEmissionsTonnes} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-dim)" }}>Tonnes CO₂e</span>
                    </div>
                  </div>
                </div>

                <div>
                  {mode.savingsPercent > 0 ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      color: "var(--emerald-400)",
                      fontWeight: 600,
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--border-glass)",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <TrendingDown size={14} /> Saves {mode.savingsTonnes} t CO₂e
                      </span>
                      <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>
                        -{mode.savingsPercent}%
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--border-glass)",
                    }}>
                      Baseline Fleet Reference Standard
                    </div>
                  )}

                  <button
                    style={{
                      width: "100%",
                      marginTop: "0.75rem",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      background: isSelected ? "var(--emerald-500)" : "rgba(255, 255, 255, 0.05)",
                      color: isSelected ? "#04130a" : "var(--text-dim)",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {isSelected ? "Active Selected Vehicle" : "Select Modality"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
