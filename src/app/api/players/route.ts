import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limitParam = request.nextUrl.searchParams.get("limit");
  const take = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 50) : 50;

  const players = await prisma.player.findMany({
    where: q
      ? { fullName: { contains: q, mode: "insensitive" as const } }
      : undefined,
    orderBy: { fullName: "asc" },
    take,
  });

  return NextResponse.json(players.map((p) => ({ id: p.id, fullName: p.fullName })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = (body.fullName || "").trim();

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  const existing = await prisma.player.findFirst({
    where: { fullName: { equals: fullName, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(
      { error: `"${existing.fullName}" already exists` },
      { status: 409 }
    );
  }

  const player = await prisma.player.create({ data: { fullName } });
  return NextResponse.json({ id: player.id, fullName: player.fullName }, { status: 201 });
}
