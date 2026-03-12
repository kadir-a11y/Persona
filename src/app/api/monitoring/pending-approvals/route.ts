import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPendingApprovals } from "@/lib/services/auto-post-service";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  try {
    const items = await getPendingApprovals(session.user.id, isAdmin);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Failed to fetch pending approvals:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
