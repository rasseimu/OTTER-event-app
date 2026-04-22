# 参加者追加カード Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新規イベント作成ページの参加者カードを、ボトムシートからユーザーを検索・選択して追加できる機能に刷新する。

**Architecture:** `ParticipantSheet` コンポーネントが検索・選択UIを担当し、確定時に `UserItem[]` を親（`page.tsx`）に返す。親はローカルstateで保持し、イベント作成後に `bulkAddParticipants` で一括追加する。

**Tech Stack:** Next.js 16 App Router, React 19, styled-components 6, Jest + @testing-library/react

---

## File Structure

| ファイル | 変更 | 責務 |
|---|---|---|
| `app/actions/events.ts` | Modify | `searchUsers`・`bulkAddParticipants` server action追加 |
| `components/ParticipantSheet.tsx` | Create | ボトムシートUI（検索・選択・確定） |
| `app/(app)/events/new/page.tsx` | Modify | 参加者カードUI・state・handleCreate更新 |
| `__tests__/ParticipantSheet.test.tsx` | Create | ParticipantSheetのユニットテスト |

---

## Task 1: Server Actions の追加

**Files:**
- Modify: `app/actions/events.ts`

- [ ] **Step 1: `searchUsers` と `bulkAddParticipants` を追加**

`app/actions/events.ts` の末尾（`createEvent` の後）に追加:

```ts
export async function searchUsers(q: string): Promise<UserItem[]> {
  if (q.length < 2) return [];
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const { users } = await api.users.search(q, raw.value);
  return users;
}

export async function bulkAddParticipants(eventId: number, userIds: number[]): Promise<void> {
  if (userIds.length === 0) return;
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  await api.participants.bulkCreate(eventId, userIds, raw.value);
}
```

- [ ] **Step 2: `lib/api.ts` に `users.search` と `participants.bulkCreate` を追加**

`api.users` オブジェクトに追加:
```ts
search: (q: string, token: string) =>
  apiFetch<{ users: UserItem[] }>(`/users/search?q=${encodeURIComponent(q)}`, { token }),
```

`api.participants` オブジェクトに追加:
```ts
bulkCreate: (eventId: number, userIds: number[], token: string) =>
  apiFetch<unknown>(`/events/${eventId}/participants/bulk_create`, {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
    token,
  }),
```

- [ ] **Step 3: 型インポートを確認**

`app/actions/events.ts` の先頭インポートに `UserItem` を追加:

```ts
import type { CreateEventInput, UserItem } from "@/lib/api";
```

- [ ] **Step 4: TypeScriptビルドエラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 5: Commit**

```bash
git add app/actions/events.ts lib/api.ts
git commit -m "feat: add searchUsers and bulkAddParticipants server actions"
```

---

## Task 2: ParticipantSheet コンポーネント

**Files:**
- Create: `components/ParticipantSheet.tsx`
- Create: `__tests__/ParticipantSheet.test.tsx`

- [ ] **Step 1: テストファイルを作成（失敗させる）**

`__tests__/ParticipantSheet.test.tsx` を作成:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";
import ParticipantSheet from "@/components/ParticipantSheet";
import * as actions from "@/app/actions/events";

jest.mock("@/app/actions/events", () => ({
  searchUsers: jest.fn(),
}));

const mockSearchUsers = actions.searchUsers as jest.MockedFunction<typeof actions.searchUsers>;

const mockUsers = [
  { id: 1, name: "Alice", avatar_url: null },
  { id: 2, name: "Bob", avatar_url: null },
];

function renderSheet(props = {}) {
  const defaultProps = {
    initialSelected: [],
    onConfirm: jest.fn(),
    onClose: jest.fn(),
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <ParticipantSheet {...defaultProps} />
    </ThemeProvider>
  );
}

describe("ParticipantSheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the sheet header and search input", () => {
    renderSheet();
    expect(screen.getByText("参加者を追加")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("名前で検索...")).toBeInTheDocument();
  });

  it("shows hint when query is less than 2 chars", () => {
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "a" },
    });
    expect(screen.getByText("2文字以上入力してください")).toBeInTheDocument();
    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it("calls searchUsers when query is 2+ chars and shows results", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    expect(mockSearchUsers).toHaveBeenCalledWith("Al");
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("toggles user selection when tapped", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet();
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    expect(screen.getByText("確定（1人）")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Alice"));
    expect(screen.getByText("確定（0人）")).toBeInTheDocument();
  });

  it("confirm button is disabled when 0 selected", () => {
    renderSheet();
    const btn = screen.getByRole("button", { name: /確定/ });
    expect(btn).toBeDisabled();
  });

  it("calls onConfirm with selected users when confirm is clicked", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    const onConfirm = jest.fn();
    renderSheet({ onConfirm });
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    fireEvent.click(screen.getByRole("button", { name: /確定/ }));
    expect(onConfirm).toHaveBeenCalledWith([mockUsers[0]]);
  });

  it("pre-checks initialSelected users in results", async () => {
    mockSearchUsers.mockResolvedValueOnce(mockUsers);
    renderSheet({ initialSelected: [mockUsers[0]] });
    fireEvent.change(screen.getByPlaceholderText("名前で検索..."), {
      target: { value: "Al" },
    });
    await waitFor(() => screen.getByText("Alice"));
    expect(screen.getByText("確定（1人）")).toBeInTheDocument();
  });

  it("calls onClose when × is clicked", () => {
    const onClose = jest.fn();
    renderSheet({ onClose });
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx jest __tests__/ParticipantSheet.test.tsx --no-coverage
```

Expected: FAIL（コンポーネントが存在しないため）

- [ ] **Step 3: `ParticipantSheet` コンポーネントを実装**

`components/ParticipantSheet.tsx` を作成:

```tsx
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
```

- [ ] **Step 4: テストを実行して全て通ることを確認**

```bash
npx jest __tests__/ParticipantSheet.test.tsx --no-coverage
```

Expected: PASS（8 tests）

- [ ] **Step 5: Commit**

```bash
git add components/ParticipantSheet.tsx __tests__/ParticipantSheet.test.tsx
git commit -m "feat: add ParticipantSheet bottom sheet component"
```

---

## Task 3: `page.tsx` の参加者カード更新

**Files:**
- Modify: `app/(app)/events/new/page.tsx`

- [ ] **Step 1: 必要なstyleコンポーネントとimportを追加**

既存の `import` セクションに追加:
```tsx
import ParticipantSheet from "@/components/ParticipantSheet";
import type { UserItem } from "@/lib/api";
```

ファイル上部のstyled-components定義セクション（`Divider` の後）に追加:

```tsx
const CardHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
`;

const AddBtn = styled.button`
  background: none; border: none;
  font-size: 14px; color: ${({ theme }) => theme.colors.primary};
  font-weight: 600; cursor: pointer; padding: 0;
`;

const ParticipantChip = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 8px 0;
`;

const ChipAvatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; flex-shrink: 0;
`;

const ChipName = styled.span`
  font-size: 15px; color: ${({ theme }) => theme.colors.text};
`;

const EmptyText = styled.p`
  font-size: 14px; color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;
```

- [ ] **Step 2: state とシート制御を追加**

`CreateEventPage` 関数内の既存state宣言の後に追加:

```tsx
const [participants, setParticipants] = useState<UserItem[]>([]);
const [showSheet, setShowSheet] = useState(false);
```

- [ ] **Step 3: `handleCreate` を更新して参加者を一括追加**

既存の `handleCreate` を以下に置き換え:

```tsx
async function handleCreate() {
  if (!name || !date) return;
  setLoading(true);
  try {
    const { id } = await createEvent({ name, event_type: type, date, time, location });
    if (participants.length > 0) {
      await bulkAddParticipants(id, participants.map((u) => u.id));
    }
    router.push(`/events/${id}`);
  } catch {
    alert("イベントの作成に失敗しました");
  } finally {
    setLoading(false);
  }
}
```

`bulkAddParticipants` のimportを `createEvent` と同行に追加:

```tsx
import { createEvent, bulkAddParticipants } from "@/app/actions/events";
```

- [ ] **Step 4: 参加者カードのJSXを置き換え**

既存の参加者 `<Card>` ブロック（行133〜140）を以下に置き換え:

```tsx
<Card>
  <CardHeader>
    <Label style={{ margin: 0 }}>👤 参加者</Label>
    <AddBtn onClick={() => setShowSheet(true)}>追加</AddBtn>
  </CardHeader>
  {participants.length === 0 ? (
    <EmptyText>参加者がいません</EmptyText>
  ) : (
    participants.map((u) => (
      <ParticipantChip key={u.id}>
        <ChipAvatar>{u.name.charAt(0).toUpperCase()}</ChipAvatar>
        <ChipName>{u.name}</ChipName>
      </ParticipantChip>
    ))
  )}
</Card>

{showSheet && (
  <ParticipantSheet
    initialSelected={participants}
    onConfirm={(selected) => { setParticipants(selected); setShowSheet(false); }}
    onClose={() => setShowSheet(false)}
  />
)}
```

- [ ] **Step 5: TypeScriptビルドエラーがないか確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 6: 全テストを実行**

```bash
npx jest --no-coverage
```

Expected: 全テスト PASS

- [ ] **Step 7: Commit**

```bash
git add app/(app)/events/new/page.tsx
git commit -m "feat: wire participants card with bottom sheet and bulk create"
```

---

## 動作確認（手動）

1. `npm run dev` でdev server起動
2. `/events/new` を開く
3. 参加者カードの「追加」をタップ → ボトムシートが開く
4. 1文字入力 → 「2文字以上入力してください」表示
5. 2文字以上入力 → ユーザーが検索される
6. ユーザーをタップ → チェックマーク表示・「確定（1人）」有効化
7. 「確定」タップ → シートが閉じ、カードに参加者名が表示
8. イベント名・日付を入力して「作成」 → イベント作成後に参加者が一括追加される
