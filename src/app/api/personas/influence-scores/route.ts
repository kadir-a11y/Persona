import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recalculateAllInfluenceScores, calculateInfluenceScore } from "@/lib/services/influence-score-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const personaIds = body.personaIds as string[] | undefined;

  const updated = await recalculateAllInfluenceScores(personaIds);

  return NextResponse.json({ updated });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personaId = req.nextUrl.searchParams.get("personaId");
  if (!personaId) {
    return NextResponse.json({ error: "personaId required" }, { status: 400 });
  }

  const breakdown = await calculateInfluenceScore(personaId);
  return NextResponse.json(breakdown);
}
