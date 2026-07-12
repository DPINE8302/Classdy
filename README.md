# Classdy

Classdy is a calm, student-focused academic command center for schedules, attendance, tasks, and punctuality insights. It is a client-only, offline-capable application: academic data stays in the browser unless the user explicitly exports a backup.

## Features

- First-run term and class setup; multiple dated schedules with editing and duplication
- Daily/weekly schedule views with subject colors, rooms, teachers, notes, and class tasks
- Attendance entry, grace-period lateness, holidays, streaks, reports, and accessible summaries
- Task completion and optional due dates
- Deterministic Thai/English schedule assistant with structured schedule and task answers
- Versioned JSON backup/import validation and confirmed reset
- Light, dark, and system appearance; responsive desktop, tablet, and mobile layouts
- Installable PWA shell with same-origin offline caching
- Optional ten-minute reminders while the app is open

## Stack

React 19, TypeScript, Vite, Tailwind CSS, date-fns, Recharts, Lucide, Vitest, Testing Library, and ESLint.

## Local setup

Requires a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

No API key, account, server, or paid API is required. The assistant runs locally.

## Commands

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run preview
```

## Data and privacy

Schedules, settings, attendance, subject metadata, and tasks are stored in browser `localStorage`. Export creates a readable JSON file. Import validates the structure and asks before replacement. Clearing site data removes local Classdy data; keep backups when the data matters.

## Notifications

Classdy asks for permission only when reminders are enabled in Settings. Reminders are checked while the app is running and are de-duplicated locally. Classdy does not promise delivery after the browser or app has been fully closed; unsupported or insecure browser contexts are explained in the UI.

## PWA installation and deployment

Run a production build and deploy the generated `dist/` directory to any HTTPS static host with SPA fallback to `index.html`:

```bash
npm run build
```

Supporting browsers can install Classdy from their browser menu after the manifest and service worker load. The service worker caches only same-origin app assets and replaces old cache versions on activation.

## Testing

The automated suite covers schedule selection, local dates, overlaps, attendance/grace/holidays, schedule duplication, task overdue behavior, backup migration/recovery, import validation, and Thai/English assistant queries. Run `npm run test` before every release.

## Current limitation

Reliable background reminders after the browser is closed require a push service and backend, which Classdy intentionally does not include.
