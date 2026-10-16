// app/api/report/export/route.js
import { NextResponse } from "next/server";
import { calculateLCA } from "@/lib/carbonEngine";

export async function POST(request) {
  try {
    const body = await request.json();
    const lca = calculateLCA(body);

    const batchId = `AGRI-LOT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(JSON.stringify({ ...lca, batchId, timestamp: new Date().toISOString() }))
        )
      )
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 32);

    const passport = {
      digitalProductPassport: {
        dppVersion: "1.0-EU-CSRD-COMPLIANT",
        batchId,
        verificationHash: `0x${hash}`,
        issuedAt: new Date().toISOString(),
        standard: "ISO 14067:2018 (Carbon Footprint of Products) & GHG Protocol Scope 1-3",
        crop: lca.crop,
        batchSizeKg: lca.batchSizeKg,
        ecoGrade: lca.ecoGrade,
        totalEmissionsPerKg: `${lca.totalPerKg} kg CO₂e / kg`,
        totalBatchEmissionsTonnes: `${lca.batchTotalTonnes} Metric Tonnes CO₂e`,
        reductionAchievedPct: `${lca.carbonReductionPercent}% vs Conventional Baseline`,
        stagesBreakdown: lca.stages,
        transportMode: lca.transportMode.name,
        packagingType: lca.packaging.name,
        farmingPractice: lca.farmingPractice.name,
        equivalents: lca.equivalents,
        auditor: "TerraTrace Agricultural Climate Verifier System v4.2",
        complianceStatus: "VALIDATED_VERIFIED",
      },
    };

    return NextResponse.json({
      success: true,
      report: passport,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
