import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bulkApproveResponses } from "@/lib/services/workspace-service";
import { workspaceBulkApproveSchema } from "@/lib/validators/workspace";
import { logWorkspaceAction } from "@/lib/services/activity-log-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = workspaceBulkApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const responses = await bulkApproveResponses(parsed.data.responseIds);

  await logWorkspaceAction(session.user.id, id, "bulk_approve", {
    count: responses.length,
    personaIds: responses.map((r) => r.personaId),
  }).catch(() => {});

  return NextResponse.json(responses);
}
