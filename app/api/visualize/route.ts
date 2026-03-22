import { NextRequest, NextResponse } from "next/server";
import { fetchVisualization } from "@/lib/groq";
import { MOCK_DATA } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length < 3
    ) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 },
      );
    }
    const data = await fetchVisualization(question.trim());
    return NextResponse.json({ data, mock: false });
  } catch (err: unknown) {
    console.error("Visualize API error:", err);
    return NextResponse.json({
      data: MOCK_DATA,
      mock: true,
      warning: err instanceof Error ? err.message : "API call failed.",
    });
  }
}
