import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFeed, getPlatformCounts, addManualContent } from "@/lib/services/content-feed-service";
import { z } from "zod";

const addContentSchema = z.object({
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok"]),
  content: z.string().min(1).max(10000),
  sourceUrl: z.string().url().optional(),
  sourceAuthor: z.string().max(255).optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
});

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

  const platform = searchParams.get("platform") || undefined;
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const [feed, platformCounts] = await Promise.all([
    getFeed(id, { platform, limit, offset }),
    getPlatformCounts(id),
  ]);

  return NextResponse.json({ ...feed, platformCounts });
}

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
  const parsed = addContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await addManualContent(id, parsed.data);
  return NextResponse.json(item, { status: 201 });
}
