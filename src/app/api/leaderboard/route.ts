import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadQuiz, getAvailableQuizDates } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const weekend =
    request.nextUrl.searchParams.get("weekend") || getAvailableQuizDates()[0];

  const submissions = await prisma.submission.findMany({
    where: { weekendKey: weekend },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    include: { members: { include: { player: true } } },
  });

  let title: string | null = null;
  try {
    const quiz = loadQuiz(weekend);
    if (quiz.weekendOf === weekend) {
      title = quiz.title;
    }
  } catch {
    // Quiz file may not exist for old weekends
  }

  const leaderboard = submissions.map((s, idx) => ({
    rank: idx + 1,
    teamName: s.teamName,
    members: s.members.map((m) => m.player.fullName),
    score: s.score,
    totalQuestions: s.totalQuestions,
    createdAt: s.createdAt.toISOString(),
  }));

  return NextResponse.json({ weekend, title, leaderboard });
}
