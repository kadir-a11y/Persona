import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectPlaybooks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { playbookUpdateSchema } from "@/lib/validators/project";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [playbook] = await db
    .select()
    .from(projectPlaybooks)
    .where(and(eq(projectPlaybooks.id, id), eq(projectPlaybooks.userId, session.user.id)))
    .limit(1);

  return playbook ? NextResponse.json(playbook) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

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
  const parsed = playbookUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [playbook] = await db
    .update(projectPlaybooks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(projectPlaybooks.id, id), eq(projectPlaybooks.userId, session.user.id)))
    .returning();

  return playbook ? NextResponse.json(playbook) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [playbook] = await db
    .delete(projectPlaybooks)
    .where(and(eq(projectPlaybooks.id, id), eq(projectPlaybooks.userId, session.user.id)))
    .returning();

  return playbook ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
