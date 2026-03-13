import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectActivityLogs } from "@/lib/services/activity-log-service";

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
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const action = searchParams.get("action") || undefined;

  const logs = await getProjectActivityLogs(id, limit, offset, action);
  return NextResponse.json(logs);
}
