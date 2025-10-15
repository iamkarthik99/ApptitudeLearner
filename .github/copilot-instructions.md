# Copilot instructions for Aptitude Learner (Apt-mastery-hub)

Be concise and make edits that follow existing patterns. This file highlights the project's structure, key workflows, and code patterns so an AI coding agent can be productive quickly.

1) Big-picture architecture
- Frontend-only React + TypeScript app built with Vite. Root is `src/main.tsx` -> `src/App.tsx` which wires providers (React Query, Tooltips, Toasters) and React Router routes.
- Pages live in `src/pages/*` (Dashboard, Auth, Practice, Progress, Leaderboard, Profile). Routes are defined in `src/App.tsx`.
- UI primitives are shadcn-style components under `src/components/ui/*`. Reuse these components for layout and forms (e.g. `Button`, `Input`, `Card`, `Tabs`).
- Data and auth integrate with Supabase via `src/integrations/supabase/client.ts` and typed DB definitions in `src/integrations/supabase/types.ts`.

2) How to run / common commands
- Install dependencies: `npm i`
- Dev server: `npm run dev` (uses Vite)
- Build: `npm run build` (and `npm run build:dev` for development build)
- Preview production build: `npm run preview`
- Lint: `npm run lint`

3) Important environment and integration details
- Supabase client expects two env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (used in `src/integrations/supabase/client.ts`). Provide these in your environment or a `.env` file when running locally.
- Supabase auth is used directly in pages (see `src/pages/Auth.tsx`) with patterns like `supabase.auth.signUp`, `supabase.auth.signInWithPassword`, and `supabase.auth.getSession()`.
- LocalStorage is used by the Supabase client for session persistence (see client options).

4) Project-specific patterns & conventions
- Path alias: `@/` maps to `src/` (see `tsconfig.json`). Use imports like `import { X } from "@/components/ui/button"`.
- State & remote data: TanStack Query is set up at root (`QueryClientProvider` in `src/App.tsx`). Prefer `useQuery`/`useMutation` for server interactions.
- Notifications: two toast systems are present — the custom `Toaster` (Radix/sonner wrapper) and `Sonner`. Use existing `toast` helpers where the code does.
- UI components follow shadcn/ui conventions — small single-purpose primitives under `src/components/ui/` (copy pattern when adding new controls).
- Routes: pages are mounted directly in the router (no nested layout files). Add new pages under `src/pages` and register a route in `src/App.tsx`.

5) Files to inspect for context (quick links)
- App wiring: `src/App.tsx`
- App entry: `src/main.tsx`
- Supabase client: `src/integrations/supabase/client.ts`
- Auth flows: `src/pages/Auth.tsx`
- UI primitives: `src/components/ui/*` (e.g. `button.tsx`, `input.tsx`, `card.tsx`)
- Helpers: `src/lib/utils.ts` and hooks in `src/hooks/*` (e.g. `use-toast.ts`, `use-mobile.tsx`)

6) Editing guidance for AI
- Follow existing TypeScript style and keep changes minimal and localized.
- Prefer adding new UI controls inside `src/components/ui` and reuse existing styling utilities (Tailwind classes, `cn` helper in `src/lib/utils.ts`).
- When touching auth/data code, mirror the Supabase client usage and update types in `src/integrations/supabase/types.ts` if schema changes.
- Use the `@/` alias for imports to match the codebase.

7) Quick examples
- Import a UI button: `import { Button } from "@/components/ui/button";`
- Check session on mount (pattern used in `Auth.tsx`):
  `supabase.auth.getSession().then(({ data: { session } }) => { if (session) navigate('/'); });`

8) Known constraints
- TypeScript strictness is relaxed (see `tsconfig.json`) so some files may allow implicit `any` — preserve existing typing approach when making small changes.
- This repo was scaffolded for Lovable; CI or deploy scripts may be external. Focus on local dev flows above unless a CI config is present.

If anything in this file is unclear or you need more examples (tests, API shapes, or common PR patterns), tell me which area to expand and I will update this guidance.
