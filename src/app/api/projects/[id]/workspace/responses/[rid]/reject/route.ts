import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rejectResponse } from "@/lib/services/workspace-service";
import { logWorkspaceAction } from "@/lib/services/activity-log-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, rid } = await params;
  const response = await rejectResponse(rid);
  if (!response) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logWorkspaceAction(session.user.id, id, "reject", {
    responseId: rid,
    personaIds: [response.personaId],
    contentType: response.contentType || "reply",
    platform: response.platform,
  }).catch(() => {});

  return NextResponse.json(response);
}
