# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Architecture

This is a single-page Next.js 16 app using the App Router with React 19 and Tailwind CSS v4.

**Core functionality** lives entirely in `src/app/page.tsx`:
- Client component ("use client") managing all state with React hooks
- Meal list with add/remove functionality
- Random meal picker that optionally excludes meals picked within the last 7 days
- State persisted to localStorage under key `dinner-decider:v1`

**Path alias:** `@/*` maps to `./src/*`

**Styling:** Tailwind v4 with CSS-based configuration in `globals.css`. Theme uses CSS custom properties (`--background`, `--foreground`) with automatic dark mode via `prefers-color-scheme`.
