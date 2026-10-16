// app/api/telemetry/live/route.js
import { NextResponse } from "next/server";
import { generateLiveTelemetry } from "@/lib/carbonEngine";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cropId = searchParams.get("cropId") || "tomato";
  const tick = parseInt(searchParams.get("tick") || "0", 10);

  const telemetry = generateLiveTelemetry(cropId, tick);

  return NextResponse.json({
    success: true,
    data: telemetry,
  });
}
