import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/services/project-service";
import { getMentions, addMention } from "@/lib/services/project-mention-service";
import { mentionCreateSchema } from "@/lib/validators/project";

export async function GET(
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

  const { searchParams } = new URL(req.url);
  const filters = {
    platform: searchParams.get("platform") || undefined,
    sentiment: searchParams.get("sentiment") || undefined,
    responseStatus: searchParams.get("responseStatus") || undefined,
    search: searchParams.get("search") || undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
  };

  const mentions = await getMentions(id, filters);
  return NextResponse.json(mentions);
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
  const project = await getProjectById(id, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = mentionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mention = await addMention(id, parsed.data);
  return NextResponse.json(mention, { status: 201 });
}
