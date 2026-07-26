# BL Watchlist

A fully offline-first PWA for tracking Boys' Love (BL) series and movies. Built with React + TypeScript + Vite, styled with Tailwind CSS + Shadcn/ui, animated with Framer Motion.

## How to run

```bash
cd app && pnpm dev   # dev server on :3000
```

The workflow **Dev Server** is pre-configured and starts automatically.

## Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS v3, Shadcn/ui (Radix primitives), Framer Motion
- **Storage**: IndexedDB (via raw IDB, no Dexie) — fully offline, no backend
- **PWA**: vite-plugin-pwa + Workbox, Capacitor for Android
- **Package manager**: pnpm (workspace root `app/`)

## Project structure

```
app/src/
  components/       # UI components
    tabs/           # Main tab views (Overview, BLSeries, Ongoing, Favorites, Top10, Statistics, Settings)
    wrapped/        # Monthly BL Wrapped feature components
  context/
    AppContext.tsx   # Main app state (useReducer + IndexedDB persistence)
    WrappedContext.tsx # Monthly Wrapped state & auto-generation logic
  hooks/
    useIndexedDB.ts # Raw IDB helpers (BLWatchlistDB)
  lib/
    wrappedDB.ts     # IDB helpers for BLWrappedDB (separate DB for Wrapped data)
    wrappedTracker.ts # Intercepts AppContext dispatches to record monthly activity
    wrappedEngine.ts  # Snapshot generation & slide builder
    narratorComments.ts # Contextual narrator comment pools
  types/
    index.ts         # Core app types
    wrapped.ts       # Monthly Wrapped types
```

## Key features

- **BL Series & Movies library** — COMPLETE / ONGOING / DROPPED / PLANNED statuses
- **Favorites** with multi-metric ratings (storyline, acting, music, chemistry, cinematography + 7 bonus flags → calculated overallRating)
- **Top 10 drawers** per year, drag-to-reorder
- **Statistics** tab with achievements, watcher rank/title, country breakdown
- **Monthly BL Wrapped** — Spotify-Wrapped-style monthly summaries stored permanently in IndexedDB, auto-generated on first open of a new month, accessible via Settings → Wrapped History
- **Milestones** — collection size, favorites count, perfect ratings, etc.

## Monthly BL Wrapped — architecture

Activity is tracked incrementally in `BLWrappedDB` (separate from the main `BLWatchlistDB`):
- `monthlyActivity` store — live mutable data for the current month
- `wrappedSnapshots` store — immutable historical snapshots

Tracking is piggybacked on `AppContext`'s wrapped dispatch (`dispatchWithTracking`), which calls `trackWrappedEvent()` as a fire-and-forget side effect.

At app load, `WrappedContext` generates snapshots for any missed past months and surfaces the first unviewed one as an auto-presented full-screen experience.

## Notes

- `tar` package is overridden to `^7.0.0` in `app/package.json` (`pnpm.overrides`) because v6.2.1 is blocked by the Replit package firewall (critical CVE).
- The `AppState` type in `types/index.ts` is narrower than the runtime state in `AppContext.tsx` (which adds `importMode`, `milestoneQueue`, `celebratedMilestones`). This is an existing inconsistency.

## User preferences

- Keep the existing project structure and stack unchanged.
