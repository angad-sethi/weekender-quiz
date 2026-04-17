import fs from "fs";
import path from "path";
import { getWeekendKey } from "./weekend";

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
  matchType?: "default" | "set" | "ordered" | "keywords";
  keywords?: string[];
}

export type Question = MCQQuestion | TextQuestion;

export interface QuizSource {
  author: string;
  publication: string;
  url: string;
}

export interface QuizData {
  weekendOf: string;
  title: string;
  source?: QuizSource;
  questions: Question[];
}

/** Client-safe question (no answers) */
export interface ClientQuestion {
  id: number;
  type: "mcq" | "text";
  question: string;
  options?: string[];
}

const quizCache = new Map<string, QuizData>();

export function loadQuiz(weekendKey?: string): QuizData {
  const key = weekendKey ?? getWeekendKey();

  if (process.env.NODE_ENV === "production" && quizCache.has(key)) {
    return quizCache.get(key)!;
  }

  const quizzesDir = path.join(process.cwd(), "data", "quizzes");
  const exactPath = path.join(quizzesDir, `${key}.json`);

  let filePath: string;
  if (fs.existsSync(exactPath)) {
    filePath = exactPath;
  } else {
    const files = fs
      .readdirSync(quizzesDir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error("No quiz files found in data/quizzes/");
    }

    // Most recent file whose date is <= the requested key
    const match = files.find((f) => f.replace(".json", "") <= key);
    filePath = path.join(quizzesDir, match ?? files[files.length - 1]);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const quiz = JSON.parse(raw) as QuizData;
  quizCache.set(key, quiz);
  return quiz;
}

export function getAvailableQuizDates(): string[] {
  const quizzesDir = path.join(process.cwd(), "data", "quizzes");
  return fs
    .readdirSync(quizzesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

export function getClientQuestions(weekendKey?: string): ClientQuestion[] {
  const quiz = loadQuiz(weekendKey);
  return quiz.questions.map((q) => {
    const base: ClientQuestion = { id: q.id, type: q.type, question: q.question };
    if (q.type === "mcq") base.options = q.options;
    return base;
  });
}
