import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectPlaybooks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { playbookCreateSchema } from "@/lib/validators/project";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playbooks = await db
    .select()
    .from(projectPlaybooks)
    .where(eq(projectPlaybooks.userId, session.user.id))
    .orderBy(desc(projectPlaybooks.createdAt));

  return NextResponse.json(playbooks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = playbookCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [playbook] = await db
    .insert(projectPlaybooks)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      templateTasks: parsed.data.templateTasks,
      templateTeam: parsed.data.templateTeam,
      defaultKeywords: parsed.data.defaultKeywords,
    })
    .returning();

  return NextResponse.json(playbook, { status: 201 });
}
