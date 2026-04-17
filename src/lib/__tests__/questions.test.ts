import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { loadQuiz, getClientQuestions } from "../questions";

const QUIZ_A = {
  weekendOf: "2026-04-04",
  title: "Quiz A",
  questions: [
    { id: 1, type: "text", question: "Q1", answer: "A1", acceptableAnswers: [] },
  ],
};

const QUIZ_B = {
  weekendOf: "2026-04-11",
  title: "Quiz B",
  questions: [
    { id: 1, type: "text", question: "Q1", answer: "A1", acceptableAnswers: [] },
  ],
};

let tmpDir: string;
let quizzesDir: string;
const originalCwd = process.cwd;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "quiz-test-"));
  quizzesDir = path.join(tmpDir, "data", "quizzes");
  fs.mkdirSync(quizzesDir, { recursive: true });
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeQuiz(filename: string, data: object) {
  fs.writeFileSync(path.join(quizzesDir, filename), JSON.stringify(data));
}

describe("loadQuiz", () => {
  it("returns the exact match when the file exists", () => {
    writeQuiz("2026-04-11.json", QUIZ_B);
    const quiz = loadQuiz("2026-04-11");
    expect(quiz.title).toBe("Quiz B");
  });

  it("falls back to the most recent past quiz when no exact match", () => {
    writeQuiz("2026-04-04.json", QUIZ_A);
    writeQuiz("2026-04-11.json", QUIZ_B);
    const quiz = loadQuiz("2026-04-18");
    expect(quiz.title).toBe("Quiz B");
  });

  it("throws when the quizzes directory is empty", () => {
    expect(() => loadQuiz("2026-04-11")).toThrow(
      "No quiz files found in data/quizzes/"
    );
  });

  it("strips answers from client questions", () => {
    writeQuiz("2026-04-11.json", QUIZ_B);
    const clientQs = getClientQuestions("2026-04-11");
    expect(clientQs[0]).not.toHaveProperty("answer");
    expect(clientQs[0]).toHaveProperty("question");
  });
});
