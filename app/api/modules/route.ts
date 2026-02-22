import { NextResponse } from "next/server";
import { MODULE_DESCRIPTIONS } from "@/lib/knowledge/cross-module-map";

export async function GET() {
  try {
    return NextResponse.json(MODULE_DESCRIPTIONS);
  } catch (error) {
    console.error("Failed to fetch module descriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch module descriptions" },
      { status: 500 }
    );
  }
}
