import { Question } from "./questions";

export interface QuestionResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<string, string>
): { score: number; results: QuestionResult[] } {
  let score = 0;
  const results: QuestionResult[] = [];

  for (const q of questions) {
    const userAnswer = (answers[String(q.id)] || "").trim();
    let isCorrect = false;

    if (q.type === "mcq") {
      isCorrect = userAnswer === q.answer;
    } else {
      const normalised = userAnswer.toLowerCase();
      const acceptable = q.acceptableAnswers.map((a) => a.toLowerCase());
      isCorrect =
        normalised === q.answer.toLowerCase() || acceptable.includes(normalised);
    }

    if (isCorrect) score++;

    results.push({
      questionId: q.id,
      question: q.question,
      userAnswer: userAnswer || "(no answer)",
      correctAnswer: q.answer,
      isCorrect,
    });
  }

  return { score, results };
}
