# F1 Driver Comparer

**The ultimate head-to-head F1 statistics tool.** Pick any two drivers from 70+ years of Formula 1 history, and instantly see who comes out on top — career stats, race-by-race breakdowns, championship timelines, constructor stints, and more. Then flip to the **"What If?"** page to rewrite history by recalculating every career under any scoring system ever used.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What You Can Do

### Driver Comparer (`/`)
- **Side-by-side stat cards** — wins, podiums, poles, DNF rate, avg finish, points, and 15 total metrics with spring-animated counters
- **Head-to-Head analysis** — compare performance only in races where both drivers competed, with direct finish comparisons
- **Career Progression charts** — line chart and interactive pie chart views for points, wins, and podiums across seasons
- **Race-by-Race Breakdown** — every shared race listed with position badges, filterable by season
- **Championship Timeline** — visual timeline mapping trophy-winning years for both drivers on a shared axis
- **Constructor History** — team stints broken into separate periods with per-stint stats and year-correct car liveries
- **Season Breakdown** — expandable per-season tables with mini bar charts for wins and points

### What If? Points Normalizer (`/what-if`)
- **7 historical scoring presets** — from the 1950s 8-6-4-3-2 system through the modern 25-point era to 2025-present (no fastest lap bonus)
- **Custom scoring editor** — define your own points-per-position, fastest lap bonus, and top-N requirement
- **Single driver or two-driver mode** — recalculate one driver's career, or compare how a scoring change affects two drivers differently
- **Season picker** — drill into any individual championship year to see close title fights under alternate rules
- **"Who benefits more?"** analysis — automatic detection of which driver gains the most from a scoring system change
- **Actual vs Recalculated charts** — solid vs dashed line overlays showing the scoring delta per season

### Shared Features
- **Shareable URLs** — every driver selection, scoring system, and season filter is synced to the URL for instant sharing
- **Live Mode** — toggle real-time data fetching with smart cache-busting (only current season, historical data stays cached)
- **Dark / Light theme** — persistent toggle, full support across every component
- **History & Favorites** — recent comparisons panel with star-to-save functionality
- **Keyboard shortcuts** — press `?` for the full shortcut reference
- **Print-ready layouts** — `Ctrl+P` produces a clean printable comparison
- **Mobile-first responsive design** — touch-friendly targets, stacked layouts, and overflow handling on every screen

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v7 |
| Styling | Tailwind CSS (dark mode, glassmorphism) |
| Charts | Recharts (line, bar, pie) |
| Animation | Framer Motion (spring counters, staggered lists, page transitions) |
| Data | Ergast F1 API + OpenF1 API |
| Caching | localStorage with 5-minute TTL + smart live-mode busting |

---

## Quick Start

```bash
git clone https://github.com/siddharthgumballi/f1-driver-comparer.git
cd f1-driver-comparer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start comparing.

### Production Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

---

## Project Structure

```
src/
  pages/            WhatIfPage
  components/
    layout/         Header, Layout, EmptyState
    ui/             GlassCard, AnimatedCounter, StatBar, F1CarLoader, Toggle, ...
    driver/         DriverCard, DriverAvatar, SeasonBreakdown
    comparison/     HeadToHead, RaceByRaceBreakdown, ChampionshipTimeline, ConstructorHistory
    charts/         CareerProgressionChart
    what-if/        ScoringSystemSelector, DriverSummaryCards, SeasonComparisonChart,
                    TwoDriverComparison, TopDifferencesTable, SeasonPicker
  hooks/            useDarkMode, usePointsNormalizer, useUrlState, useComparisonHistory, ...
  lib/              ergast (API + caching), pointsSystems (scoring engine), teamColors, ...
```

---

## Data Sources

- **[Ergast F1 API](http://ergast.com/mrd/)** — race results, driver standings, constructor data (1950-present)
- **[OpenF1 API](https://openf1.org/)** — live session data overlay for current season
- **F1 Media CDN** — driver portraits and team car liveries (with Wikipedia and initials fallbacks)

---

## License

MIT — see [LICENSE](LICENSE).
