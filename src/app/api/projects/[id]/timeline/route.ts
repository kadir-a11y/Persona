import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/services/project-service";
import { getTimeline, addNote } from "@/lib/services/project-timeline-service";
import { timelineEventCreateSchema } from "@/lib/validators/project";

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
  const eventType = searchParams.get("eventType")?.split(",").filter(Boolean) || undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
  const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

  const timeline = await getTimeline(id, { eventType, limit, offset });
  return NextResponse.json(timeline);
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
  const parsed = timelineEventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Kullanıcı sadece "note" tipinde event ekleyebilir
  if (parsed.data.eventType === "note") {
    const event = await addNote(id, session.user.id, parsed.data.title, parsed.data.description);
    return NextResponse.json(event, { status: 201 });
  }

  return NextResponse.json({ error: "Sadece not ekleyebilirsiniz" }, { status: 400 });
}
