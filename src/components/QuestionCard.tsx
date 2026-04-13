"use client";

import styled from "styled-components";

interface ClientQuestion {
  id: number;
  type: "mcq" | "text";
  question: string;
  options?: string[];
}

interface QuestionCardProps {
  question: ClientQuestion;
  index: number;
  total: number;
  value: string;
  onChange: (value: string) => void;
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QuestionNumber = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const QuestionText = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
  line-height: 1.4;
`;

const OptionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OptionLabel = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadiusSm};
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary + "10" : "transparent"};
  font-size: ${({ theme }) => theme.fontSizes.md};
  min-height: 48px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Radio = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const TextInput = styled.input`
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

export default function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <Card>
      <QuestionNumber>
        Question {index + 1} of {total}
      </QuestionNumber>
      <QuestionText>{question.question}</QuestionText>

      {question.type === "mcq" && question.options ? (
        <OptionsGroup>
          {question.options.map((option) => (
            <OptionLabel key={option} $selected={value === option}>
              <Radio
                type="radio"
                name={`q-${question.id}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              {option}
            </OptionLabel>
          ))}
        </OptionsGroup>
      ) : (
        <TextInput
          type="text"
          placeholder="Type your answer..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Card>
  );
}
