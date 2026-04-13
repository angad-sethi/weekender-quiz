"use client";

import styled from "styled-components";

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  members: string[];
  score: number;
  totalQuestions: number;
  createdAt: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const Table = styled.div`
  width: 100%;
`;

const Entry = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border-left: 4px solid
    ${({ $rank, theme }) => {
      if ($rank === 1) return theme.colors.gold;
      if ($rank === 2) return theme.colors.silver;
      if ($rank === 3) return theme.colors.bronze;
      return theme.colors.border;
    }};
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.md};
  flex-shrink: 0;
  background: ${({ $rank, theme }) => {
    if ($rank === 1) return theme.colors.gold;
    if ($rank === 2) return theme.colors.silver;
    if ($rank === 3) return theme.colors.bronze;
    return theme.colors.border;
  }};
  color: ${({ $rank }) => ($rank <= 3 ? "white" : "#636E72")};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const TeamName = styled.div`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Members = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Score = styled.div`
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const TimeStamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  flex-shrink: 0;
  text-align: right;
  min-width: 50px;
`;

const EmptyState = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
`;

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <EmptyState>No submissions yet this weekend. Be the first!</EmptyState>;
  }

  return (
    <Table>
      {entries.map((entry) => {
        const time = new Date(entry.createdAt);
        const timeStr = time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <Entry key={`${entry.teamName}-${entry.rank}`} $rank={entry.rank}>
            <RankBadge $rank={entry.rank}>{entry.rank}</RankBadge>
            <Info>
              <TeamName>{entry.teamName}</TeamName>
              <Members>{entry.members.join(", ")}</Members>
            </Info>
            <Score>
              {entry.score}/{entry.totalQuestions}
            </Score>
            <TimeStamp>{timeStr}</TimeStamp>
          </Entry>
        );
      })}
    </Table>
  );
}
