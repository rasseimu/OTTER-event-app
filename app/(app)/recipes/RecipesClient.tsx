"use client";

import { useState } from "react";
import styled from "styled-components";
import type { RecipeItem } from "@/lib/api";

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  padding: 20px 16px 0;
`;

const SearchBarWrapper = styled.div`
  padding: 12px 16px;
`;

const SearchBarInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.white};
  font-size: 15px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  outline: none;
  box-sizing: border-box;
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
`;

const CategoryChip = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 999px;
  border: none;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.text)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const RecipeCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: 12px 16px;
  margin: 0 16px 10px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Thumb = styled.div<{ $type: string }>`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: ${({ $type, theme }) => {
    const map: Record<string, string> = {
      drinking: theme.colors.categoryDrinking,
      bbq: theme.colors.categoryBbq,
      cooking: theme.colors.categoryCooking,
      other: theme.colors.categoryOther,
    };
    return map[$type] ?? theme.colors.border;
  }};
  flex-shrink: 0;
`;

const RecipeName = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 15px;
`;

const RecipeMeta = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ChevronText = styled.span`
  color: ${({ theme }) => theme.colors.border};
`;

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "簡単",
  medium: "普通",
  hard: "難しい",
};

const CATEGORIES: { label: string; eventType: string | undefined }[] = [
  { label: "すべて", eventType: undefined },
  { label: "料理", eventType: "cooking" },
  { label: "BBQ", eventType: "bbq" },
  { label: "飲み会", eventType: "drinking" },
  { label: "その他", eventType: "other" },
];

export default function RecipesClient({ recipes }: { recipes: RecipeItem[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const selectedEventType = CATEGORIES[activeCategory].eventType;
    const matchesCategory = !selectedEventType || r.event_type === selectedEventType;
    return matchesSearch && matchesCategory;
  });

  return (
    <Page>
      <PageTitle>レシピ</PageTitle>
      <SearchBarWrapper>
        <SearchBarInput
          placeholder="🔍 レシピを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBarWrapper>
      <CategoryRow>
        {CATEGORIES.map((c, i) => (
          <CategoryChip key={c.label} $active={activeCategory === i} onClick={() => setActiveCategory(i)}>
            {c.label}
          </CategoryChip>
        ))}
      </CategoryRow>
      {filtered.map((r) => (
        <RecipeCard key={r.id}>
          <Thumb $type={r.event_type} />
          <div style={{ flex: 1 }}>
            <RecipeName>{r.name}</RecipeName>
            <RecipeMeta>
              ⏱ {r.cook_time_minutes ?? "—"}分 · 👥 {r.serves ?? "—"}人 · {DIFFICULTY_LABELS[r.difficulty] ?? r.difficulty}
            </RecipeMeta>
          </div>
          <ChevronText>›</ChevronText>
        </RecipeCard>
      ))}
    </Page>
  );
}
