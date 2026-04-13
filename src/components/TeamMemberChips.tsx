"use client";

import styled from "styled-components";

interface Player {
  id: number;
  fullName: string;
}

interface TeamMemberChipsProps {
  players: Player[];
  onRemove: (id: number) => void;
}

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export default function TeamMemberChips({ players, onRemove }: TeamMemberChipsProps) {
  if (players.length === 0) return null;

  return (
    <ChipsContainer>
      {players.map((p) => (
        <Chip key={p.id}>
          {p.fullName}
          <RemoveBtn onClick={() => onRemove(p.id)} aria-label={`Remove ${p.fullName}`}>
            &times;
          </RemoveBtn>
        </Chip>
      ))}
    </ChipsContainer>
  );
}
