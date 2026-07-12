# Classdy engineering guide

Classdy is a client-only React/Vite PWA. `App.tsx` coordinates screens; `components/` contains UI; `hooks/useAppData.ts` owns app state; `lib/domain.ts` contains calendar and academic rules; `lib/persistence.ts` owns backup validation; `lib/chat.ts` is the deterministic Thai/English assistant.

## Commands

- `npm run dev` — local development
- `npm run typecheck` — strict TypeScript
- `npm run test` — Vitest suite
- `npm run lint` — ESLint
- `npm run build` / `npm run preview` — production build and local preview

## Rules

- Keep calendar dates as local `YYYY-MM-DD` values; do not derive them with `toISOString()`.
- Keep business logic out of components and cover changes in `lib/` with tests.
- Version and validate persisted/imported data. Never silently discard stored user data during migrations.
- The assistant is local and deterministic. Do not add client-side secrets or describe it as generative AI.
- Notification permission must follow a user action. Browser-open reminders are the only supported guarantee.
- Do not commit `dist`, `node_modules`, `.env*`, credentials, or personal data.
