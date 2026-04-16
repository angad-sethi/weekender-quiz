"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import AttributionFooter from "@/components/AttributionFooter";

interface QuestionResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizResults {
  submissionId: number;
  teamName: string;
  score: number;
  totalQuestions: number;
  results: QuestionResult[];
  members: string[];
  overrides?: Record<number, boolean>;
}

const Container = styled.div`
  min-height: 100dvh;
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 640px;
  margin: 0 auto;
`;

const ScoreCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ScoreTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ScoreValue = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ScoreSub = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const MembersList = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ResultCard = styled.div<{ $correct: boolean; $hasOverride?: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ $hasOverride, theme }) =>
    $hasOverride ? `calc(${theme.spacing.md} + 40px)` : theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-left: 4px solid
    ${({ $correct, theme }) =>
      $correct ? theme.colors.success : theme.colors.error};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

const ResultQuestion = styled.p`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const AnswerRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AnswerLabel = styled.span<{ $type: "user" | "correct" }>`
  color: ${({ $type, theme }) =>
    $type === "correct" ? theme.colors.success : theme.colors.textLight};
`;

const StatusIcon = styled.span<{ $correct: boolean }>`
  font-size: 1.2rem;
`;

const OverridePill = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  bottom: ${({ theme }) => theme.spacing.md};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  padding: 4px 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const LeaderboardButton = styled.a`
  display: block;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing.md};
  min-height: 52px;
  line-height: 52px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const HomeLink = styled.a`
  display: block;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<QuizResults | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResults");
    if (!stored) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

  const overrides = data.overrides ?? {};
  const overrideCount = Object.values(overrides).filter(Boolean).length;
  const adjustedScore = data.score + overrideCount;
  const percentage = Math.round((adjustedScore / data.totalQuestions) * 100);
  function toggleOverride(questionId: number) {
    if (!data) return;

    const next = { ...overrides };
    if (next[questionId]) {
      delete next[questionId];
    } else {
      next[questionId] = true;
    }

    const newOverrideCount = Object.values(next).filter(Boolean).length;
    const newScore = data.score + newOverrideCount;

    const updated = { ...data, overrides: next };
    setData(updated);
    sessionStorage.setItem("quizResults", JSON.stringify(updated));

    fetch(`/api/submit/${data.submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: newScore }),
    });
  }

  return (
    <Container>
      <ScoreCard>
        <ScoreTitle>{data.teamName}</ScoreTitle>
        <ScoreValue>
          {adjustedScore} / {data.totalQuestions}
        </ScoreValue>
        <ScoreSub>{percentage}% correct</ScoreSub>
        {data.members?.length > 0 && (
          <MembersList>Team: {data.members.join(", ")}</MembersList>
        )}
      </ScoreCard>

      {data.results.map((r) => {
        const isOverridden = !r.isCorrect && overrides[r.questionId];
        const showCorrect = r.isCorrect || isOverridden;

        return (
          <ResultCard key={r.questionId} $correct={showCorrect} $hasOverride={!r.isCorrect}>
            <ResultQuestion>
              <StatusIcon $correct={showCorrect}>
                {showCorrect ? "\u2705" : "\u274C"}
              </StatusIcon>{" "}
              {r.question}
            </ResultQuestion>
            <AnswerRow>
              <AnswerLabel $type="user">
                Your answer: {r.userAnswer}
              </AnswerLabel>
              <AnswerLabel $type="correct">
                Correct: {r.correctAnswer}
              </AnswerLabel>
            </AnswerRow>
            {!r.isCorrect && !isOverridden && (
              <OverridePill onClick={() => toggleOverride(r.questionId)}>
                Mark as correct
              </OverridePill>
            )}
            {isOverridden && (
              <OverridePill onClick={() => toggleOverride(r.questionId)}>
                Undo
              </OverridePill>
            )}
          </ResultCard>
        );
      })}

      <LeaderboardButton href="/leaderboard">View Leaderboard</LeaderboardButton>
      <HomeLink href="/">Play Again</HomeLink>
      <AttributionFooter />
    </Container>
  );
}
