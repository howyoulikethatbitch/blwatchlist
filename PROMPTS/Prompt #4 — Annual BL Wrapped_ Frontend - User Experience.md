# Prompt #4 — Annual BL Wrapped: Frontend / User Experience

Implement the complete frontend and user experience for the **Annual BL Wrapped** feature using the backend system already implemented.

This task is ONLY for the frontend presentation, animations, transitions, navigation, storytelling, and user experience.

Do NOT redesign the backend tracking or snapshot logic unless a minor frontend integration adjustment is required.

## Goal

Annual BL Wrapped should feel like the **grand celebration of the user's entire BL journey throughout the year**.

It should be inspired by the storytelling style and interactive experience of **Spotify Wrapped**, while maintaining the unique identity of BL Watchlist.

The Annual Wrapped should feel significantly more special than Monthly Wrapped.

Monthly Wrapped = a short monthly reflection.

Annual Wrapped = the **year-end celebration and finale**.

The experience should feel exciting, emotional, memorable, and rewarding.

---

## Overall Experience

The Annual Wrapped should feel like an interactive story rather than a statistics dashboard.

Avoid displaying everything at once.

Instead, present the year as a sequence of immersive slides/scenes.

Each screen should focus on **one major statistic, milestone, discovery, or reflection**.

The experience should progressively build toward the user's biggest highlights of the year.

Use smooth transitions, motion, typography, and visual effects to create a polished and premium experience.

---

## Opening

Begin with a strong introduction that establishes the year being reviewed.

Example concept:

> "Your 2026 BL Wrapped is here."

Follow this with a short anticipation-building sequence before revealing the user's statistics.

The opening should feel like the beginning of a special yearly event.

---

## Story Structure

The exact number of screens should be determined dynamically based on the available yearly data.

Do NOT create empty screens for statistics that did not occur.

Possible sections include, but are not limited to:

### 1. Year Introduction

Introduce the user's Annual BL Wrapped.

Display:

- The year
- A short personalized introduction
- Total overall BL activity for the year

---

### 2. Your BL Year in Numbers

Reveal major yearly statistics such as:

- Total BL titles added
- Total completed
- Total ratings
- Total favorites
- Total dropped
- Total planned
- Total ongoing BLs followed

Only display statistics that are meaningful and supported by the annual snapshot.

Do not overwhelm one screen with too many numbers.

Distribute major statistics across multiple screens when appropriate.

---

### 3. Your BL Journey

Show meaningful progression throughout the year.

Examples:

- Collection growth
- Rank progression
- Major milestones
- Firsts
- Personal records
- Achievement progression

This section should make the user feel that their BL journey developed throughout the year.

---

### 4. Your Favorite BLs

Highlight the BLs that stood out during the year.

Possible highlights:

- Highest-rated BL
- Most memorable BL
- New favorite
- Top-rated titles
- Favorite additions

If a yearly Top 10 exists, give it special importance.

---

### 5. Your Top 10

If the user has a valid yearly Top 10, create a dedicated section for it.

Present the rankings dramatically.

The Top 10 should feel like one of the major highlights of the entire Wrapped.

Use animations or sequential reveals rather than showing all rankings simultaneously.

The #1 BL should receive the strongest reveal.

If no yearly Top 10 exists, skip this section.

---

### 6. Your BL Countries

Highlight the countries represented in the user's BL journey during the year.

Possible statistics:

- Number of countries watched
- Most watched country
- Country distribution
- New countries discovered

Do not create this section if there is insufficient country data.

---

### 7. Your Favorite Genres

Highlight the genres that shaped the user's year.

Possible statistics:

- Most watched genre
- Most highly rated genre
- Number of genres explored
- New genres discovered

Again, only display meaningful data.

---

### 8. Ongoing BL Journey

Include meaningful ongoing BL activity.

Examples:

- Ongoing BLs followed
- New ongoing BLs started
- Ongoing BLs completed during the year

Treat these as milestones rather than simply displaying "Ongoing" as a status.

A BL may legitimately appear in different yearly statistics if different milestones occurred during different years.

---

### 9. Achievements & Milestones

Give special attention to achievements unlocked throughout the year.

Possible highlights:

- Total achievements unlocked
- Rare achievements
- Major collection milestones
- Rank progression
- Personal records

Major achievements should receive more visual emphasis than ordinary statistics.

---

## Annual Narrator / Commentary System

Just like Monthly BL Wrapped, Annual BL Wrapped should have contextual narrator comments.

The narrator should make the experience feel like the app is personally reflecting on the user's year.

Comments should be:

- Short.
- Warm.
- Playful.
- Occasionally humorous.
- Context-aware.
- Encouraging.
- Never judgmental.

Examples:

### High Activity

> "Looks like 2026 was quite the BL marathon."

> "You definitely made time for BL this year."

### Large Collection Growth

> "Your BL library had quite the glow-up this year."

### Many Favorites

> "Apparently, your heart had plenty of room this year."

### Many Countries

> "Your BL passport got a serious workout."

### Many Genres

> "You really weren't afraid to explore."

### Many Completed BLs

> "You came, you watched, you conquered."

### Many Planned BLs

> "Your watchlist is already planning your next year."

### Many Dropped BLs

> "Not every story made it to the finale—and that's okay."

### Quiet Year

> "Every journey has its quiet chapters."

### Top 10

> "After everything you watched this year, these are the ones that stayed with you."

The implementation should support multiple variations so the same comment does not appear every year.

---

## Biggest Highlights

The system should identify and present the user's most meaningful yearly highlights.

Examples:

- Highest-rated BL
- Most watched country
- Most watched genre
- Biggest collection milestone
- Most achievements
- Top-ranked BL
- New favorite
- Personal record

Do not force every possible highlight into the presentation.

Select the most meaningful ones based on the available data.

---

## Year-End Finale

The final section should feel like the conclusion of the user's BL year.

It should summarize the journey emotionally rather than simply showing another statistic.

Possible concepts:

> "And that's your 2026 BL journey."

> "From the stories you discovered to the ones you couldn't forget..."

> "Thank you for another year of BL."

Then conclude with a warm transition toward the next year.

The ending should not pressure the user to watch more.

It should simply communicate:

**The next chapter is waiting whenever they're ready.**

---

## Quiet / Low-Activity Years

If the user had very little BL activity during the year:

Do NOT create a long, empty Wrapped.

Instead, generate a shorter experience containing only meaningful information.

If there was absolutely no activity:

- Do not fabricate statistics.
- Do not display empty statistical cards.
- Present a short reflective experience acknowledging the quiet year.
- Keep the tone warm and positive.

---

## Navigation & Controls

Users should be able to:

- Tap to continue.
- Swipe between slides.
- Navigate backward.
- Pause/resume where appropriate.
- Exit at any point.
- Replay the Wrapped later.

Do not force the user to restart the entire experience if they accidentally exit.

---

## Annual Wrapped History

Add Annual Wrapped to the existing Wrapped history system.

Users should be able to access previous Annual Wrappeds by year.

Example:

- 2026 Wrapped
- 2025 Wrapped
- 2024 Wrapped
- 2023 Wrapped

Each Annual Wrapped must remain replayable permanently.

Clearly distinguish:

- New/unviewed Annual Wrapped
- Previously viewed Annual Wrapped

---

## Relationship With Monthly Wrapped

Annual Wrapped should feel connected to Monthly Wrapped without simply repeating it.

Monthly Wrapped represents individual chapters.

Annual Wrapped represents the complete story.

Do NOT simply display the twelve Monthly Wrappeds one after another.

Instead, use the yearly data to create a higher-level narrative.

For example:

Monthly:

> "You completed 7 BLs this month."

Annual:

> "You completed 74 BLs throughout the entire year."

The Annual experience should focus on **patterns, milestones, favorites, records, and the overall journey**.

---

## Animation & Visual Direction

Use the existing Monthly Wrapped visual language as the foundation.

However, Annual Wrapped should feel more elaborate and cinematic.

Possible techniques include:

- Smooth page transitions
- Animated statistics
- Sequential number reveals
- Dramatic ranking reveals
- Subtle particles
- Motion-based typography
- Scale/fade transitions
- Progress indicators
- Dynamic backgrounds
- Celebration effects for major achievements

Do not overload every screen with animation.

The visual hierarchy should determine where animation is appropriate.

The #1 Top 10 reveal, major achievements, and final yearly summary may receive stronger animation than ordinary statistics.

---

## Mobile-First & Performance

The Annual Wrapped must be optimized primarily for mobile.

It should work smoothly on lower-end Android devices.

Avoid:

- Heavy 3D effects
- Excessive particle systems
- Large unnecessary assets
- Long blocking animations
- Animations that significantly affect performance

Prioritize:

- Smooth transitions
- Fast loading
- Responsive touch interaction
- Readable typography
- Stable performance

---

## Sharing

Design the presentation architecture so important Annual Wrapped moments can eventually be converted into shareable cards/images.

However, do NOT implement external social sharing unless already supported by the existing application architecture.

The primary goal is the in-app Annual Wrapped experience.

---

## Important Design Principle

Annual BL Wrapped should never feel like an evaluation of whether the user had a "good" or "bad" year.

There is no ideal number of BLs to watch.

There is no minimum activity requirement.

A year with 100 BLs and a year with 3 BLs are both valid BL journeys.

The system celebrates what happened rather than judging what did not happen.

---

## Final Experience Goal

When the user finishes Annual BL Wrapped, they should feel:

> **"Wow. I didn't realize how much of my BL journey happened this year."**

The feature should turn the user's existing collection and activity data into a memorable yearly story.

It should feel like the **grand finale of their BL year**, while establishing a foundation that can be repeated every year without becoming repetitive.