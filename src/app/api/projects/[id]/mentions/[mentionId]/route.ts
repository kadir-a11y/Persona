import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMentionById, updateMention, deleteMention, assignMentionResponse, markAsResponded } from "@/lib/services/project-mention-service";
import { mentionUpdateSchema } from "@/lib/validators/project";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mentionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mentionId } = await params;
  const mention = await getMentionById(mentionId);
  if (!mention) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(mention);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mentionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mentionId } = await params;
  const body = await req.json();

  // Yanıt atama
  if (body.action === "assign") {
    const assignSchema = z.object({ action: z.literal("assign"), personaId: z.string().uuid() });
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const mention = await assignMentionResponse(mentionId, parsed.data.personaId);
    return mention ? NextResponse.json(mention) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Yanıt verildi
  if (body.action === "respond") {
    const respondSchema = z.object({ action: z.literal("respond"), contentItemId: z.string().uuid() });
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const mention = await markAsResponded(mentionId, parsed.data.contentItemId);
    return mention ? NextResponse.json(mention) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Genel güncelleme
  const parsed = mentionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const mention = await updateMention(mentionId, parsed.data);
  return mention ? NextResponse.json(mention) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mentionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mentionId } = await params;
  const mention = await deleteMention(mentionId);
  return mention ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
