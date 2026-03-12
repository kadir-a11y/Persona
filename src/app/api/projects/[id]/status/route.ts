import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { changeProjectStatus } from "@/lib/services/project-service";
import { projectStatuses } from "@/lib/validators/project";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(projectStatuses),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await changeProjectStatus(id, session.user.id, parsed.data.status);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
