"use client";

import styled from "styled-components";
import type { CreateEventInput } from "@/lib/api";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const TypeButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.white)};
  cursor: pointer;
  font-size: 11px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text)};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
`;

const Emoji = styled.span`
  font-size: 26px;
`;

const TYPES: { value: CreateEventInput["event_type"]; label: string; emoji: string }[] = [
  { value: "drinking", label: "飲み会", emoji: "🍺" },
  { value: "bbq",      label: "BBQ",    emoji: "🍖" },
  { value: "cooking",  label: "料理",   emoji: "🍳" },
  { value: "other",    label: "その他", emoji: "🎉" },
];

export default function EventTypeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: CreateEventInput["event_type"]) => void;
}) {
  return (
    <Grid>
      {TYPES.map((t) => (
        <TypeButton key={t.value} $active={value === t.value} onClick={() => onChange(t.value)}>
          <Emoji>{t.emoji}</Emoji>
          {t.label}
        </TypeButton>
      ))}
    </Grid>
  );
}
