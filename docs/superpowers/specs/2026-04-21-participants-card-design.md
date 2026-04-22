# 参加者追加カード設計

## 概要

新規イベント作成ページ（`app/(app)/events/new/page.tsx`）の参加者カードを、ボトムシートダイアログからユーザーを検索・選択して追加できる機能に刷新する。

---

## 参加者カード（`page.tsx` 内）

- ヘッダー行: 「👤 参加者」ラベル（左）＋「追加」テキスト（右、primaryカラー、ボタン）
- 選択済み参加者をアバター＋名前のチップとして一覧表示
- 未選択時: 「参加者がいません」薄いプレースホルダーテキスト

---

## ボトムシートダイアログ

- 半透明バックドロップ（タップで閉じる）
- シートが画面下からスライドアップ
- ヘッダー: 「参加者を追加」＋「×」閉じるボタン
- 検索インプット（🔍アイコン付き）
- 2文字未満入力時: 「2文字以上入力してください」ヒント
- 結果リスト: アバター＋名前、タップでチェックマークトグル（既に選択済みのユーザーはチェック済みで表示、再タップで解除可能）
- 「確定（N人）」ボタン（下部固定）、N=0のときdisabled

---

## State管理（`page.tsx`）

```ts
const [participants, setParticipants] = useState<UserItem[]>([]);
const [showSheet, setShowSheet] = useState(false);
```

ボトムシートは `ParticipantSheet` コンポーネントに分離。`initialSelected: UserItem[]` を受け取り、`onConfirm(selected: UserItem[])` で確定を親に返す。内部state:

```ts
const [query, setQuery] = useState("");
const [results, setResults] = useState<UserItem[]>([]);
const [selected, setSelected] = useState<UserItem[]>([]);
const [searching, setSearching] = useState(false);
```

---

## Server Actions

### `searchUsers(q: string): Promise<UserItem[]>`
- `GET /users/search?q=<q>` を呼ぶ
- 2文字未満は呼ばず空配列を返す

### `bulkAddParticipants(eventId: number, userIds: number[]): Promise<void>`
- `POST /events/:eventId/participants/bulk_create` を呼ぶ
- ボディ: `{ user_ids: userIds }`

---

## イベント作成フロー

1. フォームで参加者を選択 → `participants: UserItem[]` に蓄積
2. 「作成」ボタン押下 → `createEvent()` → `event.id` 取得
3. `participants.length > 0` なら `bulkAddParticipants(event.id, userIds)`
4. `/events/:id` にリダイレクト

---

## ファイル構成

| ファイル | 変更内容 |
|---|---|
| `app/(app)/events/new/page.tsx` | 参加者カードUI、state追加、handleCreate更新 |
| `app/actions/events.ts` | `searchUsers`、`bulkAddParticipants` 追加 |
| `components/ParticipantSheet.tsx` | 新規: ボトムシートコンポーネント |

---

## APIエンドポイント（バックエンド提供済み）

- `GET /users/search?q=<keyword>` — 2文字以上、最大20件、自分除外
- `POST /events/:event_id/participants/bulk_create` — `{ user_ids: [] }` で一括追加
