import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkDuplicatePersonaName } from "@/lib/services/persona-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = req.nextUrl.searchParams.get("name");
  const excludeId = req.nextUrl.searchParams.get("excludeId");

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ duplicates: [] });
  }

  const duplicates = await checkDuplicatePersonaName(name, excludeId || undefined);
  return NextResponse.json({ duplicates });
}
