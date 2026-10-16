// app/api/crops/route.js
import { NextResponse } from "next/server";
import { CROPS, TRANSPORT_MODALITIES, PACKAGING_OPTIONS, FARMING_PRACTICES } from "@/lib/cropsData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cropId = searchParams.get("cropId");

  if (cropId && CROPS[cropId]) {
    return NextResponse.json({
      success: true,
      crop: CROPS[cropId],
      transportModalities: TRANSPORT_MODALITIES,
      packagingOptions: PACKAGING_OPTIONS,
      farmingPractices: FARMING_PRACTICES,
    });
  }

  return NextResponse.json({
    success: true,
    crops: Object.values(CROPS),
    transportModalities: TRANSPORT_MODALITIES,
    packagingOptions: PACKAGING_OPTIONS,
    farmingPractices: FARMING_PRACTICES,
  });
}
