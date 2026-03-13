import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateResponses } from "@/lib/services/workspace-service";
import { workspaceGenerateSchema } from "@/lib/validators/workspace";
import { logWorkspaceAction } from "@/lib/services/activity-log-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, sid } = await params;
  const body = await req.json();
  const parsed = workspaceGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const responses = await generateResponses(sid, parsed.data);

    await logWorkspaceAction(session.user.id, id, "generate", {
      sessionId: sid,
      contentType: parsed.data.contentType || "reply",
      personaIds: responses.map((r) => r.personaId),
      personaNames: responses.map((r) => r.personaName),
      count: responses.length,
      platform: responses[0]?.platform,
    }).catch(() => {});

    return NextResponse.json(responses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
