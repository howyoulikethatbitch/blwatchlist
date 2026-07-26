// ── Monthly BL Wrapped — Type Definitions ────────────────────────────────────

/** "YYYY-MM" string, e.g. "2026-07" */
export type MonthKey = string;

// ── Activity tracking (mutable, lives in IndexedDB) ──────────────────────────

export interface TrackedEntry {
  id: string;
  title: string;
  country: string;
  type: 'Movie' | 'Series';
  rating?: number;
}

export interface MonthlyActivityData {
  month: MonthKey;           // "YYYY-MM"
  createdAt: number;         // when we first started tracking this month
  updatedAt: number;

  // Entry additions by status
  completedTitles: TrackedEntry[];
  droppedTitles:   TrackedEntry[];
  plannedTitles:   TrackedEntry[];
  ongoingStarted:  TrackedEntry[];  // entries added as ONGOING
  totalEntriesAdded: number;

  // Status-change completions (entry existed before, user marked it COMPLETE this month)
  statusCompletions: TrackedEntry[];

  // Favorites
  favoritesAdded:   TrackedEntry[];
  favoritesRemoved: number;

  // Ratings  (UPDATE_FAVORITE or TOGGLE_FAVORITE that sets initial rating)
  ratingsGiven:  number;
  ratingsEdited: number;
  ratingValues:  number[];           // for computing avg / highest / lowest

  // Per-entry latest rating this month (to find highest/lowest)
  ratingByEntry: Record<string, { title: string; rating: number; country: string; type: string }>;

  // Top 10
  top10Updates: number;
  top10DrawersCreated: number;

  // Milestones / achievements this month
  milestonesUnlocked: Array<{ id: string; title: string; type: string; value: number }>;

  // Countries touched (from completed titles)
  countriesWatched: string[];

  // Collection size delta
  netCollectionGrowth: number;     // +add - delete

  // Rank snapshots (captured on each update)
  rankAtLastUpdate: string | null; // watcher title name
  rankEmojiAtLastUpdate: string | null;
}

export function emptyActivityData(month: MonthKey): MonthlyActivityData {
  const now = Date.now();
  return {
    month,
    createdAt: now,
    updatedAt: now,
    completedTitles: [],
    droppedTitles: [],
    plannedTitles: [],
    ongoingStarted: [],
    totalEntriesAdded: 0,
    statusCompletions: [],
    favoritesAdded: [],
    favoritesRemoved: 0,
    ratingsGiven: 0,
    ratingsEdited: 0,
    ratingValues: [],
    ratingByEntry: {},
    top10Updates: 0,
    top10DrawersCreated: 0,
    milestonesUnlocked: [],
    countriesWatched: [],
    netCollectionGrowth: 0,
    rankAtLastUpdate: null,
    rankEmojiAtLastUpdate: null,
  };
}

// ── Wrapped Snapshot (immutable, permanent) ───────────────────────────────────

export interface MonthlyWrappedSnapshot {
  month: MonthKey;
  year: number;
  monthNumber: number;   // 1–12
  generatedAt: number;
  isViewed: boolean;
  data: MonthlyActivityData;
  // State captured at snapshot time
  collectionSizeAtEnd: number;
  rankAtEnd: string | null;
  rankEmojiAtEnd: string | null;
  avgRatingAllTime: string | null;
}

// ── Slide types for the presentation ─────────────────────────────────────────

export type SlideType =
  | 'intro'
  | 'completed'
  | 'ongoing'
  | 'planned'
  | 'dropped'
  | 'favorites'
  | 'ratings'
  | 'highest-rated'
  | 'avg-rating'
  | 'country'
  | 'top10'
  | 'achievement'
  | 'growth'
  | 'rank'
  | 'quiet'
  | 'ending';

export interface WrappedSlide {
  id: string;
  type: SlideType;
  narratorComment?: string;
  // Typed payload per slide type
  payload: SlidePayload;
}

export type SlidePayload =
  | IntroPayload
  | StatPayload
  | HighlightPayload
  | CountryPayload
  | AchievementPayload
  | RankPayload
  | EndingPayload
  | QuietPayload;

export interface IntroPayload   { month: string; year: number; monthName: string }
export interface StatPayload    { count: number; label: string; titles?: string[] }
export interface HighlightPayload { title: string; country: string; type: string; rating: number }
export interface CountryPayload { country: string; count: number; allCountries: [string, number][] }
export interface AchievementPayload { achievements: Array<{ title: string; type: string }> }
export interface RankPayload    { rank: string; emoji: string; isNew: boolean }
export interface EndingPayload  { monthName: string; year: number; totalCompleted: number }
export interface QuietPayload   { month: string; year: number; monthName: string }

// ── Context value ─────────────────────────────────────────────────────────────

export interface WrappedContextValue {
  snapshots: MonthlyWrappedSnapshot[];
  pendingSnapshot: MonthlyWrappedSnapshot | null;   // first unviewed
  activeSnapshot: MonthlyWrappedSnapshot | null;    // being viewed right now
  historyOpen: boolean;
  isReady: boolean;

  viewSnapshot: (snapshot: MonthlyWrappedSnapshot) => void;
  dismissPresentation: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  replaySnapshot: (month: MonthKey) => void;
}
