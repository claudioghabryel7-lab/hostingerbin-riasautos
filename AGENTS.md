<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Single Next.js 16 app (App Router, `src/app`), React 19, TypeScript, Tailwind v4, shadcn/Radix. Package manager is **npm** (`package-lock.json`). Standard scripts live in `package.json`: `dev`, `build`, `start`, `lint`.
- Run the dev server with `npm run dev` (Turbopack, http://localhost:3000). Use the dev command for development, not `build`/`start`.
- **Firebase is remote and hardcoded**: `src/lib/firebase.ts` embeds the config for the live Firebase project `obinarias-68350` (Auth + Firestore). There is no `.env` and no local emulator, so auth/signup/login and all Firestore reads/writes hit the live cloud project and **require outbound internet access**. No secrets are needed to run the app.
- Auth is Firebase email/password. A fresh signup auto-creates a Firestore profile with a 30-day free trial, so a new account has full feature access. First login shows a currency onboarding step (BRL/USD) before the dashboard renders.
- `npm run lint` works but the existing codebase already has pre-existing lint errors/warnings; a non-zero lint result is not necessarily caused by your changes.
