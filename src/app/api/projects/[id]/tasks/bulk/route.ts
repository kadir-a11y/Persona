import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/services/project-service";
import { bulkCreateTasks } from "@/lib/services/project-task-service";
import { bulkProjectTaskCreateSchema } from "@/lib/validators/project";

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
  const parsed = bulkProjectTaskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tasks = await bulkCreateTasks(id, parsed.data.tasks);
  return NextResponse.json(tasks, { status: 201 });
}
