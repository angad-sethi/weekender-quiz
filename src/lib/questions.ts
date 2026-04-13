import fs from "fs";
import path from "path";

export interface MCQQuestion {
  id: number;
  type: "mcq";
  question: string;
  options: string[];
  answer: string;
}

export interface TextQuestion {
  id: number;
  type: "text";
  question: string;
  answer: string;
  acceptableAnswers: string[];
}

export type Question = MCQQuestion | TextQuestion;

export interface QuizData {
  weekendOf: string;
  title: string;
  questions: Question[];
}

/** Client-safe question (no answers) */
export interface ClientQuestion {
  id: number;
  type: "mcq" | "text";
  question: string;
  options?: string[];
}

let cachedQuiz: QuizData | null = null;

export function loadQuiz(): QuizData {
  if (cachedQuiz && process.env.NODE_ENV === "production") return cachedQuiz;

  const filePath = path.join(process.cwd(), "data", "questions.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedQuiz = JSON.parse(raw) as QuizData;
  return cachedQuiz;
}

export function getClientQuestions(): ClientQuestion[] {
  const quiz = loadQuiz();
  return quiz.questions.map((q) => {
    const base: ClientQuestion = { id: q.id, type: q.type, question: q.question };
    if (q.type === "mcq") base.options = q.options;
    return base;
  });
}
