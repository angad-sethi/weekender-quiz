import { NextResponse } from "next/server";
import { getClientQuestions, loadQuiz } from "@/lib/questions";

export async function GET() {
  const quiz = loadQuiz();
  return NextResponse.json({
    title: quiz.title,
    weekendOf: quiz.weekendOf,
    questions: getClientQuestions(),
  });
}
