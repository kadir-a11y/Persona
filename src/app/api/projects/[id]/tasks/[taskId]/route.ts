import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTaskById, updateTask, deleteTask, changeTaskStatus } from "@/lib/services/project-task-service";
import { projectTaskUpdateSchema, taskStatuses } from "@/lib/validators/project";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const task = await getTaskById(taskId);
  return task ? NextResponse.json(task) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, taskId } = await params;
  const body = await req.json();

  // Durum değişikliği
  if (body.action === "changeStatus") {
    const statusSchema = z.object({ action: z.literal("changeStatus"), status: z.enum(taskStatuses) });
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const task = await changeTaskStatus(taskId, parsed.data.status, id);
    return task ? NextResponse.json(task) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Genel güncelleme
  const parsed = projectTaskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await updateTask(taskId, parsed.data);
  return task ? NextResponse.json(task) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const task = await deleteTask(taskId);
  return task ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
