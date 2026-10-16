// components/Header.jsx
"use client";

import { useState } from "react";
import { Leaf, RefreshCw, Award, Activity, ShieldCheck, Sparkles } from "lucide-react";

export const CROPS_LIST = [
  { id: "tomato", name: "Vine Tomato", icon: "🍅", origin: "Almería, Spain" },
  { id: "avocado", name: "Hass Avocado", icon: "🥑", origin: "Michoacán, Mexico" },
  { id: "coffee", name: "Arabica Coffee", icon: "☕", origin: "Antigua, Guatemala" },
  { id: "strawberry", name: "Fresh Strawberry", icon: "🍓", origin: "Huelva, Spain" },
];

export default function Header({
  activeCropId,
  onSelectCrop,
  isLiveStreaming,
  toggleLiveStreaming,
  refreshInterval,
  setRefreshInterval,
  onOpenPassport,
  activeTab,
  setActiveTab,
}) {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-glass)",
      background: "rgba(6, 12, 9, 0.88)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Top Banner Ticker */}
      <div style={{
        background: "rgba(16, 185, 129, 0.08)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.15)",
        padding: "0.4rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.82rem",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span className="live-dot" />
          <span style={{ color: "var(--emerald-400)", fontWeight: 600, letterSpacing: "0.04em" }}>
            AGRI-IOT TELEMETRY STREAM ONLINE
          </span>
          <span style={{ color: "var(--text-muted)" }}>•</span>
          <span style={{ color: "var(--text-dim)" }}>
            Standard: ISO 14067 & GHG Protocol Scope 1-3 Product Carbon Accounting
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Stream Rate:</span>
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => setRefreshInterval(sec)}
                style={{
                  background: refreshInterval === sec ? "rgba(16, 185, 129, 0.25)" : "transparent",
                  color: refreshInterval === sec ? "var(--emerald-300)" : "var(--text-dim)",
                  border: refreshInterval === sec ? "1px solid var(--border-emerald)" : "1px solid transparent",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={toggleLiveStreaming}
            style={{
              background: isLiveStreaming ? "rgba(16, 185, 129, 0.18)" : "rgba(244, 63, 94, 0.18)",
              color: isLiveStreaming ? "var(--emerald-400)" : "var(--rose-400)",
              border: `1px solid ${isLiveStreaming ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)"}`,
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              fontSize: "0.76rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} className={isLiveStreaming ? "spin-slow" : ""} />
            {isLiveStreaming ? "Streaming Active" : "Stream Paused"}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)",
            border: "1px solid var(--border-emerald)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--glow-emerald)",
          }}>
            <Leaf size={24} color="#34d399" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Terra<span style={{ color: "var(--emerald-400)" }}>Trace</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>v2.4 IoT</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "1px" }}>
              Agricultural Life Cycle Carbon & Cold-Chain Telemetry Engine
            </p>
          </div>
        </div>

        {/* Commodity Switcher */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(10, 20, 15, 0.8)",
          padding: "0.3rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-glass)",
        }}>
          {CROPS_LIST.map((crop) => {
            const isSelected = activeCropId === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => onSelectCrop(crop.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected ? "linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(6, 182, 212, 0.2) 100%)" : "transparent",
                  color: isSelected ? "#fff" : "var(--text-dim)",
                  border: isSelected ? "1px solid var(--border-emerald)" : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 600 : 500,
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(16, 185, 129, 0.25)" : "none",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{crop.icon}</span>
                <span>{crop.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action: DPP & Export */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={onOpenPassport}
            className="btn-primary"
            style={{ fontSize: "0.85rem", padding: "0.55rem 1.05rem" }}
          >
            <ShieldCheck size={16} />
            <span>Digital Product Passport</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        overflowX: "auto",
      }}>
        {[
          { id: "overview", label: "Lifecycle Carbon Dashboard", icon: Activity },
          { id: "transport", label: "Live Freight & Reefer Route", icon: RefreshCw },
          { id: "simulator", label: "What-If Carbon Reducer Lab", icon: Sparkles },
          { id: "passport", label: "ESG Compliance & Certification", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1rem",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--emerald-400)" : "2px solid transparent",
                color: isActive ? "var(--emerald-300)" : "var(--text-dim)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
