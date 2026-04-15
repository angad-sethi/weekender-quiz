"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import QuestionCard from "@/components/QuestionCard";

interface ClientQuestion {
  id: number;
  type: "mcq" | "text";
  question: string;
  options?: string[];
}

const Container = styled.div`
  min-height: 100dvh;
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 640px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QuizTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: 0.04em;
`;

const TeamInfo = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
  min-height: 52px;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondaryHover};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoadingMsg = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("teamName") || "";
  const playerIds = searchParams.get("playerIds") || "";

  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    if (!teamName) {
      router.replace("/");
      return;
    }

    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setQuizTitle(data.title);
        setLoadingQuestions(false);
      })
      .catch(() => {
        setError("Failed to load questions");
        setLoadingQuestions(false);
      });
  }, [teamName, router]);

  const handleAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: value }));
  }, []);

  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          playerIds: playerIds.split(",").map(Number),
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit");
        setSubmitting(false);
        return;
      }

      sessionStorage.setItem("quizResults", JSON.stringify(data));
      router.push("/results");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!teamName) return null;

  if (loadingQuestions) {
    return (
      <Container>
        <LoadingMsg>Loading questions...</LoadingMsg>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <QuizTitle>{quizTitle || "Weekend Quiz"}</QuizTitle>
        <TeamInfo>Team: {teamName}</TeamInfo>
      </Header>

      <ProgressBar>
        <ProgressFill $pct={progress} />
      </ProgressBar>

      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={idx}
          total={questions.length}
          value={answers[String(q.id)] || ""}
          onChange={(val) => handleAnswer(q.id, val)}
        />
      ))}

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <SubmitButton disabled={submitting} onClick={handleSubmit}>
        {submitting ? "Submitting..." : "Submit Answers"}
      </SubmitButton>
    </Container>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "48px" }}>Loading...</div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
