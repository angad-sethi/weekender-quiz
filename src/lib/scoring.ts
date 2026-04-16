import { Question } from "./questions";
import {
  normaliseAnswer,
  fuzzyMatch,
  tokenMatch,
  keywordMatch,
} from "./answer-matching";

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
      const normUser = normaliseAnswer(userAnswer);
      const normAnswer = normaliseAnswer(q.answer);
      const normAcceptable = q.acceptableAnswers.map(normaliseAnswer);

      if (normUser === normAnswer || normAcceptable.includes(normUser)) {
        isCorrect = true;
      } else if (q.matchType === "set" || q.matchType === "ordered") {
        isCorrect = tokenMatch(normUser, normAnswer, q.matchType === "ordered");
      } else if (!q.matchType || q.matchType === "default") {
        isCorrect =
          fuzzyMatch(normUser, normAnswer) ||
          normAcceptable.some((acc) => fuzzyMatch(normUser, acc));
      }

      if (!isCorrect && q.keywords && q.keywords.length > 0) {
        isCorrect = keywordMatch(userAnswer, q.keywords);
      }
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
