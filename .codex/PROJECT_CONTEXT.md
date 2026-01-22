# Project Context — dinner-decider

## Purpose
- Keep concise, durable context for this repo’s work with Codex.

## Current Hosting / Deployment (Confirmed)
- Next.js app
- GitHub push triggers auto deploy to Vercel
- Vercel project: dinner-decider
- Vercel dashboard: https://vercel.com/matthendrixs-projects/dinner-decider
- GitHub repo: matthendrix/dinner-decider
- GitHub URL: https://github.com/matthendrix/dinner-decider
- GitHub Actions: none configured
- Environment: Production
- Production branch: master
- Preview behavior: Vercel default (preview deployments for non‑production branches and PRs)
- Node.js version: 24.x
- Vercel domains:
  - dinner-decider-git-master-matthendrix-projects.vercel.app
  - dinner-decider-gb2l3dgt-matthendrix-projects.vercel.app
- Env vars: none configured

## Stack / Tooling (Confirmed)
- Next.js 16.1.4
- React 19.2.3 / React DOM 19.2.3
- TypeScript ^5
- Tailwind CSS ^4 (via @tailwindcss/postcss)
- ESLint ^9 with eslint-config-next 16.1.4
- Node types ^20

## Scripts (package.json)
- dev: next dev
- build: next build
- start: next start
- lint: eslint

## Config / Structure
- next.config.ts present with default empty config
- Standard create-next-app README present

## Environment Variables
- No .env* files found in repo root (as of 2026-01-22)
- None configured in Vercel (as of 2026-01-22)

## Directory Map (High-Level)
- .codex/: Codex project context (this file)
- src/: app source
- public/: static assets
- .next/: build output (local)
- node_modules/: dependencies (local)

## Environments
- Vercel Production only (no additional envs defined)

## Operational Checklist (Lightweight)
- Before deploy: ensure `npm run build` succeeds locally
- After deploy: open the production domain and validate key flows
- Rollback: revert the last commit on `master` and push

## Risks / Unknowns
- None currently noted

## Decisions Log
- 2026-01-22: Store project context in `.codex/PROJECT_CONTEXT.md` and keep it brief (Safe)

## Conventions / Preferences
- Store context in `.codex/PROJECT_CONTEXT.md` (this file)
- Keep it brief and maintain as a running summary
- Accuracy over speed; explicit assumptions; reversible changes

## Current Questions / Decisions
- None

## How to Update (Template)
Date: YYYY-MM-DD
Change:
- What changed and why
Risk:
- Safe | Caution | High risk
Notes:
- Tests run, assumptions, or follow‑ups

## Last Updated
- 2026-01-22
