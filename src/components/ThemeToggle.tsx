"use client";

import styled from "styled-components";
import { useThemeMode } from "@/lib/ThemeClient";

const ToggleButton = styled.button`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadow.toggle};
  z-index: 1000;
  transition: background 0.2s, border-color 0.2s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: scale(0.92);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    top: ${({ theme }) => theme.spacing.xl};
    right: ${({ theme }) => theme.spacing.xl};
  }
`;

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <ToggleButton onClick={toggleTheme} aria-label="Toggle dark mode">
      {isDark ? "☀️" : "🌙"}
    </ToggleButton>
  );
}
