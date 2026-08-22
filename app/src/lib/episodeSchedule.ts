import type { AirDay, OngoingEntry } from '@/types';

export interface OngoingSchedule {
  /** The latest episode that should have been released by the current date. */
  airedEpisode: number | null;
  /** Total episodes represented by the active schedule. */
  totalEpisodes: number;
  isAiringToday: boolean;
  isFinalEpisodeAiringToday: boolean;
  /** Whether the final scheduled episode has aired, including previous days. */
  isFinalEpisodeAired: boolean;
  isConfigured: boolean;
}

const AIR_DAYS_BY_INDEX: Record<number, AirDay> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function hasReachedAirTime(now: Date, airTime = '00:00'): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(airTime);
  if (!match) return true;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return true;
  return now.getHours() * 60 + now.getMinutes() >= hours * 60 + minutes;
}

function getCalendarSchedule(
  ongoing: Pick<OngoingEntry, 'totalEpisodes' | 'releaseDates' | 'airTime'>,
  now: Date,
): OngoingSchedule {
  // Keep duplicate dates: multiple episodes can release on the same day
  // (for example, a two-episode premiere), and each date entry represents one
  // episode in the release calendar.
  const releaseDates = [...(ongoing.releaseDates || [])]
    .filter((value) => parseDateOnly(value) !== null)
    .sort();
  const todayKey = dateKey(now);
  const airingTimeReached = hasReachedAirTime(now, ongoing.airTime);
  const releasedThroughToday = releaseDates.filter(
    (value) => value < todayKey || (value === todayKey && airingTimeReached),
  ).length;
  const releasedBeforeToday = releaseDates.filter((value) => value < todayKey).length;
  const isAiringToday = releaseDates.includes(todayKey) && airingTimeReached;
  const totalEpisodes = releaseDates.length;

  return {
    totalEpisodes,
    airedEpisode: Math.min(totalEpisodes, releasedThroughToday),
    isAiringToday,
    isFinalEpisodeAiringToday:
      isAiringToday &&
      releasedBeforeToday < totalEpisodes &&
      releasedThroughToday >= totalEpisodes,
    isFinalEpisodeAired: totalEpisodes > 0 && releasedThroughToday >= totalEpisodes,
    isConfigured: releaseDates.length > 0,
  };
}

function countReleasedEpisodes(
  firstAirDate: Date,
  throughDate: Date,
  airDays: Set<AirDay>,
  premiereEpisodeCount: number,
): number {
  if (throughDate < firstAirDate) return 0;

  // The premiere date can release a batch of episodes. Subsequent selected
  // air days contribute one episode each.
  const cursor = new Date(firstAirDate);
  let count = premiereEpisodeCount;
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= throughDate) {
    if (airDays.has(AIR_DAYS_BY_INDEX[cursor.getDay()])) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Calculates the schedule without changing the user's watched progress.
 *
 * The calculation intentionally uses local calendar dates, matching the rest
 * of the app's weekday-based airing UI. A missing premiere date means the
 * entry remains in the existing manual-tracking mode.
 */
export function getOngoingSchedule(
  ongoing: Pick<
    OngoingEntry,
    | 'firstAirDate'
    | 'airTime'
    | 'airDays'
    | 'totalEpisodes'
    | 'premiereEpisodeCount'
    | 'trackingMode'
    | 'releaseDates'
  >,
  now = new Date(),
): OngoingSchedule {
  const firstAirDate = ongoing.firstAirDate ? parseDateOnly(ongoing.firstAirDate) : null;
  const airDays = new Set(ongoing.airDays);
  const premiereEpisodeCount = Math.max(
    1,
    Math.floor(ongoing.premiereEpisodeCount ?? 1),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (ongoing.trackingMode === 'calendar') {
    return getCalendarSchedule(ongoing, now);
  }

  const isPremiereDay = firstAirDate
    ? today.getTime() === firstAirDate.getTime()
    : false;
  const isAiringToday =
    (isPremiereDay || airDays.has(AIR_DAYS_BY_INDEX[today.getDay()])) &&
    (!firstAirDate || today >= firstAirDate) &&
    hasReachedAirTime(now, ongoing.airTime);

  if (!firstAirDate || airDays.size === 0 || ongoing.totalEpisodes <= 0) {
    return {
      airedEpisode: null,
      totalEpisodes: ongoing.totalEpisodes,
      isAiringToday,
      isFinalEpisodeAiringToday: false,
      isFinalEpisodeAired: false,
      isConfigured: false,
    };
  }

  const scheduleThroughDate = new Date(today);
  const isScheduledToday = isPremiereDay || airDays.has(AIR_DAYS_BY_INDEX[today.getDay()]);
  if (isScheduledToday && !hasReachedAirTime(now, ongoing.airTime)) {
    scheduleThroughDate.setDate(scheduleThroughDate.getDate() - 1);
  }
  const yesterday = new Date(scheduleThroughDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const releasedThroughToday = countReleasedEpisodes(
    firstAirDate,
    scheduleThroughDate,
    airDays,
    premiereEpisodeCount,
  );
  const releasedBeforeToday = countReleasedEpisodes(
    firstAirDate,
    yesterday,
    airDays,
    premiereEpisodeCount,
  );
  const airedEpisode = Math.min(ongoing.totalEpisodes, releasedThroughToday);
  const isFinalEpisodeAiringToday =
    isAiringToday &&
    releasedBeforeToday < ongoing.totalEpisodes &&
    releasedThroughToday >= ongoing.totalEpisodes;

  return {
    totalEpisodes: ongoing.totalEpisodes,
    airedEpisode,
    isAiringToday,
    isFinalEpisodeAiringToday,
    isFinalEpisodeAired: releasedThroughToday >= ongoing.totalEpisodes,
    isConfigured: true,
  };
}

export function formatDateOnly(value: string): string {
  const date = parseDateOnly(value);
  if (!date) return value;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isValidDateOnly(value: string): boolean {
  return Boolean(parseDateOnly(value));
}

export function getDateOnly(date = new Date()): string {
  return dateKey(date);
}