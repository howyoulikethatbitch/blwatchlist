# Prompt #3 — Annual BL Wrapped: Backend Logic

Implement a new feature called **Annual BL Wrapped** into the BL Watchlist app.

This task is ONLY for the backend logic, data aggregation, annual snapshot generation, storage, and lifecycle management. Do NOT implement the UI, animations, visual designs, presentation screens, or final wording yet.

## Goal

Annual BL Wrapped is the **grand yearly reflection** of the user's BL journey.

It should answer:

> **"What did I experience and accomplish with BL this year?"**

Unlike Monthly BL Wrapped, which summarizes one month, Annual BL Wrapped should summarize the user's **entire BL activity and journey throughout a calendar year**.

It is a celebration and reflection system, NOT a goal, grading, or productivity system.

## Annual Data Collection

Collect and aggregate meaningful BL activity throughout the calendar year.

Examples include, but are not limited to:

- Total BL titles added
- Total BL titles completed
- Total BL titles dropped
- Total BL titles planned
- Total ongoing BLs followed
- Total ratings submitted
- Average rating for the year
- Highest-rated BL of the year
- Lowest-rated BL of the year
- Favorite BLs added
- Countries watched
- Most watched country
- Genres watched
- Most watched genre
- Movies watched
- Series watched
- Top 10 / yearly ranking activity
- Achievements unlocked
- Collection growth
- Collection rank progression
- New personal records
- Other meaningful BL-related activity recorded by the app

The architecture must remain flexible so additional annual statistics can be added later.

## Activity-Based Logic

Annual Wrapped should reflect **what actually happened during the year**, rather than simply reading the user's current collection state.

For example:

- A BL started in 2026 should contribute to 2026 activity.
- A BL completed in 2026 should contribute to 2026 completion statistics.
- A BL rated in 2026 should contribute to 2026 rating statistics.
- A BL added to Favorites in 2026 should contribute to 2026 favorite activity.
- A BL added to a Top 10 in 2026 should contribute to 2026 ranking activity.

Different milestones may cause the same BL to appear in different statistics.

Do not treat the final status of an entry at the end of the year as the only source of truth.

## Ongoing BLs

Ongoing BLs must be supported.

Track meaningful events separately, such as:

- Started following an ongoing BL
- Continued watching an ongoing BL
- Completed an ongoing BL
- Rated an ongoing BL
- Added an ongoing BL to Favorites

An ongoing BL that starts in one year and finishes in another must be represented in the appropriate year's activity.

Example:

A BL starts in December 2026 and finishes in January 2027.

2026 should record the user's activity of starting/following it.

2027 should record the completion when it occurs.

Do not move the entire BL into one year simply because it was eventually completed.

## Annual Snapshot

At the end of each calendar year, generate a permanent Annual BL Wrapped snapshot.

The snapshot must contain only the data belonging to that specific year.

Once generated:

- It becomes read-only.
- It must never change because of later edits.
- It must remain accessible permanently.
- It must represent the user's historical BL journey for that year.

For example:

**2026 Annual Wrapped**

must always represent the user's recorded BL activity from:

**January 1, 2026 → December 31, 2026**

Later changes to ratings, favorites, Top 10 rankings, statuses, or collection data must not rewrite the historical snapshot.

## Automatic Generation

The Annual Wrapped does NOT require the user to open the app on December 31.

If the user does not open the app at the end of the year, the system must generate the previous year's Annual Wrapped the next time the app is opened.

Example:

- December 31, 2026 → user does not open the app.
- January 1–10, 2027 → user still does not open the app.
- January 11, 2027 → user opens the app.

The app should detect that the 2026 Annual Wrapped has not yet been generated, generate it safely, save it permanently, and make it available to the user.

## Multiple Missed Years

The system must support users who do not open the app for an extended period.

Example:

The user last opened the app in 2024 and returns in 2027.

The system should safely determine which previous calendar years require Annual Wrapped snapshots.

Only generate years for which the app has sufficient recorded data/activity or an appropriate historical snapshot state.

Do not duplicate existing Annual Wrapped snapshots.

## Years With No Activity

A calendar year with no recorded BL activity should still be handled safely.

Do not create fake statistics or invent activity.

If the system creates a snapshot for an inactive year, it should simply contain an inactive/quiet-year state with no fabricated statistics.

The frontend will later determine how that quiet year is presented.

## Relationship With Monthly BL Wrapped

Annual BL Wrapped should be compatible with the existing Monthly BL Wrapped system.

Where reliable monthly snapshots exist, the Annual system may use them as an aggregation source where appropriate.

However, the Annual Wrapped must remain accurate even if:

- Some monthly snapshots are missing.
- The user did not open the app during certain months.
- The user skipped multiple months.
- The user has older historical data.

Do not assume that a user must have viewed every Monthly Wrapped for Annual Wrapped to work.

Annual Wrapped represents the entire year independently.

## Data Integrity

Ensure:

- Only one Annual Wrapped exists per calendar year.
- Duplicate snapshots can never be created.
- Snapshot generation is idempotent and safe to run multiple times.
- Generation remains safe if the app closes unexpectedly.
- Historical snapshots cannot accidentally be overwritten.
- Existing Monthly Wrapped data is not modified.
- Annual generation does not interfere with normal BL Watchlist functionality.

## Offline Compatibility

BL Watchlist is offline-first.

Annual BL Wrapped must therefore:

- Work completely offline.
- Use the existing IndexedDB/Dexie architecture.
- Require no internet connection.
- Persist generated Annual Wrapped snapshots locally.

## Performance

Do not recalculate the entire BL database unnecessarily every time the app launches.

Use the existing activity/snapshot architecture where possible.

Annual aggregation should remain efficient even when the user has:

- Hundreds or thousands of BL entries.
- Many ratings.
- Many achievements.
- Multiple years of historical data.

## Future Scalability

Build the Annual Wrapped system in a modular way.

It should be possible to add future statistics without rewriting the entire system.

The architecture should also allow future Annual Wrapped versions to introduce:

- New statistics
- New milestone types
- New historical comparisons
- New yearly records
- New categories

without breaking existing saved Annual Wrapped snapshots.

## Important Principle

Annual BL Wrapped should represent **the user's BL journey during that year**, not simply a report of their current collection.

The same BL may legitimately contribute to multiple yearly statistics if different activities occurred in different years.

For example:

2026 → Started watching  
2026 → Rated  
2027 → Completed  
2027 → Added to Favorites

Each event belongs to the year in which it actually happened.

## Scope Restriction

Do NOT implement:

- UI
- Wrapped screens
- Animations
- Transitions
- Cards
- Visual layouts
- Final narrator comments
- Share graphics
- Annual Wrapped presentation order

Those will be handled separately in **Prompt #4 — Annual BL Wrapped: Frontend / User Experience**.

Reuse the existing Monthly BL Wrapped architecture and conventions where appropriate, but keep Annual Wrapped as its own permanent yearly snapshot system.