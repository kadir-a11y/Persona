import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rejectItem } from "@/lib/services/auto-post-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  try {
    const result = await rejectItem(id, session.user.id, isAdmin);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to reject item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
