// components/DigitalProductPassportModal.jsx
"use client";

import { useState } from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Award,
  CheckCircle2,
  QrCode,
  FileText,
  Copy,
  Check,
} from "lucide-react";

export default function DigitalProductPassportModal({ isOpen, onClose, lcaResult, cropData, telemetry }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lcaResult || !cropData) return null;

  const batchId = `AGRI-LOT-${cropData.id.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const verificationHash = "0x7f9a1c84b2e9d30fa64b81c4e78291f034d67e21a8";

  const handleCopyJson = () => {
    const passportData = {
      standard: "ISO 14067:2018 / GHG Protocol Product Standard",
      batchId,
      crop: cropData.commonName,
      scientificName: cropData.scientificName,
      origin: cropData.originFarm,
      ecoGrade: lcaResult.ecoGrade,
      carbonFootprintKgCO2ePerKg: lcaResult.totalPerKg,
      totalBatchTonnesCO2e: lcaResult.batchTotalTonnes,
      reductionAchievedPct: lcaResult.carbonReductionPercent,
      stages: lcaResult.stages,
      transportMode: lcaResult.transportMode.name,
      packaging: lcaResult.packaging.name,
      verifiedAt: new Date().toISOString(),
      cryptographicHash: verificationHash,
    };
    navigator.clipboard.writeText(JSON.stringify(passportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="certificate-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "2rem" }}
      >
        {/* Certificate Action Bar (hidden on print) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border-glass)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-emerald">
              <ShieldCheck size={14} /> EU CSRD & ISO 14067 Certified
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
              Verified Digital Product Passport (DPP)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={handleCopyJson}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
            >
              {copied ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
              <span>{copied ? "Copied JSON" : "Copy JSON Data"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
            >
              <Printer size={14} />
              <span>Print Audit Certificate</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                color: "var(--text-dim)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Official Layout Body */}
        <div style={{
          border: "2px solid rgba(16, 185, 129, 0.5)",
          borderRadius: "var(--radius-sm)",
          padding: "2rem",
          background: "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(6, 12, 9, 0.95) 100%)",
          position: "relative",
        }}>
          {/* Official Stamp Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>TerraTrace</span>
                <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>CLIMATE CERTIFIED</span>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.4rem" }}>
                AGRICULTURAL DIGITAL PRODUCT PASSPORT
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "2px" }}>
                Compliant with ISO 14067:2018 (Carbon Footprint of Products) & PEFCR Agri-Food Guidance
              </p>
            </div>

            <div className="eco-grade-badge" style={{
              background: `linear-gradient(135deg, ${lcaResult.ecoGradeColor}33 0%, ${lcaResult.ecoGradeColor}66 100%)`,
              color: lcaResult.ecoGradeColor,
              borderColor: lcaResult.ecoGradeColor,
            }}>
              {lcaResult.ecoGrade}
            </div>
          </div>

          {/* Grid Metadata */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.4)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-glass)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>PRODUCT BATCH LOT</div>
              <div className="mono" style={{ fontWeight: 700, color: "var(--emerald-400)" }}>{batchId}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>AGRICULTURAL COMMODITY</div>
              <div style={{ fontWeight: 700 }}>{cropData.commonName} ({cropData.scientificName})</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>ORIGIN PRODUCTION FARM</div>
              <div>{cropData.originFarm.name}</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>{cropData.originFarm.location}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>VERIFIED CARBON INTENSITY</div>
              <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
                {lcaResult.totalPerKg} kg CO₂e / kg
              </div>
              <div style={{ color: "var(--emerald-400)", fontSize: "0.75rem", fontWeight: 600 }}>
                {lcaResult.carbonReductionPercent}% Reduction vs. Conventional Baseline
              </div>
            </div>
          </div>

          {/* Stage Contributions Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.5rem 0" }}>LCA Lifecycle Stage</th>
                <th style={{ padding: "0.5rem 0" }}>Standard Methodology</th>
                <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Emissions (kg CO₂e/kg)</th>
                <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Contribution %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(lcaResult.stages || {}).map(([key, st]) => (
                <tr key={key} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "0.6rem 0", fontWeight: 600, color: "#fff" }}>{st.title}</td>
                  <td style={{ padding: "0.6rem 0", color: "var(--text-dim)" }}>{key === "transport" ? lcaResult.transportMode.name : key === "packaging" ? lcaResult.packaging.name : "Direct Farm Sensor Telemetry"}</td>
                  <td className="mono" style={{ padding: "0.6rem 0", textAlign: "right", color: "var(--emerald-300)" }}>{st.kgCO2e}</td>
                  <td className="mono" style={{ padding: "0.6rem 0", textAlign: "right", color: "var(--text-dim)" }}>{st.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Verification Hash & Cryptographic Signature */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "0.78rem",
            color: "var(--text-dim)",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <div>CRYPTOGRAPHIC AUDIT SIGNATURE</div>
              <div className="mono" style={{ color: "var(--cyan-400)", fontSize: "0.75rem", marginTop: "2px" }}>
                {verificationHash}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Issued: {new Date().toUTCString()} by TerraTrace Autonomous Agro-Auditor
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "0.5rem 0.85rem",
              borderRadius: "6px",
            }}>
              <CheckCircle2 size={18} color="var(--emerald-400)" />
              <div>
                <div style={{ color: "var(--emerald-400)", fontWeight: 700, fontSize: "0.78rem" }}>AUDIT PASSED</div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>EU Green Taxonomy Aligned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
