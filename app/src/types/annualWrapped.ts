// ── Annual BL Wrapped — Type Definitions ──────────────────────────────────────

/** Year number, e.g. 2026 */
export type YearKey = number;

// ── Activity tracking (mutable, lives in IndexedDB) ──────────────────────────

export interface TrackedEntry {
  id: string;
  title: string;
  country: string;
  type: 'Movie' | 'Series';
  rating?: number;
}

export interface AnnualActivityData {
  year: YearKey;
  createdAt: number;
  updatedAt: number;

  // Entry additions by status
  completedTitles: TrackedEntry[];
  droppedTitles: TrackedEntry[];
  plannedTitles: TrackedEntry[];
  ongoingStarted: TrackedEntry[];
  totalEntriesAdded: number;

  // Status-change completions (entry existed before, user marked COMPLETE this year)
  statusCompletions: TrackedEntry[];

  // Ongoing BLs that were completed during the year
  ongoingCompleted: TrackedEntry[];

  // Favorites
  favoritesAdded: TrackedEntry[];
  favoritesRemoved: number;

  // Ratings
  ratingsGiven: number;
  ratingsEdited: number;
  ratingValues: number[];
  ratingByEntry: Record<string, { title: string; rating: number; country: string; type: string }>;

  // Top 10
  top10Updates: number;
  top10DrawersCreated: number;
  top10DrawerYears: number[];

  // Milestones / achievements
  milestonesUnlocked: Array<{ id: string; title: string; type: string; value: number }>;

  // Countries
  countriesWatched: string[];

  // Genres derived from entry titles — stored as country+type pairs for counting
  moviesWatched: number;
  seriesWatched: number;

  // Collection
  netCollectionGrowth: number;

  // Rank snapshots
  rankAtLastUpdate: string | null;
  rankEmojiAtLastUpdate: string | null;
  rankAtYearStart: string | null;
  rankEmojiAtYearStart: string | null;
}

export function emptyAnnualActivityData(year: YearKey): AnnualActivityData {
  const now = Date.now();
  return {
    year,
    createdAt: now,
    updatedAt: now,
    completedTitles: [],
    droppedTitles: [],
    plannedTitles: [],
    ongoingStarted: [],
    totalEntriesAdded: 0,
    statusCompletions: [],
    ongoingCompleted: [],
    favoritesAdded: [],
    favoritesRemoved: 0,
    ratingsGiven: 0,
    ratingsEdited: 0,
    ratingValues: [],
    ratingByEntry: {},
    top10Updates: 0,
    top10DrawersCreated: 0,
    top10DrawerYears: [],
    milestonesUnlocked: [],
    countriesWatched: [],
    moviesWatched: 0,
    seriesWatched: 0,
    netCollectionGrowth: 0,
    rankAtLastUpdate: null,
    rankEmojiAtLastUpdate: null,
    rankAtYearStart: null,
    rankEmojiAtYearStart: null,
  };
}

// ── Annual Wrapped Snapshot (immutable, permanent) ───────────────────────────

export interface AnnualWrappedSnapshot {
  year: YearKey;
  generatedAt: number;
  isViewed: boolean;
  data: AnnualActivityData;
  // State captured at snapshot time
  collectionSizeAtEnd: number;
  rankAtEnd: string | null;
  rankEmojiAtEnd: string | null;
  avgRatingAllTime: string | null;
  isQuietYear: boolean;
}

// ── Slide types for the presentation ─────────────────────────────────────────

export type AnnualSlideType =
  | 'year-intro'
  | 'year-numbers'
  | 'year-journey'
  | 'year-favorites'
  | 'year-top10'
  | 'year-countries'
  | 'year-genres'
  | 'year-ongoing'
  | 'year-achievements'
  | 'year-highlights'
  | 'year-finale'
  | 'year-quiet';

export interface AnnualSlide {
  id: string;
  type: AnnualSlideType;
  narratorComment?: string;
  payload: AnnualSlidePayload;
}

export type AnnualSlidePayload =
  | AnnualIntroPayload
  | AnnualNumbersPayload
  | AnnualJourneyPayload
  | AnnualFavoritesPayload
  | AnnualTop10Payload
  | AnnualCountriesPayload
  | AnnualGenresPayload
  | AnnualOngoingPayload
  | AnnualAchievementsPayload
  | AnnualHighlightsPayload
  | AnnualFinalePayload
  | AnnualQuietPayload;

export interface AnnualIntroPayload {
  year: number;
  totalActivity: number;
}

export interface AnnualNumbersPayload {
  stats: Array<{ count: number; label: string }>;
}

export interface AnnualJourneyPayload {
  collectionGrowth: number;
  rankStart: string | null;
  rankEnd: string | null;
  rankEmojiStart: string | null;
  rankEmojiEnd: string | null;
  milestones: number;
}

export interface AnnualFavoritesPayload {
  highestRated: { title: string; country: string; type: string; rating: number } | null;
  favoritesAdded: Array<{ title: string; country: string; type: string }>;
  avgRating: number | null;
}

export interface AnnualTop10Payload {
  drawerYear: number;
  entries: Array<{ title: string; rank: number; country: string; type: string }>;
}

export interface AnnualCountriesPayload {
  countryCount: number;
  topCountry: string;
  topCountryCount: number;
  allCountries: [string, number][];
}

export interface AnnualGenresPayload {
  movieCount: number;
  seriesCount: number;
  topType: 'Movie' | 'Series';
}

export interface AnnualOngoingPayload {
  started: Array<{ title: string; country: string }>;
  completed: Array<{ title: string; country: string }>;
}

export interface AnnualAchievementsPayload {
  achievements: Array<{ title: string; type: string; value: number }>;
  totalUnlocked: number;
}

export interface AnnualHighlightsPayload {
  highlights: Array<{ label: string; value: string }>;
}

export interface AnnualFinalePayload {
  year: number;
  totalCompleted: number;
  totalActivity: number;
  rank: string | null;
  rankEmoji: string | null;
}

export interface AnnualQuietPayload {
  year: number;
}

// ── Context value ─────────────────────────────────────────────────────────────

export interface AnnualWrappedContextValue {
  annualSnapshots: AnnualWrappedSnapshot[];
  pendingAnnualSnapshot: AnnualWrappedSnapshot | null;
  activeAnnualSnapshot: AnnualWrappedSnapshot | null;
  annualHistoryOpen: boolean;
  isAnnualReady: boolean;

  viewAnnualSnapshot: (snapshot: AnnualWrappedSnapshot) => void;
  dismissAnnualPresentation: () => void;
  openAnnualHistory: () => void;
  closeAnnualHistory: () => void;
  replayAnnualSnapshot: (year: YearKey) => void;
}
