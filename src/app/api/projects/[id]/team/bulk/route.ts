import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/services/project-service";
import { addTeamMember } from "@/lib/services/project-team-service";
import { bulkTeamAssignmentSchema } from "@/lib/validators/project";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProjectById(id, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = bulkTeamAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const results = await Promise.all(
    parsed.data.assignments.map((a) => addTeamMember(id, a))
  );

  return NextResponse.json(results, { status: 201 });
}
