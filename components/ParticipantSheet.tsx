"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { searchUsers } from "@/app/actions/events";
import type { UserItem } from "@/lib/api";

interface Props {
  initialSelected: UserItem[];
  onConfirm: (selected: UserItem[]) => void;
  onClose: () => void;
}

const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex; align-items: flex-end;
`;

const Sheet = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 80vh;
  display: flex; flex-direction: column;
  padding: 0 0 32px;
`;

const SheetHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SheetTitle = styled.h3`
  font-size: 16px; font-weight: 600; margin: 0;
`;

const CloseBtn = styled.button`
  background: none; border: none; font-size: 20px;
  cursor: pointer; color: ${({ theme }) => theme.colors.textSecondary};
`;

const SearchRow = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SearchInput = styled.input`
  flex: 1; border: none; outline: none;
  font-size: 15px; background: transparent;
  color: ${({ theme }) => theme.colors.text};
  &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const Hint = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center; padding: 20px;
`;

const ResultList = styled.div`
  flex: 1; overflow-y: auto;
`;

const ResultRow = styled.button<{ $checked: boolean }>`
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 12px 16px;
  background: ${({ $checked, theme }) => $checked ? theme.colors.background : "transparent"};
  border: none; cursor: pointer; text-align: left;
`;

const Avatar = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; flex-shrink: 0;
`;

const UserName = styled.span`
  flex: 1; font-size: 15px; color: ${({ theme }) => theme.colors.text};
`;

const Check = styled.span`
  color: ${({ theme }) => theme.colors.primary}; font-size: 18px;
`;

const ConfirmBtn = styled.button`
  margin: 16px;
  padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white; font-size: 16px; font-weight: 600;
  border: none; border-radius: ${({ theme }) => theme.borderRadius.card};
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export default function ParticipantSheet({ initialSelected, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<UserItem[]>(initialSelected);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    searchUsers(query).then(setResults);
  }, [query]);

  function toggle(user: UserItem) {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  }

  return (
    <Backdrop onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>参加者を追加</SheetTitle>
          <CloseBtn onClick={onClose} aria-label="×">×</CloseBtn>
        </SheetHeader>

        <SearchRow>
          <span>🔍</span>
          <SearchInput
            placeholder="名前で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </SearchRow>

        <ResultList>
          {query.length > 0 && query.length < 2 && (
            <Hint>2文字以上入力してください</Hint>
          )}
          {results.map((user) => {
            const checked = selected.some((u) => u.id === user.id);
            return (
              <ResultRow key={user.id} $checked={checked} onClick={() => toggle(user)}>
                <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                <UserName>{user.name}</UserName>
                {checked && <Check>✓</Check>}
              </ResultRow>
            );
          })}
        </ResultList>

        <ConfirmBtn
          disabled={selected.length === 0}
          onClick={() => onConfirm(selected)}
        >
          確定（{selected.length}人）
        </ConfirmBtn>
      </Sheet>
    </Backdrop>
  );
}
