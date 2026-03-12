import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { discoveredItems, monitoredTopics } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum(["new", "reviewed", "auto_posted", "ignored", "manual_posted", "pending_approval", "rejected"]),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify ownership through topic (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  if (isAdmin) {
    const [updated] = await db
      .update(discoveredItems)
      .set({ status: parsed.data.status })
      .where(eq(discoveredItems.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  }

  const userTopics = await db
    .select({ id: monitoredTopics.id })
    .from(monitoredTopics)
    .where(eq(monitoredTopics.userId, session.user.id));

  const userTopicIds = userTopics.map((t) => t.id);

  const [updated] = await db
    .update(discoveredItems)
    .set({ status: parsed.data.status })
    .where(and(
      eq(discoveredItems.id, id),
      inArray(discoveredItems.topicId, userTopicIds)
    ))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
