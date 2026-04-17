"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";
import LeaderboardTable from "@/components/LeaderboardTable";
import AttributionFooter from "@/components/AttributionFooter";

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  members: string[];
  score: number;
  totalQuestions: number;
  createdAt: string;
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

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const QuizTitle = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const WeekendSelector = styled.select`
  display: block;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23636E72' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;

  option {
    font-size: 1rem;
    padding: ${({ theme }) => theme.spacing.sm};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const LastUpdated = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const HomeLink = styled.a`
  display: block;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMsg = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const POLL_INTERVAL = 30000;

function formatWeekendDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const initialWeekend = searchParams.get("weekend");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [weekends, setWeekends] = useState<string[]>([]);
  const [selectedWeekend, setSelectedWeekend] = useState(initialWeekend ?? "");
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [currentWeekend, setCurrentWeekend] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = useCallback(async (weekend: string) => {
    try {
      const res = await fetch(`/api/leaderboard?weekend=${weekend}`);
      const data = await res.json();
      setEntries(data.leaderboard);
      setQuizTitle(data.title ?? null);
      setLastUpdate(new Date());
    } catch {
      // silently retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const [weekendsRes, leaderboardRes] = await Promise.all([
        fetch("/api/weekends").then((r) => r.json()),
        fetch("/api/leaderboard").then((r) => r.json()),
      ]);

      const current: string = leaderboardRes.weekend;
      const availableWeekends: string[] = weekendsRes.weekends;
      if (!availableWeekends.includes(current)) {
        availableWeekends.unshift(current);
      }
      setWeekends(availableWeekends);
      setCurrentWeekend(current);

      const target =
        initialWeekend && availableWeekends.includes(initialWeekend)
          ? initialWeekend
          : current;

      setSelectedWeekend(target);

      if (target === leaderboardRes.weekend) {
        setEntries(leaderboardRes.leaderboard);
        setQuizTitle(leaderboardRes.title ?? null);
        setLastUpdate(new Date());
        setLoading(false);
      } else {
        fetchLeaderboard(target);
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedWeekend || !currentWeekend) return;

    if (pollRef.current) clearInterval(pollRef.current);

    if (selectedWeekend === currentWeekend) {
      pollRef.current = setInterval(
        () => fetchLeaderboard(selectedWeekend),
        POLL_INTERVAL,
      );
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedWeekend, currentWeekend, fetchLeaderboard]);

  useEffect(() => {
    if (!selectedWeekend || selectedWeekend !== currentWeekend) return;
    function handleFocus() {
      fetchLeaderboard(selectedWeekend);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [selectedWeekend, currentWeekend, fetchLeaderboard]);

  function handleWeekendChange(newWeekend: string) {
    setSelectedWeekend(newWeekend);
    setLoading(true);
    const url = new URL(window.location.href);
    url.searchParams.set("weekend", newWeekend);
    window.history.replaceState({}, "", url.toString());
    fetchLeaderboard(newWeekend);
  }

  if (loading) {
    return (
      <Container>
        <LoadingMsg>Loading leaderboard...</LoadingMsg>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Leaderboard</Title>
        {quizTitle && <QuizTitle>{quizTitle}</QuizTitle>}
      </Header>

      {weekends.length > 0 && (
        <WeekendSelector
          value={selectedWeekend}
          onChange={(e) => handleWeekendChange(e.target.value)}
        >
          {weekends.map((w) => (
            <option key={w} value={w}>
              {formatWeekendDate(w)}
              {w === currentWeekend ? " (current)" : ""}
            </option>
          ))}
        </WeekendSelector>
      )}

      <LeaderboardTable entries={entries} />

      {lastUpdate && (
        <LastUpdated>
          Last updated:{" "}
          {lastUpdate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </LastUpdated>
      )}

      <HomeLink href="/">Back to Home</HomeLink>
      <AttributionFooter />
    </Container>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <LoadingMsg>Loading leaderboard...</LoadingMsg>
        </Container>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
