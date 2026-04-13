import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  const players = await prisma.player.findMany({
    where: q
      ? { fullName: { contains: q } }
      : undefined,
    orderBy: { fullName: "asc" },
    take: 50,
  });

  return NextResponse.json(players.map((p) => ({ id: p.id, fullName: p.fullName })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = (body.fullName || "").trim();

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  const existing = await prisma.player.findUnique({ where: { fullName } });
  if (existing) {
    return NextResponse.json({ id: existing.id, fullName: existing.fullName });
  }

  const player = await prisma.player.create({ data: { fullName } });
  return NextResponse.json({ id: player.id, fullName: player.fullName }, { status: 201 });
}
