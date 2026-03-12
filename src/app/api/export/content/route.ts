import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, personas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  const baseQuery = db
    .select({
      personaName: personas.name,
      platform: contentItems.platform,
      contentType: contentItems.contentType,
      status: contentItems.status,
      scheduledAt: contentItems.scheduledAt,
      publishedAt: contentItems.publishedAt,
      createdAt: contentItems.createdAt,
    })
    .from(contentItems)
    .innerJoin(personas, eq(contentItems.personaId, personas.id));

  const rows = isAdmin
    ? await baseQuery
    : await baseQuery.where(eq(personas.userId, session.user.id));

  const header = "PersonaName,Platform,ContentType,Status,ScheduledAt,PublishedAt,CreatedAt\n";
  const csvRows = rows
    .map((r) =>
      [
        escapeCsv(r.personaName),
        escapeCsv(r.platform),
        escapeCsv(r.contentType),
        escapeCsv(r.status),
        escapeCsv(r.scheduledAt),
        escapeCsv(r.publishedAt),
        escapeCsv(r.createdAt),
      ].join(",")
    )
    .join("\n");

  const csv = header + csvRows;
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=content-export-${date}.csv`,
    },
  });
}
