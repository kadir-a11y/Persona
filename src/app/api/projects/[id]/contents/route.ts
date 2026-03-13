import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, personas } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const platform = searchParams.get("platform") || undefined;
  const status = searchParams.get("status") || undefined;
  const contentType = searchParams.get("contentType") || undefined;

  const conditions = [eq(contentItems.projectId, id)];
  if (platform) conditions.push(eq(contentItems.platform, platform));
  if (status) conditions.push(eq(contentItems.status, status));
  if (contentType) conditions.push(eq(contentItems.contentType, contentType));

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: contentItems.id,
        personaId: contentItems.personaId,
        platform: contentItems.platform,
        contentType: contentItems.contentType,
        content: contentItems.content,
        status: contentItems.status,
        scheduledAt: contentItems.scheduledAt,
        publishedAt: contentItems.publishedAt,
        errorMessage: contentItems.errorMessage,
        aiGenerated: contentItems.aiGenerated,
        sourceContentUrl: contentItems.sourceContentUrl,
        createdAt: contentItems.createdAt,
        personaName: personas.name,
        personaAvatar: personas.avatarUrl,
      })
      .from(contentItems)
      .innerJoin(personas, eq(contentItems.personaId, personas.id))
      .where(and(...conditions))
      .orderBy(desc(contentItems.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(and(...conditions)),
  ]);

  return NextResponse.json({
    items,
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  });
}
