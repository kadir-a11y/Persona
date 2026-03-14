import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamTasks, users } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db
    .select({
      task: teamTasks,
      assignedName: users.name,
    })
    .from(teamTasks)
    .leftJoin(users, eq(teamTasks.assignedTo, users.id))
    .orderBy(
      asc(teamTasks.status),
      desc(teamTasks.priority),
      asc(teamTasks.sortOrder),
      desc(teamTasks.createdAt)
    );

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [task] = await db
    .insert(teamTasks)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assignedTo: parsed.data.assignedTo,
      createdBy: session.user.id,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    })
    .returning();

  return NextResponse.json(task, { status: 201 });
}
