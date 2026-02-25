import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";

/**
 * GET /api/export — GDPR Data Export (Right to Portability, Art. 20)
 * Returns all FSDs and comments as a JSON file.
 */
export async function GET(request: Request) {
  try {
    const [fsds, comments, feedbackRules] = await Promise.all([
      prisma.fsd.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          projectName: true,
          author: true,
          companyName: true,
          primaryModule: true,
          processArea: true,
          relatedModules: true,
          markdown: true,
          language: true,
          fsdType: true,
          rating: true,
          industry: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fsdId: true,
          authorName: true,
          content: true,
          createdAt: true,
        },
      }),
      prisma.feedbackRule.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          module: true,
          processArea: true,
          ruleType: true,
          content: true,
          source: true,
          active: true,
          appliedCount: true,
          createdAt: true,
        },
      }),
    ]);

    logAudit("EXPORT_DATA", "User", undefined, request, `Exported ${fsds.length} FSDs, ${comments.length} comments`);

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      gdprArticle: "Art. 20 — Right to Data Portability",
      summary: {
        totalDocuments: fsds.length,
        totalComments: comments.length,
        totalFeedbackRules: feedbackRules.length,
      },
      fsds,
      comments,
      feedbackRules,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fsd-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Data export") },
      { status: 500 }
    );
  }
}
