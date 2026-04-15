"use client";

import { useState, useEffect, useRef } from "react";
import styled from "styled-components";

interface Player {
  id: number;
  fullName: string;
}

interface PlayerSearchProps {
  selectedPlayers: Player[];
  onSelect: (player: Player) => void;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
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

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadiusSm} ${({ theme }) => theme.borderRadiusSm};
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadow.dropdown};
`;

const DropdownItem = styled.li<{ $highlighted?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ $highlighted, theme }) =>
    $highlighted ? theme.colors.primary + "15" : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}15;
  }
`;

const AddNewButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  background: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}15;
  }
`;

const Hint = styled.li`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ErrorText = styled.li`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const NAME_PATTERN = /^[a-zA-Z'-]+\s+[a-zA-Z'-]+$/;

function isValidFullName(name: string): boolean {
  return NAME_PATTERN.test(name.trim());
}

export default function PlayerSearch({ selectedPlayers, onSelect }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const showDropdownRef = useRef(false);
  showDropdownRef.current = showDropdown;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setError("");

    if (!query.trim()) {
      if (showDropdownRef.current) {
        fetch("/api/players?limit=5")
          .then((res) => res.json())
          .then((data: Player[]) => {
            const selectedIds = new Set(selectedPlayers.map((p) => p.id));
            setResults(data.filter((p) => !selectedIds.has(p.id)));
          });
      } else {
        setResults([]);
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(query.trim())}`);
        const data: Player[] = await res.json();
        const selectedIds = new Set(selectedPlayers.map((p) => p.id));
        setResults(data.filter((p) => !selectedIds.has(p.id)));
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedPlayers]);

  async function handleAddNew() {
    const name = query.trim();
    if (!name) return;
    setError("");

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add player");
      return;
    }

    onSelect(data);
    setQuery("");
    setShowDropdown(false);
  }

  async function handleFocus() {
    if (query.trim()) {
      setShowDropdown(true);
      return;
    }

    setLoading(true);
    setShowDropdown(true);
    try {
      const res = await fetch("/api/players?limit=5");
      const data: Player[] = await res.json();
      const selectedIds = new Set(selectedPlayers.map((p) => p.id));
      setResults(data.filter((p) => !selectedIds.has(p.id)));
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(player: Player) {
    onSelect(player);
    setQuery("");
    setShowDropdown(false);
  }

  const exactMatch = results.some(
    (p) => p.fullName.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <Wrapper ref={wrapperRef}>
      <Input
        type="text"
        placeholder="Search or add team member..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
      />
      {showDropdown && (query.trim() || results.length > 0) && (
        <Dropdown>
          {loading && <DropdownItem>Searching...</DropdownItem>}
          {!loading && results.map((p) => (
            <DropdownItem key={p.id} onClick={() => handleSelect(p)}>
              {p.fullName}
            </DropdownItem>
          ))}
          {!loading && query.trim() && !exactMatch && (
            isValidFullName(query) ? (
              <AddNewButton onClick={handleAddNew}>
                + Add &ldquo;{query.trim()}&rdquo; as new player
              </AddNewButton>
            ) : (
              <Hint>Enter a first and last name (e.g. Jane Smith)</Hint>
            )
          )}
          {!loading && results.length === 0 && exactMatch && (
            <DropdownItem>No more results</DropdownItem>
          )}
          {error && <ErrorText>{error}</ErrorText>}
        </Dropdown>
      )}
    </Wrapper>
  );
}
