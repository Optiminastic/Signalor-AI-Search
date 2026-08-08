# Catalyst dashboard — component & pattern map

Read this **before** building or changing any `/dashboard` (catalyst) UI. It is the
reuse index: "I need X → use Y (here)." Reusing these keeps every screen visually
consistent and cuts PR churn. Pair it with `DESIGN.md` Part B (the rules) — this
file is the inventory, DESIGN.md is the law.

Golden rule: **search this list first. Do not hand-roll a card, button, meter,
chart, or dropdown that already exists here.**

---

## 1. Layout & shell

| Need                                        | Use                                                    | Path                                             |
| ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Card / panel shell                          | `Card` (+ `CardHead` for title + optional action link) | `components/Card.tsx`, `components/CardHead.tsx` |
| Visibility-page card head                   | `VisCardHead`                                          | `components/visibility/VisCardHead.tsx`          |
| Page frame (sidebar + scroll + agent panel) | `CatalystShell`                                        | `components/CatalystShell.tsx`                   |
| Overview grid + toolbar row                 | `DashboardContent`, `overview/DashboardGreeting`       | `components/DashboardContent.tsx`                |
| Loading skeleton                            | `DashboardSkeleton`                                    | `components/DashboardSkeleton.tsx`               |
| Empty / error / loading wrapper             | `DataState`                                            | `components/DataState.tsx`                       |

Overview grid convention: 3 equal columns (`grid sm:grid-cols-2 xl:grid-cols-3`,
`items-start`), each column a `flex flex-col gap-2` that stacks its own cards
(masonry). Full-width table/map cards go in a `flex flex-col` below the columns.

---

## 2. Metric & value display

| Need                           | Use                                        | Path                                           |
| ------------------------------ | ------------------------------------------ | ---------------------------------------------- |
| Big number + delta pill        | `Metric` (wraps `Badge`)                   | `components/Metric.tsx`                        |
| Up/down delta pill (green/red) | `Badge`, `Delta`, `visibility/MetricDelta` | `components/Badge.tsx`, `components/Delta.tsx` |
| Animated count-up number       | `AnimatedScore` (rAF + easeOutCubic)       | `components/cards/AnimatedScore.tsx`           |

---

## 3. Charts (all hand-rolled inline SVG — there is NO chart library; do not add one)

| Need                                | Use                                                                  | Path                                                   |
| ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| White surface a graph sits on       | `ChartFrame` (already baked into every chart below except Sparkline) | `components/ChartFrame.tsx`                            |
| Sparkline (mini area+line)          | `Sparkline`                                                          | `components/visibility/Sparkline.tsx`                  |
| Hero trend line (red→blue gradient) | `GeoTrendLine`                                                       | `components/cards/GeoTrendLine.tsx`                    |
| Simple line / area                  | `LineChart`, `AreaChart`                                             | `components/LineChart.tsx`, `components/AreaChart.tsx` |
| Multi-series line (grid + axes)     | `MultiLineChart`                                                     | `components/insights/MultiLineChart.tsx`               |
| Donut / progress ring (270° gauge)  | `GaugeRing`                                                          | `components/visibility/GaugeRing.tsx`                  |
| Full-circle segmented donut         | pattern in `VisibilityBreakdownCard` (`buildSegments` + `DonutArcs`) | `components/cards/VisibilityBreakdownCard.tsx`         |
| Vertical bars per engine (w/ logos) | `MiniBars`                                                           | `components/visibility/MiniBars.tsx`                   |
| Two-series grouped columns          | `GroupedColumns`                                                     | `components/GroupedColumns.tsx`                        |
| Radar / spider                      | `Radar`                                                              | `components/Radar.tsx`                                 |
| Heatmap grid                        | `Heatmap`                                                            | `components/Heatmap.tsx`                               |

For gradient fills/strokes copy the `<linearGradient>` pattern in `AreaChart` /
`GeoTrendLine`; use `vectorEffect="non-scaling-stroke"` + `preserveAspectRatio="none"`.

---

## 4. Progress / score / percentage bars — ALWAYS the segmented tick meter

| Need                       | Use        | Path                                 |
| -------------------------- | ---------- | ------------------------------------ |
| Any progress/score/% bar   | `TickBar`  | `components/brands/BrandBits.tsx`    |
| Segmented fill meter (alt) | `BarMeter` | `components/visibility/BarMeter.tsx` |

**Never** use a solid/rounded `rounded-full` fill bar for a metric — DESIGN.md
mandates the tick meter. Filled ticks `bg-[#e04a3d]`, empty `bg-[var(--cat-hover)]`.

---

## 5. Controls, buttons, dropdowns

| Need                                      | Use                                                                            | Path                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Brand CTA (primary button)                | `PrimaryButton` (pass `icon`, `iconOnly`)                                      | `components/PrimaryButton.tsx`            |
| Secondary chip / icon tile / search field | `control-styles` (`CONTROL_CHIP`, `ICON_TILE`, `CONTROL_RING`, `SEARCH_FIELD`) | `components/control-styles.ts`            |
| Dropdown / select menu                    | copy the `Dropdown` + `MenuItem` + `SelectChip` pattern                        | `components/OverviewActions.tsx`          |
| Segmented tab control (1D/1W/…)           | `RangeTabs`                                                                    | `components/RangeTabs.tsx`                |
| Engine / company logo tile                | `EngineLogo`                                                                   | `components/EngineLogo.tsx`               |
| Tooltip (accessible)                      | `Tooltip` (radix)                                                              | `features/site/components/ui/tooltip.tsx` |

Note: `@radix-ui/react-select` and `@base-ui/react` are effectively unused — menus
are hand-rolled. Copy the `OverviewActions` dropdown; don't reach for radix select.
All controls are **34px tall** so toolbars line up.

---

## 6. Tokens, colors, sizes (never hardcode)

- **Surface tokens** (light+dark aware CSS vars, in `app/globals.css`): `--cat-canvas`,
  `--cat-content`, `--cat-card`, `--cat-track`, `--cat-hover`, `--cat-border`,
  `--cat-grid`, `--cat-ink` / `--cat-ink-2` / `--cat-ink-3`. Use `bg-[var(--cat-card)]`,
  `text-[var(--cat-ink-2)]`, etc. — **never** raw `bg-white` / `text-gray-500`.
- **Brand palette constants** (`features/catalyst/constants.ts`): `BRAND` (#e04a3d),
  `BRAND_STRONG`, `BRAND_SOFT`, `GREEN`, `YELLOW`, `BLUE`, `PURPLE`, `POS`/`POS_BG`,
  `NEG`/`NEG_BG`. SVG strokes/fills import these (a stroke needs a concrete color).
- **Sizes**: `LOGO_SIZE` (constants) for logo tiles — don't inline pixel sizes for
  shared elements; add a constant.
- **Icons**: `lucide-react` (`import { Plus } from 'lucide-react'`), rendered at
  size 13–16, `strokeWidth` ~1.8–2.4.

---

## 7. Motion

- Staggered card entrance: add class `cat-stagger` to a grid (children animate in).
  Single element: `cat-rise`. Both respect `prefers-reduced-motion`.
- Count-up numbers: `AnimatedScore` (dashboard) — not `NumberFlow` (marketing only).
- No `framer-motion` in the dashboard; CSS keyframes + rAF only.

---

## 8. Data hooks (TanStack Query — never `fetch()` in a component)

All keyed on the run **slug** from `useActiveProject().slug`; all read
`@/lib/api/analyzer` (or sibling api modules). URL/paths via `useBrandPath()`.

| Data                                                      | Hook                                              |
| --------------------------------------------------------- | ------------------------------------------------- |
| Active brand + run slug + email                           | `useActiveProject`                                |
| Overview rollup (mention/rec/cite %, SoV, trend, engines) | `useOverview`                                     |
| GEO score + trend for a range                             | `useGeoScore`                                     |
| Citation coverage (brand/competitor/other)                | `useCitations`                                    |
| Top AI sources (mentions/sentiment/spark)                 | `useTopSources`                                   |
| Engagement opportunities (backlinks)                      | `useOpportunities`                                |
| GEO pillars (score breakdown)                             | `usePillars` / `usePillarBreakdown`               |
| Competitor visibility matrix                              | `useCompetitorMatrix` / `useCompetitors`          |
| Tracked prompts                                           | `usePrompts`                                      |
| Growth Agent plan / AI insights                           | `useAgentPlan` / `useAgentInsights`               |
| GA4 world presence                                        | `useWorldPresence`                                |
| Re-analyze + cooldown                                     | `useNewAnalysis`, `useAnalysisCooldown`           |
| Shared filters (date range + engine)                      | `overview/OverviewFilters` → `useOverviewFilters` |
| Is the dashboard ready to render                          | `useDashboardReady`                               |

Building a card? Add a thin hook in `hooks/` that adapts an api call to a typed
view model (see `useTopSources.ts` / `useOpportunities.ts` as the template), then a
component in `components/cards/`.

---

## 9. Conventions (enforced by `pnpm lint` + `pnpm type-check`)

- One component per file; **named exports** (default only for `app/` pages/layouts).
- Prop `interface` declared above the component; explicit return types; no `any`.
- `'use client'` only on leaf components that need state/effects/handlers.
- Functions ≤ 40 lines / complexity ≤ 10 → extract subcomponents (see how the cards
  split into `CoverageSummary`, `DonutArcs`, `SourcesTable`, etc.).
- Run `pnpm lint --max-warnings 0`, `pnpm type-check`, and `pnpm build` before done.
- **Look at the rendered result** — lint/tsc can't see "it looks wrong."
