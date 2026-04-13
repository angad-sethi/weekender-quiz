"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

interface QuestionResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizResults {
  teamName: string;
  score: number;
  totalQuestions: number;
  results: QuestionResult[];
  members: string[];
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
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
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

const ResultCard = styled.div<{ $correct: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-left: 4px solid
    ${({ $correct, theme }) =>
      $correct ? theme.colors.success : theme.colors.error};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const ResultQuestion = styled.p`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const AnswerRow = styled.div`
  display: flex;
  justify-content: space-between;
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

  const percentage = Math.round((data.score / data.totalQuestions) * 100);

  return (
    <Container>
      <ScoreCard>
        <ScoreTitle>{data.teamName}</ScoreTitle>
        <ScoreValue>
          {data.score} / {data.totalQuestions}
        </ScoreValue>
        <ScoreSub>{percentage}% correct</ScoreSub>
        {data.members?.length > 0 && (
          <MembersList>Team: {data.members.join(", ")}</MembersList>
        )}
      </ScoreCard>

      {data.results.map((r) => (
        <ResultCard key={r.questionId} $correct={r.isCorrect}>
          <ResultQuestion>
            <StatusIcon $correct={r.isCorrect}>
              {r.isCorrect ? "\u2705" : "\u274C"}
            </StatusIcon>{" "}
            {r.question}
          </ResultQuestion>
          <AnswerRow>
            <AnswerLabel $type="user">Your answer: {r.userAnswer}</AnswerLabel>
            {!r.isCorrect && (
              <AnswerLabel $type="correct">
                Correct: {r.correctAnswer}
              </AnswerLabel>
            )}
          </AnswerRow>
        </ResultCard>
      ))}

      <LeaderboardButton href="/leaderboard">View Leaderboard</LeaderboardButton>
      <HomeLink href="/">Play Again</HomeLink>
    </Container>
  );
}
