import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { filterPersonas, getFilterOptions } from "@/lib/services/persona-filter-service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbUser] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const isAdmin = Boolean(dbUser?.isAdmin);

  const { searchParams } = new URL(req.url);

  // If only requesting filter options
  if (searchParams.get("options") === "true") {
    const options = await getFilterOptions(session.user.id, isAdmin);
    return NextResponse.json(options);
  }

  const criteria = {
    country: searchParams.get("country") || undefined,
    language: searchParams.get("language") || undefined,
    gender: searchParams.get("gender") || undefined,
    tagIds: searchParams.get("tagIds")?.split(",").filter(Boolean) || undefined,
    roleIds: searchParams.get("roleIds")?.split(",").filter(Boolean) || undefined,
    interests: searchParams.get("interests")?.split(",").filter(Boolean) || undefined,
    isActive: searchParams.get("isActive") === "true" ? true : searchParams.get("isActive") === "false" ? false : undefined,
    hasAccountOnPlatform: searchParams.get("hasAccountOnPlatform") || undefined,
    personaIds: searchParams.get("personaIds")?.split(",").filter(Boolean) || undefined,
    minInfluenceScore: searchParams.get("minInfluenceScore") ? parseInt(searchParams.get("minInfluenceScore")!) : undefined,
    isFavorite: searchParams.get("isFavorite") === "true" ? true : undefined,
  };

  const personas = await filterPersonas(session.user.id, criteria, isAdmin);
  return NextResponse.json(personas);
}
