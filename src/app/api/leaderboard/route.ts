import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekendKey } from "@/lib/weekend";

export async function GET(request: NextRequest) {
  const weekend = request.nextUrl.searchParams.get("weekend") || getWeekendKey();

  const submissions = await prisma.submission.findMany({
    where: { weekendKey: weekend },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    include: { members: { include: { player: true } } },
  });

  const leaderboard = submissions.map((s, idx) => ({
    rank: idx + 1,
    teamName: s.teamName,
    members: s.members.map((m) => m.player.fullName),
    score: s.score,
    totalQuestions: s.totalQuestions,
    createdAt: s.createdAt.toISOString(),
  }));

  return NextResponse.json({ weekend, leaderboard });
}
