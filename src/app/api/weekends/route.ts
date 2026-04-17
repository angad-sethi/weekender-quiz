import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.submission.findMany({
    select: { weekendKey: true },
    distinct: ["weekendKey"],
    orderBy: { weekendKey: "desc" },
  });

  const weekends = rows.map((r) => r.weekendKey);
  return NextResponse.json({ weekends });
}
