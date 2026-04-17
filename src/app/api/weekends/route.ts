import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableQuizDates } from "@/lib/questions";

export async function GET() {
  const [rows, quizDates] = await Promise.all([
    prisma.submission.findMany({
      select: { weekendKey: true },
      distinct: ["weekendKey"],
      orderBy: { weekendKey: "desc" },
    }),
    Promise.resolve(getAvailableQuizDates()),
  ]);

  const submissionWeekends = rows.map((r) => r.weekendKey);
  const merged = [...new Set([...quizDates, ...submissionWeekends])].sort().reverse();

  return NextResponse.json({ weekends: merged });
}
