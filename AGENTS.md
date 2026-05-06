# Agent Guide: Don Galleta

## Core Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19.
- **Database:** Prisma with MariaDB/MySQL.
- **Auth:** NextAuth v5 (Beta).
- **Styling:** Tailwind CSS 4 + shadcn/ui.
- **Testing:** Vitest (Node environment for actions/utils).

## Critical Commands
- `npx prisma generate`: **Required** after `npm install` or schema changes.
- `npx auth secret`: **Required** to initialize `AUTH_SECRET`.
- `npm run dev`: Starts development server.
- `npm run test`: Runs Vitest suites (mostly server actions in `src/__tests__`).
- `npm run lint`: Runs ESLint.

## Workflow & Architecture
- **Server Actions:** Primary location for database logic and mutations is `src/actions/`.
- **Path Aliases:** Use `@/` for `src/`.
- **Database Policy:** The production/staging DB is managed externally. **Do not run `npx prisma db push` or `prisma migrate dev`** unless explicitly instructed; only use `prisma generate` to update the local client.
- **Environment:** Requires `DATABASE_URL` in `.env`.
- **Git:** Never commit directly to `main`. Use feature branches and PRs.

## Design Standards
Follow branding hex codes strictly for UI work:
- **Primary:** `#58321D` (Coffee Brown)
- **Secondary / Accent:** `#F7DCBE` (Beige/Cream)
- **Destructive:** `#A42D2C` (Red)
- **Muted:** `#C69A8F`
- **Border / Input:** `#A6A3A2`
- **Card:** `#FFFFFF`

## Quirks
- **Next.js 16:** Project uses an experimental/beta version (16.1.6). Be alert for React 19 specific behaviors.
- **Tailwind 4:** Uses `@tailwindcss/postcss`. No `tailwind.config.js` is present; theme configuration is likely in `src/app/globals.css`.
