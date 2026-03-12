import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { personas } from "@/lib/db/schema";
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

  const rows = isAdmin
    ? await db.select().from(personas)
    : await db.select().from(personas).where(eq(personas.userId, session.user.id));

  const header = "Name,Bio,Gender,BirthDate,Country,City,Language,IsActive,CreatedAt\n";
  const csvRows = rows
    .map((p) =>
      [
        escapeCsv(p.name),
        escapeCsv(p.bio),
        escapeCsv(p.gender),
        escapeCsv(p.birthDate),
        escapeCsv(p.country),
        escapeCsv(p.city),
        escapeCsv(p.language),
        escapeCsv(p.isActive),
        escapeCsv(p.createdAt),
      ].join(",")
    )
    .join("\n");

  const csv = header + csvRows;
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=personas-export-${date}.csv`,
    },
  });
}
