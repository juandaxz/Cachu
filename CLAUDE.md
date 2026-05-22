# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured. `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, so build errors from TS/lint are suppressed — but lint issues still surface with `npm run lint`.

## Setup

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run the schema in the Supabase SQL Editor using `supabase/schema.sql`.

## Architecture

**Cachuflin** is a personal productivity app (habit tracking, anti-habit/addiction tracking, todos) built with Next.js 15 App Router + Supabase.

### Stack

- Next.js 15 App Router, React 19, TypeScript 5
- Supabase (PostgreSQL + Auth + Row-Level Security)
- Google OAuth via Supabase Auth
- Tailwind CSS + Radix UI primitives + Lucide icons
- date-fns for date math

### Route Structure

```
src/app/
├── (app)/               # Protected routes — grouped layout with sidebar/mobile nav
│   ├── page.tsx         # Dashboard
│   ├── habits/          # Positive habit tracking
│   ├── anti-habits/     # Quit-habit / addiction tracking
│   ├── todos/           # Task management
│   └── stats/           # Heatmap statistics
├── auth/callback/       # OAuth code exchange
├── login/               # Google OAuth entry point
└── actions/             # Server Actions (habits.ts, anti-habits.ts, todos.ts)
```

### Data Flow

Pages are **async Server Components** that fetch directly from Supabase. Mutations use **Server Actions** (`'use server'`) with `revalidatePath()` for cache invalidation. There is no client-side global state or data-fetching library — keep new features in this pattern.

### Auth

`src/middleware.ts` protects all routes, redirecting unauthenticated users to `/login`. The Supabase client has two variants: `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server/cookies). Every table uses RLS with a single `auth.uid() = user_id` policy.

### Domain Models

Three core entities, each with a checkins/related table:

| Entity | Table | Related Tables |
|--------|-------|----------------|
| Habits | `habits` | `habit_checkins` (daily value/count) |
| Anti-Habits | `anti_habits` | `anti_habit_checkins`, `anti_habit_journal` |
| Todos | `todos` | `todo_categories` |

Habit types: `'boolean'` (checked/unchecked) or `'count'` (numeric target). Todo urgency: `'low' | 'medium' | 'high' | 'risk'`. Todo status: `'pending' | 'in_progress' | 'done'`.

All TypeScript interfaces are in `src/lib/types.ts`.

### Key Utilities (`src/lib/utils.ts`)

- `today()` — current date as `'yyyy-MM-dd'`
- `calcHabitStreak()` / `calcAntiHabitStreak()` — streak logic
- `buildYearGrid()` — 52-week heatmap data structure
- `DEFAULT_CATEGORIES` — 4 seeded todo categories

### UI Conventions

- Path alias: `@/*` maps to `src/*`
- Shadcn-style UI primitives live in `src/components/ui/`
- CSS variables drive the color/radius theme (see `tailwind.config.ts`)
- UI text is in Spanish; code/variables are in English
