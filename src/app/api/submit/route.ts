import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadQuiz } from "@/lib/questions";
import { scoreAnswers } from "@/lib/scoring";
import { getWeekendKey } from "@/lib/weekend";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, playerIds, answers } = body as {
    teamName: string;
    playerIds: number[];
    answers: Record<string, string>;
  };

  if (!teamName?.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }
  if (!playerIds?.length) {
    return NextResponse.json({ error: "At least one team member is required" }, { status: 400 });
  }
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Answers are required" }, { status: 400 });
  }

  const weekendKey = getWeekendKey();

  const existingSubmission = await prisma.submission.findUnique({
    where: { teamName_weekendKey: { teamName: teamName.trim(), weekendKey } },
  });
  if (existingSubmission) {
    return NextResponse.json(
      { error: "This team has already submitted for this weekend" },
      { status: 409 }
    );
  }

  const quiz = loadQuiz();
  const { score, results } = scoreAnswers(quiz.questions, answers);

  const submission = await prisma.submission.create({
    data: {
      teamName: teamName.trim(),
      score,
      totalQuestions: quiz.questions.length,
      answers: JSON.stringify(answers),
      weekendKey,
      members: {
        create: playerIds.map((playerId) => ({ playerId })),
      },
    },
    include: { members: { include: { player: true } } },
  });

  return NextResponse.json({
    submissionId: submission.id,
    teamName: submission.teamName,
    score,
    totalQuestions: quiz.questions.length,
    results,
    members: submission.members.map((m) => m.player.fullName),
  });
}
