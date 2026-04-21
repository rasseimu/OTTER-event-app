# OTTER Event App — Design Spec

**Date:** 2026-04-17
**Stack:** Next.js 14 (frontend) + Ruby on Rails 7 (backend, separate repo) + MySQL + JWT + styled-components + OpenAPI

---

## Overview

A Japanese university research lab event management app. Targets university students managing drinking parties, BBQs, and cooking events from preparation through accounting and records.

**Design language:** iOS-style, white base, orange accent, card UI, bottom navigation.

---

## Repositories

| Repo | Purpose |
|------|---------|
| `otter-event-app` | Next.js 14 frontend (App Router, styled-components) |
| `otter-event-api` | Ruby on Rails 7 backend (full MVC, JSON API, MySQL) |

OpenAPI spec lives at `otter-event-api/docs/openapi.yaml` and is the contract between the two repos.

---

## Data Models

### Users
| Field | Type |
|-------|------|
| id | bigint PK |
| name | string |
| email | string (unique) |
| password_digest | string (bcrypt) |
| avatar_url | string |
| created_at / updated_at | datetime |

### Events
| Field | Type |
|-------|------|
| id | bigint PK |
| name | string |
| event_type | enum: drinking / bbq / cooking / other |
| date | date |
| time | time |
| location | string |
| organizer_id | FK → users |
| created_at / updated_at | datetime |

### EventParticipants (join table)
| Field | Type |
|-------|------|
| id | bigint PK |
| event_id | FK → events |
| user_id | FK → users |

### Expenses
| Field | Type |
|-------|------|
| id | bigint PK |
| event_id | FK → events |
| payer_id | FK → users |
| amount | decimal |
| description | string |

### Ingredients
| Field | Type |
|-------|------|
| id | bigint PK |
| event_id | FK → events |
| name | string |
| quantity | string |
| assignee_id | FK → users (nullable) |
| checked | boolean (default: false) |

### Photos
| Field | Type |
|-------|------|
| id | bigint PK |
| event_id | FK → events |
| uploader_id | FK → users |
| image_url | string |
| comment | text |

### Ratings
| Field | Type |
|-------|------|
| id | bigint PK |
| event_id | FK → events |
| user_id | FK → users |
| taste | integer 1–5 |
| fun | integer 1–5 |
| value | integer 1–5 |
| repeat | integer 1–5 |

### Recipes
| Field | Type |
|-------|------|
| id | bigint PK |
| name | string |
| event_type | enum: drinking / bbq / cooking / other |
| cook_time_minutes | integer |
| serves | integer |
| difficulty | enum: easy / medium / hard |
| image_url | string |

---

## API Endpoints

### Auth
```
POST   /auth/signup
POST   /auth/login       → returns JWT
DELETE /auth/logout
```

### Events
```
GET    /events           ?filter=upcoming|past
POST   /events
GET    /events/:id
PATCH  /events/:id
DELETE /events/:id
```

### Event Sub-resources
```
GET    /events/:id/participants
POST   /events/:id/participants
GET    /events/:id/expenses
POST   /events/:id/expenses
PATCH  /events/:id/expenses/:expense_id
GET    /events/:id/ingredients
POST   /events/:id/ingredients
PATCH  /events/:id/ingredients/:ingredient_id
GET    /events/:id/photos
POST   /events/:id/photos
GET    /events/:id/ratings
POST   /events/:id/ratings
```

### Recipes
```
GET    /recipes          ?event_type=bbq|cooking|...
GET    /recipes/:id
```

### Users
```
GET    /users/me
PATCH  /users/me
```

### Discover
```
GET    /discover/rankings
GET    /discover/challenges
GET    /discover/contest
```

---

## Frontend Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   ├── layout.tsx              ← BottomNav wrapper
│   ├── page.tsx                ← ホーム: calendar + event list
│   ├── events/
│   │   ├── new/page.tsx        ← イベント作成
│   │   └── [id]/
│   │       ├── page.tsx        ← イベント詳細 (tabbed: 概要/会計/食材/写真/評価)
│   │       ├── expenses/page.tsx
│   │       ├── ingredients/page.tsx
│   │       ├── photos/page.tsx
│   │       └── ratings/page.tsx
│   ├── discover/page.tsx       ← わくわく
│   ├── recipes/page.tsx        ← レシピ
│   └── profile/page.tsx        ← マイページ
├── api/
│   └── auth/route.ts           ← httpOnly cookie proxy for JWT
middleware.ts                   ← protects (app)/ routes
lib/
├── api.ts                      ← fetch wrapper with JWT header injection
└── types.ts                    ← auto-generated from openapi-typescript
```

### Auth Flow
1. User logs in via `POST /auth/login` (proxied through Next.js `/api/auth`)
2. JWT stored in `httpOnly` cookie by the Next.js API route
3. `middleware.ts` checks cookie on every `(app)/` request — redirects to `/login` if missing
4. `lib/api.ts` reads the cookie server-side and injects `Authorization: Bearer <token>` header on Rails requests

### Styling
- styled-components with a theme provider
- Orange accent: `#FF6B35`
- Background: `#FFFFFF` / `#F5F5F5`
- Card shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Border radius: `12px` (cards), `8px` (buttons)
- Bottom nav height: `60px`

---

## OpenAPI Workflow

1. Write `openapi.yaml` in `otter-event-api/docs/`
2. Rails: use `committee-rails` gem to validate request/response against spec in tests
3. Next.js: run `npx openapi-typescript docs/openapi.yaml -o lib/types.ts` to generate types
4. Types are committed and updated whenever the spec changes

---

## Key Screens (from Figma)

| Screen | Route | Figma Node |
|--------|-------|------------|
| ホーム | `/` | 9:33 |
| イベント作成 | `/events/new` | 9:1119 |
| マイページ | `/profile` | 9:366 |
| わくわく | `/discover` | 9:503 |
| レシピ | `/recipes` | 9:933 |
