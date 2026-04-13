"use client";

import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import LeaderboardTable from "@/components/LeaderboardTable";

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

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
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

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [weekend, setWeekend] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setEntries(data.leaderboard);
      setWeekend(data.weekend);
      setLastUpdate(new Date());
    } catch {
      // silently retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  useEffect(() => {
    function handleFocus() {
      fetchLeaderboard();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchLeaderboard]);

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
        <Subtitle>Weekend of {weekend}</Subtitle>
      </Header>

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
    </Container>
  );
}
