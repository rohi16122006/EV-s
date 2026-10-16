// app/api/calculate-footprint/route.js
import { NextResponse } from "next/server";
import { calculateLCA } from "@/lib/carbonEngine";

export async function POST(request) {
  try {
    const body = await request.json();

    const result = calculateLCA({
      cropId: body.cropId || "tomato",
      batchSizeKg: Number(body.batchSizeKg) || 5000,
      transportDistanceKm: body.transportDistanceKm !== undefined ? Number(body.transportDistanceKm) : null,
      transportModeId: body.transportModeId || "diesel_reefer_truck",
      packagingId: body.packagingId || "single_use_plastic",
      farmingPracticeId: body.farmingPracticeId || "conventional_fossil",
      activeMitigations: Array.isArray(body.activeMitigations) ? body.activeMitigations : [],
      telemetryAdjustments: body.telemetryAdjustments || null,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate footprint" },
      { status: 400 }
    );
  }
}
