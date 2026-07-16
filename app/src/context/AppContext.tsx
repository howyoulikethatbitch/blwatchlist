import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { AppState, AppAction, Entry, OngoingEntry, FavoriteEntry, Top10Drawer, AirDay } from '@/types';
import { saveToIndexedDB, loadFromIndexedDB } from '@/hooks/useIndexedDB';
import type { Milestone, MilestoneType } from '@/components/MilestoneModal';

const AIR_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function getCurrentDay(): string {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return AIR_DAYS.includes(day as typeof AIR_DAYS[number]) ? day : 'Monday';
}

function calculateBonusEvaluation(f: FavoriteEntry): number {
  const checked = [
    f.originality, f.flowAndPacing, f.characterDepth,
    f.relationshipDynamics, f.emotionalImpact, f.ending, f.rewatchValue
  ].filter(Boolean).length;
  return Math.round(checked * 0.1 * 100) / 100;
}

function calculateOverallRating(f: FavoriteEntry): number {
  const baseAvg = (f.storyline + f.acting + f.music + f.chemistry + f.cinematography) / 5;
  const bonus = calculateBonusEvaluation(f);
  return Math.min(Math.round((baseAvg + bonus) * 100) / 100, 10.00);
}

/* ============================================================
   Milestone Definitions
   ============================================================ */

const MILESTONE_THRESHOLDS: Record<string, number[]> = {
  COLLECTION_SIZE: [50, 100, 150, 200, 250, 300, 500],
  FAVORITES_MILESTONE: [10, 25, 50, 75, 100],
};

function getMilestoneTitle(type: MilestoneType, value: number): string {
  switch (type) {
    case 'COLLECTION_SIZE': return `${value} Titles Collected!`;
    case 'FAVORITES_MILESTONE': return `${value} Favorites!`;
    case 'PERFECT_RATING': return 'First Perfect 10.0!';
    case 'TOP10_COMPLETE': return 'Top 10 Complete!';
    case 'ANNIVERSARY': return `${value}-Year Anniversary!`;
    default: return 'Milestone Reached!';
  }
}

function getMilestoneMessage(type: MilestoneType, value: number): string {
  switch (type) {
    case 'COLLECTION_SIZE': return `Your collection has grown to ${value} titles. Incredible dedication!`;
    case 'FAVORITES_MILESTONE': return `You've curated ${value} favorites. Your taste is impeccable!`;
    case 'PERFECT_RATING': return 'You gave your first perfect 10.0 rating. A true masterpiece!';
    case 'TOP10_COMPLETE': return 'You filled a Top 10 drawer for the first time. What a year!';
    case 'ANNIVERSARY': return `You've been watching BL for ${value} years. Here's to many more!`;
    default: return 'Keep up the amazing work!';
  }
}

export const initialState: AppState = {
  entries: [],
  ongoing: [],
  favorites: [],
  top10Drawers: [],
  ongoingYear: new Date().getFullYear(),
  watchingSince: null,
  importMode: false,
  milestoneQueue: [],
  celebratedMilestones: [],
  showMilestoneCelebrations: true,
};

/** Migrate legacy status values and ensure createdAt exists */
function migrateEntry(e: Record<string, unknown>): Entry {
  let status = (e.status as string) || 'COMPLETE';
  // Legacy: INCOMPLETE -> COMPLETE
  if (status === 'INCOMPLETE') {
    status = 'COMPLETE';
  }
  // Ensure valid status
  if (!['COMPLETE', 'ONGOING', 'DROPPED', 'PLANNED'].includes(status)) {
    status = 'COMPLETE';
  }

  return {
    ...(e as unknown as Entry),
    status: status as Entry['status'],
    poster: (e.poster as string) ?? null,
    type: (e.type as 'Movie' | 'Series') || 'Series',
    year: typeof e.year === 'number' ? e.year : new Date().getFullYear(),
    country: (e.country as string) || 'Unknown',
    title: (e.title as string) || 'Untitled',
    id: (e.id as string) || `bl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: typeof e.createdAt === 'number' ? e.createdAt : Date.now()
  };
}

function validateData(data: unknown): AppState {
  if (!data || typeof data !== 'object') return { ...initialState };
  const d = data as Record<string, unknown>;
  const entries = Array.isArray(d.entries) ? d.entries : [];
  const ongoing = Array.isArray(d.ongoing) ? d.ongoing : [];
  const favorites = Array.isArray(d.favorites) ? d.favorites : [];
  const top10Drawers = Array.isArray(d.top10Drawers) ? d.top10Drawers : [];
  const ongoingYear = typeof d.ongoingYear === 'number' ? d.ongoingYear : new Date().getFullYear();
  const watchingSince = typeof d.watchingSince === 'number' ? d.watchingSince : null;

  // Migrate milestone-related fields
  const celebratedMilestones = Array.isArray(d.celebratedMilestones) ? d.celebratedMilestones as string[] : [];
  const showMilestoneCelebrations = typeof d.showMilestoneCelebrations === 'boolean' ? d.showMilestoneCelebrations : true;

  const migratedEntries = entries.map((e: Record<string, unknown>) => migrateEntry(e));

  // Clean up: remove favorites for dropped entries
  const favoritesRaw = favorites as unknown as Record<string, unknown>[];

  const validFavorites = favoritesRaw
    .filter((f) => {
      const entry = migratedEntries.find((e: Entry) => e.id === f.entryId);
      return entry && entry.status !== 'DROPPED';
    })
    .map((f) => ({
      entryId: (f.entryId as string) || '',
      storyline: typeof f.storyline === 'number' ? f.storyline : 5,
      acting: typeof f.acting === 'number' ? f.acting : 5,
      music: typeof f.music === 'number' ? f.music : 5,
      chemistry: typeof f.chemistry === 'number' ? f.chemistry : 5,
      cinematography: typeof f.cinematography === 'number' ? f.cinematography : 5,
      originality: Boolean(f.originality),
      flowAndPacing: Boolean(f.flowAndPacing),
      characterDepth: Boolean(f.characterDepth),
      relationshipDynamics: Boolean(f.relationshipDynamics),
      emotionalImpact: Boolean(f.emotionalImpact),
      ending: Boolean(f.ending),
      rewatchValue: Boolean(f.rewatchValue),
      gapPenalty: typeof f.gapPenalty === 'number' ? f.gapPenalty : 0,
      overallRating: typeof f.overallRating === 'number' ? f.overallRating : 5.0,
    })) as unknown as FavoriteEntry[];

  // Clean up: remove top10 entries for dropped entries
  const validTop10Drawers = (top10Drawers as unknown as Record<string, unknown>[]).map((td) => ({
    year: typeof td.year === 'number' ? td.year : new Date().getFullYear(),
    entries: (Array.isArray(td.entries) ? (td.entries as unknown as Record<string, unknown>[]) : [])
      .filter((e) => {
        const entry = migratedEntries.find((en: Entry) => en.id === e.entryId);
        return entry && entry.status !== 'DROPPED';
      })
      .map((e) => ({
        entryId: (e.entryId as string) || '',
        rank: typeof e.rank === 'number' ? e.rank : 1
      }))
  })) as unknown as Top10Drawer[];

  return {
    entries: migratedEntries as unknown as Entry[],
    ongoing: ongoing as OngoingEntry[],
    favorites: validFavorites,
    top10Drawers: validTop10Drawers,
    ongoingYear,
    watchingSince,
    importMode: false,
    milestoneQueue: [],
    celebratedMilestones,
    showMilestoneCelebrations,
  };
}

/* ============================================================
   Milestone Checking Logic
   ============================================================ */

function checkMilestoneThreshold(
  type: MilestoneType,
  value: number,
  celebrated: string[],
): Milestone | null {
  const thresholds = MILESTONE_THRESHOLDS[type];
  if (!thresholds) return null;

  for (const threshold of thresholds) {
    if (value >= threshold) {
      const milestoneId = `${type}-${threshold}`;
      if (!celebrated.includes(milestoneId)) {
        return {
          type,
          title: getMilestoneTitle(type, threshold),
          message: getMilestoneMessage(type, threshold),
          value: threshold,
        };
      }
    }
  }
  return null;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_ENTRY': {
      const entry = action.payload;
      let ongoing = state.ongoing;
      if (entry.status === 'ONGOING') {
        const o: OngoingEntry = {
          entryId: entry.id,
          currentEpisode: 0,
          totalEpisodes: 1,
          airDays: [getCurrentDay() as AirDay]
        };
        ongoing = [...state.ongoing, o];
      }
      return { ...state, entries: [...state.entries, entry], ongoing };
    }

    case 'UPDATE_ENTRY': {
      const entries = state.entries.map(e => e.id === action.payload.id ? action.payload : e);
      const entry = action.payload;
      let ongoing = state.ongoing;

      // Handle status change effects
      const oldEntry = state.entries.find(e => e.id === entry.id);
      const hadOngoing = oldEntry?.status === 'ONGOING';
      const nowOngoing = entry.status === 'ONGOING';

      if (nowOngoing) {
        if (!state.ongoing.find(o => o.entryId === entry.id)) {
          const o: OngoingEntry = {
            entryId: entry.id,
            currentEpisode: 0,
            totalEpisodes: 1,
            airDays: [getCurrentDay() as AirDay]
          };
          ongoing = [...state.ongoing, o];
        }
      } else if (hadOngoing) {
        ongoing = state.ongoing.filter(o => o.entryId !== entry.id);
      }

      // If status changed to DROPPED, remove from favorites and top10
      let favorites = state.favorites;
      let top10Drawers = state.top10Drawers;
      if (entry.status === 'DROPPED' && oldEntry?.status !== 'DROPPED') {
        favorites = state.favorites.filter(f => f.entryId !== entry.id);
        top10Drawers = state.top10Drawers.map(d => ({
          ...d,
          entries: d.entries.filter(e => e.entryId !== entry.id).map((e, i) => ({ ...e, rank: i + 1 }))
        }));
      }

      return { ...state, entries, ongoing, favorites, top10Drawers };
    }

    case 'DELETE_ENTRY': {
      const id = action.payload;
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== id),
        ongoing: state.ongoing.filter(o => o.entryId !== id),
        favorites: state.favorites.filter(f => f.entryId !== id),
        top10Drawers: state.top10Drawers.map(d => ({
          ...d,
          entries: d.entries.filter(e => e.entryId !== id).map((e, i) => ({ ...e, rank: i + 1 }))
        }))
      };
    }

    case 'TOGGLE_FAVORITE': {
      const entryId = action.payload;
      // Prevent favoriting dropped entries
      const entry = state.entries.find(e => e.id === entryId);
      if (entry?.status === 'DROPPED') return state;

      if (state.favorites.find(f => f.entryId === entryId)) {
        return { ...state, favorites: state.favorites.filter(f => f.entryId !== entryId) };
      }
      if (!entry) return state;
      const newFav: FavoriteEntry = {
        entryId,
        storyline: 5,
        acting: 5,
        music: 5,
        chemistry: 5,
        cinematography: 5,
        originality: false,
        flowAndPacing: false,
        characterDepth: false,
        relationshipDynamics: false,
        emotionalImpact: false,
        ending: false,
        rewatchValue: false,
        gapPenalty: 0,
        overallRating: 5.0
      };
      return { ...state, favorites: [...state.favorites, newFav] };
    }

    case 'UPDATE_FAVORITE': {
      const updated = {
        ...action.payload,
        gapPenalty: calculateBonusEvaluation(action.payload),
        overallRating: 0
      };
      updated.overallRating = calculateOverallRating(updated);
      return {
        ...state,
        favorites: state.favorites.map(f => f.entryId === updated.entryId ? updated : f)
      };
    }

    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(f => f.entryId !== action.payload) };

    case 'UPDATE_ONGOING':
      return state.ongoing.find(o => o.entryId === action.payload.entryId)
        ? { ...state, ongoing: state.ongoing.map(o => o.entryId === action.payload.entryId ? action.payload : o) }
        : { ...state, ongoing: [...state.ongoing, action.payload] };

    case 'ADD_TO_TOP10': {
      const { year, entryId } = action.payload;
      // Prevent adding dropped entries to top10
      const entry = state.entries.find(e => e.id === entryId);
      if (entry?.status === 'DROPPED') return state;

      return {
        ...state,
        top10Drawers: state.top10Drawers.map(d => {
          if (d.year === year && d.entries.length < 10 && !d.entries.find(e => e.entryId === entryId)) {
            const rank = d.entries.length + 1;
            return { ...d, entries: [...d.entries, { entryId, rank }] };
          }
          return d;
        })
      };
    }

    case 'REMOVE_FROM_TOP10': {
      const { year, entryId } = action.payload;
      return {
        ...state,
        top10Drawers: state.top10Drawers.map(d => {
          if (d.year === year) {
            const entries = d.entries.filter(e => e.entryId !== entryId).map((e, i) => ({ ...e, rank: i + 1 }));
            return { ...d, entries };
          }
          return d;
        })
      };
    }

    case 'REORDER_TOP10': {
      const { year, entries } = action.payload;
      return {
        ...state,
        top10Drawers: state.top10Drawers.map(d =>
          d.year === year ? { ...d, entries: entries.map((e, i) => ({ ...e, rank: i + 1 })) } : d
        )
      };
    }

    case 'ADD_DRAWER': {
      const year = action.payload;
      return state.top10Drawers.find(d => d.year === year)
        ? state
        : { ...state, top10Drawers: [...state.top10Drawers, { year, entries: [] }].sort((a, b) => b.year - a.year) };
    }

    case 'DELETE_DRAWER':
      return { ...state, top10Drawers: state.top10Drawers.filter(d => d.year !== action.payload) };

    case 'IMPORT_DATA': {
      const validated = validateData(action.payload);
      return validated;
    }

    case 'SET_ONGOING_YEAR':
      return { ...state, ongoingYear: action.payload };

    case 'SET_WATCHING_SINCE':
      return { ...state, watchingSince: action.payload };

    case 'SET_IMPORT_MODE':
      return { ...state, importMode: action.payload };

    case 'PUSH_MILESTONE':
      return { ...state, milestoneQueue: [...state.milestoneQueue, action.payload] };

    case 'POP_MILESTONE':
      return { ...state, milestoneQueue: state.milestoneQueue.slice(1) };

    case 'CLEAR_MILESTONE_QUEUE':
      return { ...state, milestoneQueue: [] };

    case 'CELEBRATE_MILESTONE': {
      const milestoneId = action.payload;
      if (state.celebratedMilestones.includes(milestoneId)) return state;
      return {
        ...state,
        celebratedMilestones: [...state.celebratedMilestones, milestoneId],
      };
    }

    case 'SET_SHOW_MILESTONE_CELEBRATIONS':
      return { ...state, showMilestoneCelebrations: action.payload };

    default:
      return state;
  }
}

// Legacy localStorage keys (for migration)
const LEGACY_STORAGE_KEY = 'bl-watchlist-data';
const LEGACY_VERSION = 1;

// Migrate data from localStorage to IndexedDB
async function migrateFromLocalStorage(): Promise<AppState | null> {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version === LEGACY_VERSION && parsed.data) {
      const migrated = validateData(parsed.data);
      await saveToIndexedDB(migrated);
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* ignore */ }
      console.log('[Migration] Successfully migrated data from localStorage to IndexedDB');
      return migrated;
    }
  } catch (err) {
    console.warn('[Migration] Failed to migrate from localStorage:', err);
  }
  return null;
}

// Load from IndexedDB (with localStorage migration fallback)
async function loadInitialState(): Promise<AppState> {
  const indexedDBData = await loadFromIndexedDB();
  if (indexedDBData && (indexedDBData.entries.length > 0 || indexedDBData.favorites.length > 0)) {
    return indexedDBData;
  }
  const migrated = await migrateFromLocalStorage();
  if (migrated) return migrated;
  return { ...initialState };
}

/* ============================================================
   Extended App Context with Milestones
   ============================================================ */

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoaded: boolean;
  getEntryById: (id: string) => Entry | undefined;
  getOngoingByEntryId: (id: string) => OngoingEntry | undefined;
  getFavoriteByEntryId: (id: string) => FavoriteEntry | undefined;
  isFavorited: (id: string) => boolean;
  isInTop10: (id: string) => { year: number; rank: number } | null;
  checkMilestones: (type: MilestoneType, value: number) => void;
  celebrateMilestone: (milestone: Milestone) => void;
  dismissMilestone: () => void;
  currentMilestone: Milestone | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadInitialState().then(loaded => {
      if (loaded.entries.length > 0 || loaded.favorites.length > 0) {
        dispatch({ type: 'SET_STATE', payload: loaded });
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      saveToIndexedDB(state).catch(err => {
        console.warn('Auto-save failed:', err);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [state, isLoaded]);

  // Process milestone queue
  useEffect(() => {
    if (state.milestoneQueue.length > 0 && !currentMilestone) {
      const next = state.milestoneQueue[0];
      setCurrentMilestone(next);
      dispatch({ type: 'POP_MILESTONE' });
    }
  }, [state.milestoneQueue, currentMilestone]);

  const getEntryById = useCallback((id: string) => state.entries.find(e => e.id === id), [state.entries]);
  const getOngoingByEntryId = useCallback((id: string) => state.ongoing.find(o => o.entryId === id), [state.ongoing]);
  const getFavoriteByEntryId = useCallback((id: string) => state.favorites.find(f => f.entryId === id), [state.favorites]);
  const isFavorited = useCallback((id: string) => state.favorites.some(f => f.entryId === id), [state.favorites]);
  const isInTop10 = useCallback((id: string) => {
    for (const drawer of state.top10Drawers) {
      const entry = drawer.entries.find(e => e.entryId === id);
      if (entry) return { year: drawer.year, rank: entry.rank };
    }
    return null;
  }, [state.top10Drawers]);

  // Check if a milestone threshold was crossed
  const checkMilestones = useCallback((type: MilestoneType, value: number) => {
    const celebrated = state.celebratedMilestones;
    let milestone: Milestone | null = null;

    if (type === 'PERFECT_RATING' && value >= 10.0) {
      const id = 'PERFECT_RATING-first';
      if (!celebrated.includes(id)) {
        milestone = {
          type: 'PERFECT_RATING',
          title: getMilestoneTitle('PERFECT_RATING', 10),
          message: getMilestoneMessage('PERFECT_RATING', 10),
          value: 10,
        };
      }
    } else if (type === 'TOP10_COMPLETE') {
      const id = 'TOP10_COMPLETE-first';
      if (!celebrated.includes(id)) {
        const fullDrawer = state.top10Drawers.find(d => d.entries.length >= 10);
        if (fullDrawer) {
          milestone = {
            type: 'TOP10_COMPLETE',
            title: getMilestoneTitle('TOP10_COMPLETE', fullDrawer.year),
            message: getMilestoneMessage('TOP10_COMPLETE', fullDrawer.year),
            value: fullDrawer.year,
          };
        }
      }
    } else if (type === 'ANNIVERSARY') {
      if (state.watchingSince) {
        const currentYear = new Date().getFullYear();
        const years = currentYear - state.watchingSince;
        if (years > 0) {
          const id = `ANNIVERSARY-${years}`;
          if (!celebrated.includes(id)) {
            milestone = {
              type: 'ANNIVERSARY',
              title: getMilestoneTitle('ANNIVERSARY', years),
              message: getMilestoneMessage('ANNIVERSARY', years),
              value: years,
            };
          }
        }
      }
    } else {
      milestone = checkMilestoneThreshold(type, value, celebrated);
    }

    if (milestone) {
      dispatch({ type: 'CELEBRATE_MILESTONE', payload: `${milestone.type}-${milestone.value}` });
      // Only queue for display if not in import mode and celebrations are enabled
      if (!state.importMode && state.showMilestoneCelebrations) {
        dispatch({ type: 'PUSH_MILESTONE', payload: milestone });
      }
    }
  }, [state.celebratedMilestones, state.importMode, state.showMilestoneCelebrations, state.watchingSince, state.top10Drawers]);

  const celebrateMilestone = useCallback((milestone: Milestone) => {
    dispatch({ type: 'CELEBRATE_MILESTONE', payload: `${milestone.type}-${milestone.value}` });
    if (!state.importMode && state.showMilestoneCelebrations) {
      dispatch({ type: 'PUSH_MILESTONE', payload: milestone });
    }
  }, [state.importMode, state.showMilestoneCelebrations]);

  const dismissMilestone = useCallback(() => {
    setCurrentMilestone(null);
  }, []);

  return (
    <AppContext.Provider value={{
      state, dispatch, isLoaded,
      getEntryById, getOngoingByEntryId, getFavoriteByEntryId,
      isFavorited, isInTop10,
      checkMilestones,
      celebrateMilestone,
      dismissMilestone,
      currentMilestone,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
