import { NextResponse } from "next/server";
import { classifyModules, identifyProcessArea } from "@/lib/tools/classify-module";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requirements } = body;

    if (!requirements || typeof requirements !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'requirements' field" },
        { status: 400 }
      );
    }

    const modules = classifyModules(requirements);

    const primaryModule =
      modules.length > 0 ? modules[0].module : "MM";

    const processArea = identifyProcessArea(requirements, primaryModule);

    return NextResponse.json({
      modules,
      primaryModule,
      processArea,
    });
  } catch (error) {
    console.error("Classification failed:", error);
    return NextResponse.json(
      { error: "Failed to classify requirements" },
      { status: 500 }
    );
  }
}
