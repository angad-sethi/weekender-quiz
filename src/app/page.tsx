"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import PlayerSearch from "@/components/PlayerSearch";
import TeamMemberChips from "@/components/TeamMemberChips";
import AttributionFooter from "@/components/AttributionFooter";

interface Player {
  id: number;
  fullName: string;
}

const Container = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 480px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Title = styled.h1`
  font-family: var(--font-heading), Georgia, serif;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  letter-spacing: 0.04em;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const FieldGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChipsWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const StartButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
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
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LeaderboardLink = styled.a`
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

export default function HomePage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canStart = teamName.trim().length > 0 && players.length > 0 && !loading;

  function handleSelectPlayer(player: Player) {
    if (!players.find((p) => p.id === player.id)) {
      setPlayers((prev) => [...prev, player]);
    }
  }

  function handleRemovePlayer(id: number) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleStart() {
    if (!canStart) return;
    setError("");
    setLoading(true);

    const params = new URLSearchParams({
      teamName: teamName.trim(),
      playerIds: players.map((p) => p.id).join(","),
      playerNames: players.map((p) => p.fullName).join(","),
    });

    router.push(`/quiz?${params.toString()}`);
  }

  return (
    <Container>
      <Card>
        <Title>Good Weekender Quiz</Title>

        <FieldGroup>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            type="text"
            placeholder="Enter your team name..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Team Members</Label>
          <PlayerSearch
            selectedPlayers={players}
            onSelect={handleSelectPlayer}
          />
          <ChipsWrapper>
            <TeamMemberChips players={players} onRemove={handleRemovePlayer} />
          </ChipsWrapper>
        </FieldGroup>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <StartButton disabled={!canStart} onClick={handleStart}>
          {loading ? "Loading..." : "Start Quiz"}
        </StartButton>

        <LeaderboardLink href="/leaderboard">View Leaderboard</LeaderboardLink>
      </Card>
      <AttributionFooter />
    </Container>
  );
}
