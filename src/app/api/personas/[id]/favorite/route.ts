import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { personas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [persona] = await db
    .select({ id: personas.id, isFavorite: personas.isFavorite })
    .from(personas)
    .where(eq(personas.id, id));

  if (!persona) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(personas)
    .set({ isFavorite: !persona.isFavorite, updatedAt: new Date() })
    .where(eq(personas.id, id))
    .returning({ id: personas.id, isFavorite: personas.isFavorite });

  return NextResponse.json(updated);
}
