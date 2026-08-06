# Signalor Design System

> **Read this before creating or editing ANY UI.**
> Signalor has two surfaces with deliberately different looks but one shared brand DNA:
>
> - **Part A - Marketing site:** everything rendered inside `MarketingShell` or `app/page.tsx` - the home page, feature pages, content pages, blog, tools, and the nav mega menu.
> - **Part B - Catalyst dashboard:** the `/catalyst` (and `/dashboard`) feature module under `features/catalyst/`.
>
> **Section 0 (Shared foundations)** states the rules both surfaces obey - read it first, then the Part for the surface you are touching.
> Section references like "section 6" mean the section 6 of the current Part unless prefixed with "Part A" / "Part B".
> This file is the concrete, repo-specific source of truth and wins on any conflict.

The goal of this file: any screen built from it must look hand-composed and identical in language to the existing screens.
If a rule here conflicts with what a screen currently does, the screen is drift - fix it toward this file.

---

## 0. Shared foundations (both surfaces)

These hold for the marketing site and the dashboard alike. The Parts below add surface-specific detail on top; they never contradict this section.

### 0.1 One accent, many neutrals

- A single warm brand red - `--primary: #e04a3d` - carries every CTA, active state, and eyebrow highlight on both surfaces. Everything else is grayscale.
- Status colors (`success` green, `warning` amber, `info` blue, `feature-violet`) and chart data hues (blue / purple / yellow / green) appear **only where they carry meaning** - badges, deltas, live dots, chart series and their legends. Never in chrome (nav, buttons, borders).
- Never introduce a new hex in new code. Use the Tailwind token classes, not raw hex. Never use pure `#000` text.

### 0.2 Typography

- **Family: Mona Sans** (GitHub's variable font, weights 200-900), loaded via `next/font/local` from `app/fonts/MonaSans.woff2` and wired app-wide as `--font-inter` -> `font-sans`. No serif, no second font, no italics.
- Numbers are always `tabular-nums`; big stats are bold (marketing `text-4xl font-semibold`, dashboard `26px / 700`).
- **Rule:** never bold a label; never leave a value un-bolded. Contrast carries the hierarchy.

### 0.3 Borders and elevation

- Hairline borders do the separating; shadows only whisper. Depth comes from a border plus a single soft float, never from stacked per-card shadows.
- Forbidden everywhere: `shadow-lg` / `shadow-xl` / `shadow-2xl`, colored shadows, heavy black separation. Shadows top out at `shadow-md shadow-black/5` on a genuinely floating panel.

### 0.4 Score / progress meters

- Any progress, score, percentage, or visibility indicator is a **segmented tick / bar meter**: a row of small vertical bars filled up to the value. Filled = `bg-primary`; empty = the surface's muted track. Never a solid rounded fill bar.
- Marketing uses `TickBar` (ticks `h-3.5 w-[3px] rounded-[1px]`, 2px gap). The dashboard uses `BarMeter` (44 thin bars, hue via `scoreColor`). A circular gauge (`GaugeRing`) is allowed **only** on the dashboard Competitors page; never on marketing pages.

### 0.5 Motion baseline

- Everything respects `prefers-reduced-motion: reduce` and disables its animation there.
- Marketing pages have **no entrance animations**. The dashboard uses a single **rise + fade** on mount (`cat-rise`) and nothing else. No ambient loops beyond the two sanctioned marketing ones (`--animate-float` hero bubbles, `--animate-blink` chat caret), no per-number count-ups, no scroll-triggered motion.

### 0.6 Icons

- Marketing sections use the in-house icon set (`@/features/site/components/icons`, 24px viewBox, `strokeWidth 1.75-2`, one filled signal-dot accent per glyph); the nav mega menu uses `@tabler/icons-react` (`stroke 1.75`). The dashboard uses `lucide-react` (`strokeWidth 1.8` for nav/UI, `2.2-2.4` for delta arrows).
- Never mix a third icon library into a given surface. Never use emoji as icons anywhere.

### 0.7 The universal anti-AI-generated tells (never ship)

- Purple/indigo/teal gradients, glassmorphism, glow blobs, mesh backgrounds.
- `rounded-3xl` cards, `shadow-2xl`, colored shadows.
- Centered 3-col icon+title+text feature grids with big pastel icon circles.
- Emoji in UI, or icon libraries other than the sanctioned ones per surface.
- New hex colors, pure black text, `#fff`-on-`#fff` separated only by heavy shadow.
- Buzzword copy: seamless, unlock, empower, supercharge, revolutionize, "We're excited".
- Default-shadcn look: untouched `Card`/`Badge` styling, `p-6 space-y-4` rhythm everywhere.
- Abstract illustration SVGs or stock 3D renders - illustrations are mock product UI.

---

---

# Part A - Marketing site

Scope: everything rendered inside `MarketingShell` or `app/page.tsx`.
The goal: any page built from this Part must look hand-composed and identical in language to the existing pages.

## A1. How to use this Part (process, not vibes)

1. Identify the page type in section 6 and open its named reference page in the repo.
2. Copy the reference page's skeleton (section order, frame, dividers) exactly.
3. Build sections only from the shared components (section 4) and class recipes (section 5).
4. Never invent a new card, button, eyebrow, or shadow recipe - if a recipe is missing here, extend an existing one and add it to this file.
5. Run the smell test in section 9 before finishing.

Never compose from `features/landing/components/Hero.tsx`, `Footer.tsx`, `FeaturesGrid.tsx`, `LandingPage.tsx`, `Testimonials.tsx` - these are pre-redesign leftovers.
Live components from that folder are only: `MarketingShell`, `MarketingContent`, `LandingNav`, `LandingNavMenu`, `MegaPanels`, `FeaturedGraph`.
Ignore `features/site/styles/design-system.css` (dead file, indigo palette, imported nowhere).

## A2. The two section languages

The marketing site deliberately has two looks.
Every section you build must commit to one of them - mixing them in one section is the fastest way to look AI-generated.

### A. "Rail" (home page + global chrome)

- Content sits inside a `mx-auto max-w-8xl border-x border-border` rail, so vertical hairlines run the full page (the landing rail is `max-w-8xl` ~ 1440px, matching the nav; sub-pages keep `max-w-6xl`).
- Cards are soft: `rounded-xl bg-card ring-1 ring-border shadow-sm shadow-black/5` (use `HOME_CARD` from `features/site/components/landing/home-styles.ts`).
- Decorations: `GridCornerHandles` / `GridHandle` dots at rail intersections (`home-grid.tsx`).
- Used by: `/` sections, `HomeCta`, `HomeFooter`.

### B. "Sheet" (feature, blog, tools pages)

- Full-bleed sections on `max-w-7xl`, divided by `ScreenHR` (full-viewport `border-t border-black/6` with 5px diamonds at the rail crossings, from `features/site/components/ui/intersection-diamonds.tsx`).
- Cards are square: `rounded-none border border-black/8 bg-white shadow-xs`.
- Grid cells divide with `divide-x divide-y divide-black/6`, no gaps.
- Used by: `/ai-visibility`, `/prompt-tracking`, `/explorer`, `/blog`, `/tools`, `/integration`.

Rule: a new PAGE picks A or B by its page type (section 6) and uses it for every section on that page.

## A3. Tokens (the only palette)

All from `app/globals.css`. Use the Tailwind token classes, never raw hex, in new code. (See also shared §0.1.)

| Role                    | Token / class                                                                                      | Value             |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| Brand (the ONLY accent) | `text-primary` / `bg-primary`                                                                      | `#e04a3d`         |
| Ink (headings)          | `text-foreground`                                                                                  | `#171717`         |
| Body / muted            | `text-muted-foreground`                                                                            | `#737373`         |
| Page canvas             | `bg-[#fafafa]` (set once by `MarketingShell`)                                                      | `#fafafa`         |
| Card surface            | `bg-card` / `bg-white`                                                                             | `#ffffff`         |
| Tinted panel            | `bg-muted`                                                                                         | `#f5f5f5`         |
| Hairline                | `border-border` (A) or `border-black/6` `/8` `/10` (B)                                             | ~8% black         |
| Status only             | `text-success #047857`, `text-warning #b45309`, `text-info #2563eb`, `text-feature-violet #6d28d9` | data meaning only |

- One accent: brand red carries every CTA, active state, and eyebrow highlight. Status colors appear only where they mean something (badges, category tones, live dots).
- Never introduce a new hex. Never use pure `#000` text or heavy `shadow-lg/xl` blacks.
- Shadows are whispers: `shadow-xs`, `shadow-sm shadow-black/5`, at most `shadow-md shadow-black/5` on floating panels.

### Type scale

| Slot              | Classes                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Hero h1           | `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight` (Rail) or `font-bold leading-[1.08]` (Sheet) |
| Section h2        | `text-3xl sm:text-4xl font-semibold tracking-tight text-foreground`                                          |
| Card title        | `text-[15px]` or `text-[14px]` `font-semibold` / `font-medium text-foreground`                               |
| Body              | `text-base leading-relaxed text-muted-foreground`                                                            |
| Small body / desc | `text-[13px]` or `text-[14px]` `text-muted-foreground`                                                       |
| Eyebrow           | see recipes below - 11-12px uppercase tracked                                                                |
| Numbers           | always `tabular-nums`; big stats `text-4xl font-semibold`                                                    |

Font is Mona Sans app-wide via `font-sans` (shared §0.2). No serif, no second font, no italics.

### Icons

- Marketing sections use the in-house icon set: `@/features/site/components/icons` (24px viewBox, `strokeWidth 1.75-2`, one filled signal-dot accent per glyph). Prefer it - it is a brand signature.
- The nav mega menu uses `@tabler/icons-react` (`stroke={1.75}`) - keep that surface consistent with itself.
- Never mix a third icon library into marketing pages. Never use emoji as icons.

## A4. Shared components (reuse before you build)

| Component                                                                        | File                                                         | Job                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `MarketingShell`                                                                 | `features/landing/components/MarketingShell.tsx`             | Page wrapper: canvas + `LandingNav` + children + `HomeCta` + `HomeFooter` |
| `LandingNav` / `LandingNavMenu` / `MegaPanels`                                   | `features/landing/components/`                               | Header + mega menu (section 7)                                            |
| `MarketingContent`                                                               | `features/landing/components/MarketingContent.tsx`           | Content-stub page body (eyebrow/title/subtitle/cta/sections)              |
| `HomeSectionHeader`                                                              | `features/site/components/landing/home-section-header.tsx`   | Canonical Rail section header (eyebrow + h2 + desc)                       |
| `HomeCta`                                                                        | `features/site/components/landing/home-cta.tsx`              | Pre-footer CTA band (already in shell)                                    |
| `HomeFooter`                                                                     | `features/site/components/landing/home-footer.tsx`           | Footer (already in shell)                                                 |
| `LandingFaq`                                                                     | `features/site/components/landing/landing-faq.tsx`           | FAQ accordion for Sheet pages                                             |
| `RelatedLinks`                                                                   | `features/site/components/seo/related-links.tsx`             | Internal-link cluster, required on feature pages                          |
| `ScreenHR`, `CornerDiamonds`                                                     | `features/site/components/ui/intersection-diamonds.tsx`      | Sheet section dividers                                                    |
| `GridCornerHandles`                                                              | `features/site/components/landing/home-grid.tsx`             | Rail intersection dots                                                    |
| `Button`                                                                         | `features/site/components/ui/button.tsx`                     | Form/base button primitive                                                |
| `PromptTrackingHero` / `PromptTrackingFeaturesGrid` / `PromptTrackingWhySection` | `features/site/components/landing/`                          | The reusable, content-driven feature-page sections (themeable)            |
| `JsonLd` helpers                                                                 | existing usage in `app/page.tsx`, `app/integration/page.tsx` | SEO structured data                                                       |

## A5. Class recipes (copy exactly)

### Primary CTA (the only filled button)

Use `LANDING_PRIMARY_CTA_CLASS` from `features/site/components/landing/constants.ts`:

```
auth-cta-btn inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-semibold text-white shadow-sm transition-all motion-safe:hover:-translate-y-px hover:text-white
```

Always brand red. The dark `bg-foreground text-background` CTA on `/creators-program` is drift - do not copy it.

### Secondary button

```
inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-card px-5 text-sm font-semibold text-foreground ring-1 ring-border shadow-sm shadow-black/5 transition-all hover:bg-muted/60
```

### Eyebrows (two sanctioned variants)

- Rail: `text-[12px] font-semibold uppercase tracking-[0.18em] text-primary` - plain text, e.g. `How it works`.
- Sheet: `text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground` - rendered bracketed, e.g. `[ free tools ]`.

No third variant. `MarketingContent`'s red hex eyebrow counts as the Rail variant and should migrate to `text-primary`.

### Headline accent

One accented word per hero, done with a dashed underline, never a gradient:

```
underline decoration-primary/60 decoration-dashed decoration-2 underline-offset-4
```

(Sheet pages may theme the decoration color via their section theme, e.g. orange/blue/violet on the feature pages.)

### Cards

- Rail card: `HOME_CARD` = `rounded-xl bg-card ring-1 ring-border shadow-sm shadow-black/5`; padded `p-4` or `p-5`.
- Rail frame (screenshot/mock wrapper): `HOME_FRAME` = `rounded-2xl bg-card/75 p-1.5 ring-1 ring-border shadow-lg shadow-black/5 backdrop-blur-[2px]`.
- Rail well (inset): `HOME_WELL` = `rounded-xl bg-muted/50 p-4 ring-1 ring-border/50`.
- Sheet card: `rounded-none border border-black/8 bg-white p-4 shadow-xs`; hover `hover:-translate-y-0.5` only when the card is a link.
- Link-cluster card (`RelatedLinks`): `rounded-xl border border-black/8 bg-white p-5 hover:-translate-y-0.5 hover:border-black/12 hover:shadow-md`.

### Badges / pills

- Status: `rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-success` (swap token per meaning).
- "New"/"Free" in nav: `rounded-full bg-[#e9f9ef] px-1.5 py-px text-[10px] font-semibold text-[#12a150]`.
- Category tones on blog cards: map category -> one status token, keep the map stable.

### Score / progress

Any progress or score meter is the segmented tick bar (shared §0.4): ticks `h-3.5 w-[3px] rounded-[1px]`, filled `bg-primary`, empty `bg-neutral-200`, 2px gap.
Never a solid rounded fill bar, never a circular gauge on marketing pages.

## A6. Page templates (the structure of every page)

### 6a. Feature page - Sheet

Reference: `app/prompt-tracking/page.tsx` (best), `app/ai-visibility/page.tsx`.
Applies to: `/ai-visibility`, `/prompt-tracking`, `/explorer`, `/integration`, and any future product/feature/solution page.

```
MarketingShell
  sr-only h2 + SEO paragraph block
  JsonLd (FAQ + breadcrumb minimum)
  <FeatureHero>            hero: bracketed eyebrow, h1 with one dashed-underline word,
                           subcopy, primary + secondary CTA, mock-UI cards (real components, dummy data)
  ScreenHR
  <FeaturesGrid theme=X>   divided cells, each: icon chip + title + desc + mock-card preview
  ScreenHR
  <WhySection>             editorial split: copy column + one anchor stat or mock card
  LandingFaq
  RelatedLinks page="/route"
```

- Theme prop picks the accent (orange/blue/emerald/violet) for decoration + previews; chrome stays neutral.
- JsonLd and `RelatedLinks` are mandatory (missing on `/explorer` today - that is drift).
- Illustrations are always mock product UI assembled from Sheet cards with realistic dummy data, never abstract blobs or stock-style SVG scenes.

### 6b. Content page - stub via MarketingContent

Reference: `app/guides/page.tsx` (all ~37 lines).
Applies to: `/guides`, `/videos`, `/docs`, `/for-agencies`, `/for-brands`, `/changelog`, `/community`, `/help`, `/api` while they are stubs.

```
MarketingShell
  MarketingContent({ eyebrow, title, subtitle, cta?, sections: [{ heading, body }] })
```

- Frame is `max-w-4xl px-6 py-16 md:px-10 md:py-24`; h1 `text-4xl font-semibold md:text-5xl`; sections in a 2-col grid.
- Keep copy specific: one concrete claim or number per section body, no "seamless/unlock/empower".

### 6c. Content page - grown into a listing (guides index, videos/walkthroughs, changelog)

When a stub gets real content, it becomes a Sheet listing page.
Reference: `app/blog/page.tsx` (media cards) and `app/tools/page.tsx` (link cells).

```
MarketingShell
  <Hero>            max-w-7xl, bracketed eyebrow, h1 with dashed accent, one-line sub
  ScreenHR
  <Grid>            max-w-7xl grid divide-x divide-y divide-black/6 md:grid-cols-3
                    cells: bg-white p-6 (tools) or media card (blog pattern)
  ScreenHR
  <Stats band / closing section>
```

- Guides index: blog `PostCard` pattern - 16:9 image or mock-card, tone badge, title `text-[15px] font-semibold`, meta row with reading time.
- Videos / walkthroughs: same grid, thumbnail keeps 16:9, a duration pill (`rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white` over the corner), play affordance from the in-house icon set.
- Changelog grown: single `max-w-4xl` column, date `text-[12px] font-mono text-muted-foreground`, entry title semibold, hairline `border-b border-black/6` between entries. No cards.
- Docs grown: do not improvise - propose a docs layout separately before building.

### 6d. Utility page

- Sitemap (`app/site-map/page.tsx`): plain `max-w-5xl` link groups, no cards - keep it.
- Contact/sales (`app/contact-sales/page.tsx`): `max-w-3xl` form, Sheet-square fields (`rounded-none border border-border bg-white px-3 py-2.5 text-sm`), pill toggles, primary submit.

### 6e. Home page

Reference: `app/page.tsx`. Rail system throughout; section order is fixed:
Hero -> LogoCloud -> Features -> FeatureShowcase -> HowItWorks -> Stats -> Testimonials -> Integrations -> Pricing -> Faq -> Cta -> Footer.
New home sections must use `HomeSectionHeader` + `HOME_CARD`/`HOME_WELL` and sit inside the rail.

## A7. Header + mega menu (the nav system)

Files: `LandingNav.tsx` (bar), `LandingNavMenu.tsx` (triggers + morphing viewport), `MegaPanels.tsx` (panel layouts), `nav-data.ts` (all links + icons).

### Structure

- All menu content lives in `nav-data.ts` as typed `MenuSection` / `QuickLink` data with `@tabler/icons-react` icons. To add a link you edit data, not JSX.
- Panels are wide and compact (~200-240px tall): white section cards (`rounded-xl border border-black/6 bg-white p-2`) with an 11px tracked uppercase label, side by side inside a `p-2` panel, plus at most one card-less `QuickList` column and at most one gradient `FeaturedCard`.
- Item row: 40px icon tile (`rounded-lg border border-black/7 bg-[#FAFAFA] shadow-[0_1px_2px_rgba(0,0,0,0.04)]`, icon 18/1.75) + 14px medium label + 13px muted desc, row hover `bg-black/3`.
- Panel widths are fixed per panel (`w-220`, `w-230`, `w-78`) so descriptions never truncate; if you add items, widen the panel.

### Motion (do not change casually)

- Viewport morphs width/height 300ms, opens with `origin-top` scale 0.95 -> 1 + fade 200ms.
- Panels cross-fade with a 200px directional slide, 200ms.
- Tailwind v4 gotcha: `translate-*` / `scale-*` are standalone CSS properties - transitions must name `translate` / `scale` explicitly (`transition-[translate,opacity]`), or the animation silently snaps.

## A8. Motion rules (site-wide)

- Hover: `motion-safe:hover:-translate-y-px` on buttons, `hover:-translate-y-0.5` on link cards. Nothing else moves on hover.
- Ambient: only the existing `--animate-float` (hero logo bubbles) and `--animate-blink` (chat caret). No new ambient loops.
- Entrances: none on marketing pages (the dashboard's `cat-rise` stays in the dashboard).
- Everything respects `prefers-reduced-motion`.

## A9. The anti-AI-generated checklist

Forbidden (instant AI tells - never ship; see shared §0.7 for the universal list):

- Purple/indigo/teal gradients, glassmorphism, glow blobs, mesh backgrounds.
- `rounded-3xl` cards, `shadow-2xl`, colored shadows.
- Centered 3-col icon+title+text feature grids with big pastel icon circles.
- Emoji anywhere in UI, icon libraries other than the two sanctioned ones.
- New hex colors, pure black text, `#fff`-on-`#fff` with heavy shadow separation.
- Buzzword copy: seamless, unlock, empower, supercharge, revolutionize, "We're excited".
- Default-shadcn look: untouched `Card`/`Badge` styling, `p-6 space-y-4` rhythm everywhere.
- Abstract illustration SVGs or stock 3D renders - illustrations are mock product UI.

Required (what makes it look like this site):

- Hairline borders do the separating; shadows only whisper.
- One brand-red accent per screen region; status colors only with meaning.
- Eyebrow + tight tracking + one dashed-underline word in the headline.
- Sheet pages: square cards, divided grids, ScreenHR diamonds. Rail pages: border-x rails, soft ring cards, grid handles.
- Real, specific copy with a number ("Track 50 prompts free", "Score in ~60 seconds").
- Dense type: 13-15px body in cards, `tabular-nums` on every figure.
- Reused skeletons: a new page is a sibling page's skeleton with new content.

## A10. Known drift (fix toward this file when touching these)

1. `/explorer`: add `RelatedLinks` + JsonLd; rename `ExplorerPage` export sensibly.
2. `/creators-program` `PrimaryCta` and `/contact-sales` success button: dark fill -> brand `LANDING_PRIMARY_CTA_CLASS`.
3. `MarketingContent`, `LandingNav`: hex literals (`#171717`, `#52525b`, `#e04a3d`) -> `text-foreground` / `text-muted-foreground` / `text-primary`.
4. Secondary-button recipe is copy-pasted in `home-cta`, `integration-hero`, `home-pricing` - extract to `constants.ts` next time one changes.
5. Two FAQ components (`HomeFaq`, `LandingFaq`) - do not create a third; converge on `LandingFaq` for all non-home pages.
6. Eyebrow variant #3 in `MarketingContent` (13px, tracking-wider) -> Rail variant.
7. Delete `features/site/styles/design-system.css` and the pre-redesign `features/landing/components` leftovers when convenient.

---

---

# Part B - Catalyst dashboard

This documents the design language behind the **Catalyst - Marketing & Sales** dashboard, routed at `/catalyst` and implemented as a feature module under `features/catalyst/`.
It is a self-contained, pixel-faithful replica built with Tailwind v4 + `lucide-react`, using **dummy/static data**. This Part is the source of truth for the visual rules so the layout can be extended without drifting.

The module is decomposed to satisfy the repo's ESLint rules (one component per file, <=40 lines per function, <=350 lines per file, explicit return types, named exports, no `any`).
All colors and dummy data live in `features/catalyst/constants.ts`; every card is a leaf server component.

## B1. Design philosophy

- **Calm, card-based analytics.** Everything lives on two floating rounded panels (sidebar + main) over a soft neutral canvas. Each metric is its own bordered card - no heavy shadows between cards, only a hairline border.
- **One accent, many neutrals.** A single warm red (the app's `--primary` brand) carries brand + primary data. The rest of the UI is grayscale. Secondary data colors (blue / purple / yellow / green) appear _only_ inside charts, never in chrome.
- **Data-ink first.** Charts are borderless, axis-light, and gridless where possible. The number is the hero (26px bold); the chart is supporting evidence.
- **Quiet chrome, loud numbers.** Labels are muted gray; values are near-black and bold.

## B2. Color tokens

Defined once as named constants in `features/catalyst/constants.ts` (mirror of the standalone token block). **The brand color is pulled from the app's auth theme** (sign-in / sign-up) - `--primary: #e04a3d` with `.auth-cta-btn` hover `#c53f34` / active `#b9382d` and `bg-primary/10` tints - so the dashboard reads as the same Signalor brand, not a one-off orange. The "New Products" CTA literally reuses the global `.auth-cta-btn` class.

| Token          | Hex                      | Usage                                                     |
| -------------- | ------------------------ | --------------------------------------------------------- |
| `BRAND`        | `#e04a3d` (`--primary`)  | Primary button, active nav, primary chart series, Organic |
| `BRAND_STRONG` | `#c53f34`                | Hover / active-nav text                                   |
| `BRAND_SOFT`   | `rgba(224,74,61,.10)`    | Active nav background (= `bg-primary/10`)                 |
| Positive       | `#2FBE7E` / bg `#E7F7EF` | Up-deltas, positive badges                                |
| Negative       | `#E5484D` / bg `#FDECEC` | Down-deltas, negative badges                              |
| Data blue      | `#3B9EF6`                | Tablet, Referral, Facebook row                            |
| Data purple    | `#8B5CF6`                | Mobile, Direct, Instagram row                             |
| Data yellow    | `#F6B93B`                | Desktop bar                                               |
| Data green     | `#2FBE7E`                | Radar "Returning visitors" series                         |
| Canvas         | `var(--cat-canvas)`      | Page background behind the two panels                     |
| Surface        | `var(--cat-card)`        | Sidebar + cards (main panel = `var(--cat-content)`)       |
| Ink / -2 / -3  | `var(--cat-ink[-2/-3])`  | Text tiers: value / label / meta                          |
| Border         | `var(--cat-border)`      | Panel + card borders (dividers = `--cat-border-soft`)     |

All neutrals are **theme tokens** that flip in dark mode - see §8b. The brand + data hues above are fixed hex constants (identical in both themes).

**Rule:** the brand warm-red (`--primary`) is the only hue allowed in navigation, buttons and active states. Blue/purple/yellow/green are reserved for data marks and their inline legends.

## B3. Typography

- **Family:** **Mona Sans** (shared §0.2), loaded via `next/font/local` and wired app-wide as `--font-inter` -> `font-sans`. Replaces Inter everywhere.
- **Scale**
  - Metric value - `26px / 700 / tracking-tight`
  - Sub-metric (device %) - `22px / 700`
  - Section title in card - `13px / 500`, `neutral-500`
  - Nav item - `14px / 500`
  - Section header (MAIN, SALES CHANNELS) - `11px / 600 / uppercase / tracking-wider`, `neutral-400`
  - Badges / deltas - `11-12px / 600`
  - Axis ticks - `10px`, `neutral-400`

**Rule:** never bold a label; never leave a value un-bolded. Contrast carries the hierarchy.

## B4. Spacing, radius, elevation

Tuned for a compact, calm feel: **one uniform medium radius, tight padding, minimal gaps, minimal shadow.**

- **Radius - single scale:** everything box-like uses Tailwind `rounded-md` (`--radius-md` = `0.625rem - 2px` ~= **8px**): the two panels, all cards, buttons, chips, segmented-control tracks, the logo tile, the % badges and radar labels. Inner segmented chips step down to `rounded-sm` (~6px) so the nested pill still reads inside its track. Small **data marks** (heatmap cells, legend/split bars, checkboxes, view-toggle buttons) also use `rounded-sm`. Only genuinely circular marks stay round (`rounded-full`): avatars, legend dots, radar vertex dots.
- **Gaps (tight):** `8px` between the two panels **and** between cards; `8px` outer app padding; `10px` above the card grid. One consistent, snug rhythm.
- **Padding:** cards `12px` and sidebar `12px` (`p-3`); main panel `14px` (`p-3.5`).
- **Borders:** every surface is outlined with a `1px var(--cat-border)` border - the two outer panels **and** each card - for crisp definition against the canvas. Internal dividers (topbar underline, sidebar user separator) stay a step lighter at `var(--cat-border-soft)`.
- **Elevation (minimal):** on top of the border, only the two outer panels carry a single soft shadow (`0 1px 2px rgba(16,24,40,.05)`). Cards are **border-only, no shadow**. The primary button inherits `.auth-cta-btn`'s inset highlight only.

**Rule:** one radius, one gap value, one border weight - depth comes from the panel border+float, not per-card shadows. Keep cards flat and spacing tight and even.

## B5. Layout

```
+------------- app (flex, gap 8, full-width w-full) -------------+
| + sidebar 240px +  +-------------- main (flex-1) ------------+ |
| | Signalor logo  |  | topbar (identity . tools . CTA)         | |
| | workspace ^v   |  | -----------------------------------     | |
| | MAIN menu      |  | grid: 3 cols x 2 rows, gap 8            | |
| | SALES CHANNELS |  |   Sales . Visitors . Conversion         | |
| | (spacer)       |  |   Channels . Retention . Weekly         | |
| | theme.settings |  |                                         | |
| | user footer    |  |                                         | |
| +----------------+  +-----------------------------------------+ |
+---------------------------------------------------------------+
```

- **Width:** the app is **full-bleed** (`w-full`, no max cap) so the two panels stretch to fill the viewport; `main` is `flex-1` and each card flexes within the 3-column grid.
- **Scroll model:** the app is a fixed **`h-screen` / `overflow-hidden`** shell. The **sidebar never scrolls** (`flex-none`, footer pinned by a `flex-1` spacer) and the **topbar is pinned** (`shrink-0`). Only the **card grid scrolls** - it is the single `overflow-y-auto` region (`flex-1 min-h-0`) inside the `overflow-hidden` main panel. Never let the page body scroll.
- **Surfaces / gray:** `var(--cat-canvas)` behind everything, the **sidebar on `--cat-card`**, and the **main content panel on `--cat-content`** (a step darker) so the `--cat-card` cards read as raised tiles. The same track/hover tokens carry the segmented controls and the retention info box.
- **Responsive:**
  - Card grid reflows `xl:grid-cols-3` -> `sm:grid-cols-2` -> `grid-cols-1`.
  - **Sidebar** is `hidden lg:flex` - it drops out below `1024px` and the main panel takes the full width.
  - **Topbar** wraps (`flex-wrap`): the actions cluster moves to its own right-aligned row on narrow widths; identity text truncates. The **Filter** chip hides `< md`, the **date** chip hides `< sm`, leaving the icon buttons + CTA.
- **Sidebar footer pinned to bottom** via a `flex-1` spacer between the channel nav and the Settings/Support block.

## B6. Component patterns

### Metric header (every card)

`CardHead` (muted title + right-aligned text action) -> `Metric` (big value + colored Badge).
The action link ("Report" / "Details") is always top-right, `neutral-500`, hover -> `neutral-900`.

### Badge vs Delta

- **Badge** - the headline-number indicator chip: **white, `rounded-md`, `neutral-200` border**, a faint `1px` shadow, a **thin vertical accent bar** (`3px` wide, green up / red down) then the value in **dark `neutral-900` text**. The color lives only in the bar, not the text/background - a calm, tabular look next to the big metric.
- **Delta** - inline arrow + % for row-level changes; **no background**, icon is `ArrowUpRight` (positive) / `ArrowDownRight` (negative) at `strokeWidth 2.4`, colored by sign.

**Rule:** color + direction must always agree with sign. Positive = green (bar up-right), negative = red (bar down-right).

### Segmented control

Neutral-100 track, `3px` padding, active chip = white pill with `shadow-sm` and bold text.
Used for time range (`1D...1Y`) and the radar series toggle.

### Navigation item

- Rest: `neutral-500`, icon `strokeWidth 1.8`.
- Active: `BRAND_SOFT` background, `BRAND_STRONG` text/icon, plus a **3px brand rail** bleeding off the panel's left edge (`left: -14px`) and a trailing chevron.

### List row (sales channels, funnel, table)

`icon . name ... value . delta`, right-aligned numerics, `13px`. Table headers are `11px` `neutral-400`; numeric columns right-aligned.

### Topbar controls (three-tone set)

- **Primary** - solid brand fill, white text (reuses `.auth-cta-btn`); `New Products` CTA only.
- **White chips** - the date + filter selectors and the search/bell icon buttons: **white fill, `neutral-200` border, a soft `shadow-sm`, compact `34px` height**, neutral text with `neutral-500` icons, hover `neutral-50`. Clean and lightly raised - the CTA carries the only color.
- **Ghost** - full-width bordered ("View reports"), hover `neutral-50`.

## B7. Charts (all inline SVG, no chart lib)

| Chart          | Card              | Technique                                                                                                                                                   |
| -------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Line           | Total Sales       | `<polyline>` from a normalized dummy series, brand stroke 2px, no axes                                                                                      |
| Split bars     | Total Visitors    | three flat rounded bars (yellow/blue/purple) + device %                                                                                                     |
| Area           | Conversion Rate   | data-driven from `CONV_SERIES` - two stacked area layers (brand->transparent gradients) + stroke line, aligned to the 6 month ticks                         |
| Stacked bar    | Visitors Channels | flex-weighted segments (`flex:5/4/2`) + dot legend                                                                                                          |
| Heatmap        | User Retention    | 7x12 grid of brand squares, opacity = `1 - col*0.075 - row*0.03` (dense bottom-left cohort fade)                                                            |
| Radar / spider | Weekly Visitors   | 7 axes = days of week (`RADAR_AXES`), grid rings + spokes, two overlaid polygons (New vs Returning), vertex dots filled with `--cat-card`, labels at 1.28xR |

**Chart rules**

- Compute geometry from data in code (see `LineChart`, `Radar`) - never hand-place points.
- Gridlines are `#EDEDED`, 1px; ticks are `10px neutral-400`.
- Series fill opacity `0.12`; series stroke `2px` solid.
- Primary series = brand; a second series may use green. No third series color in one chart.

## B7b. Multi-page shell and the Tasks page

The dashboard and Tasks share one frame, `CatalystShell` (fixed `h-screen` sidebar + one scrollable content panel). Each page supplies its own **pinned header + scroll body** as children:

- **Routing:** `/catalyst` -> `DashboardContent`, `/catalyst/tasks` -> `TasksView`. The sidebar `NavItem` is a client `Link` that derives its active state from `usePathname()` (exact match for `/catalyst`, prefix match otherwise); non-active items may show a brand count badge (Tasks = 7). `Sidebar` is `'use client'` because it hands lucide icon components to the client `NavItem`.
- **Tasks toolbar** (pinned) - search field, list/board view toggle, status pills (`To Do / In Progress / Overdue / Completed / All`, active pill = brand-soft with a brand count), neutral `Assignee` / `Priority` dropdowns, and the brand `Create Task` CTA (`.auth-cta-btn`).
- **Stat cards** - 6-up responsive row (`2 -> md:3 -> xl:6`) of white bordered cards: colored icon + label + `...`, big `26px` value. Priority flags are filled (green/amber/red); doc icons stay outline.
- **Task table** - one white card wrapping a horizontally-scrollable `<table>` (`min-w-[920px]`). Columns: Task . Project . Description . Assignee . Due Date . Priority . Progress. Rows group by project; the parent row is bold, children indent `22px`. Cells reuse small parts: `ProjectTag` (colored initial tile), `AssigneeStack` (overlapping ring-2 avatars, `+N` overflow), `PriorityTag` (filled flag + label), and `ProgressCell` - an SVG ring (green = Done, gray = Not Started, brand = `N% Completed`).

## B7c. The Visibility page (`/dashboard/visibility`)

"Brand presence" - how AI engines surface the brand. A **card grid** in a health-app-inspired metric style: header (`icon + title + ...`), a **big number with a small unit** and a `MetricDelta` (up green / down red, `-` when 0%), a mini viz, and a footer/sub-stats. All `cat-stagger`, theme-token driven, light + dark.

- **Signature viz - the `BarMeter`:** 44 thin bars, the first `value%` filled with the metric's hue (`scoreColor`: >=70 green, >=40 amber, else red), the rest on `--cat-track`. Used by the Overall + the three platform cards.
- **Hero row:** `OverallVisibilityCard` (55/100 + BarMeter), `ShareOfVoiceCard` (2% avg SOV + `MiniBars` per engine), `MentionsCard` (2 mentions + `Sparkline` - fixed-height area line with a non-scaling stroke).
- **Platform cards** (`PlatformScoreCard`, reused for Google / Web / Reddit): icon badge + name + green "AI Analysis" pill, big `score/100` + delta, a `scoreColor` BarMeter, then a 3-up sub-stat row (`#1 Brand Rank . 10 Indexed . 8/10 In SERP`, etc.). Reddit reads as an empty/zero state.
- Shared primitives live in `components/visibility/`: `MetricDelta`, `BarMeter`, `Sparkline`, `MiniBars`, `VisCardHead`.

## B7d. The Sitemap page (`/catalyst/sitemap`)

"Sitemap Audit" - crawl + score every URL. Pinned tabs (`Sitemap` / `Agent log . SOON`) + scroll body: the sitemap URL bar (`Re-run audit` CTA), a 4-up **Core Web Vitals** row, then the audit table.

- **Vitals cards:** `IndexedCard` (a completion bar, 36/36) + three `WebVitalCard`s (LCP/FCP/TTFB). Each web vital renders a **threshold bar** (`ThresholdBar` - green->amber->red gradient) with a marker dot at the value; "no data" dims the bar and shows an en-dash. Icons sit in tinted badges; the status caption is tinted (green "Good").
- **The audit table (the showcase):** one horizontally-scrollable table (`min-w-[1160px]`), columns URL . Status . Content . LCP . FCP . TTFB . Server . Resources . Links . AI . severity . Crawled. Rows are built by mapping a `cells[]` array (keeps `AuditRow` small) through reusable cell helpers: `TwoLine` (value + sub), `Dash`, `StatusPill` (green 200), `Ttfb` (colored by latency via `ttfbColor`), `AiCell` (score + amber mini-bar), `Warn`. **Interaction polish:** rows are `group cursor-pointer` - on hover the row tints, the path underlines, and the chevron nudges right.

## B7e. The Competitors page (`/catalyst/competitors`)

"Benchmark rival brands across AI surfaces." Deliberately **not a table** - a responsive **card grid** (`3 -> md:2 -> 1`, `cat-stagger`) reads more premium than rows.

- **`CompetitorCard`:** brand monogram tile + name + clickable domain (brand-red link) + `...`; a reused **`GaugeRing`** for the AI score (colored via `scoreColor`, label via `scoreStatus`); a footer with a `RelationPill` and a dashed **"+ Add tags"** affordance. Cards lift on hover (subtle shadow - these are interactive list items, unlike the flat dashboard metric cards).
- **"My brand"** (Signalor) card is highlighted with `BRAND_SOFT` + a solid brand `My brand` pill; competitors show a `Direct` (amber) / `Indirect` (neutral) relation dropdown pill.
- Header toolbar: search + `All confidence` / `All scores` dropdowns + a square brand `+` CTA.

## B8. Iconography

- Library: **lucide-react**, default `strokeWidth 1.8` for nav / UI, `2.2-2.4` for delta arrows.
- Sizes: nav `18`, inline row `16`, delta `12`, topbar actions `19`.
- Brand logo is a hand-drawn 4-point sparkle on a conic-gradient brand-red tile.

## B8b. Theming (light + dark)

Dark mode is **self-contained to `/catalyst`** - it never touches global/root styles, so other routes are unaffected.

- **Mechanism:** every surface reads a CSS variable (`bg-[var(--cat-card)]`, `text-[var(--cat-ink)]`, `border-[var(--cat-border)]`, chart grid `var(--cat-grid)`, canvas `var(--cat-canvas)`, ...). The tokens are defined light on `:root` and overridden inside a `.dark` wrapper in `app/globals.css`. Flipping one class recolors the whole feature - no `dark:` utilities per element.
- **Surface tokens:** `--cat-canvas` (outer) . `--cat-content` (main panel) . `--cat-card` (sidebar, cards, chips) . `--cat-track` (segmented tracks) . `--cat-hover` . `--cat-border` / `--cat-border-soft` . `--cat-grid` (chart gridlines) . `--cat-ink` / `--cat-ink-2` / `--cat-ink-3` (text tiers). Layering (light->dark): canvas < content < card so cards float on both themes.
- **What stays fixed:** the brand red and the data hues (green/blue/purple/yellow) are identical in both modes - they read on light and dark alike.
- **Provider:** `CatalystThemeProvider` (client, in `app/catalyst/layout.tsx`) holds the boolean + `localStorage('catalyst-theme')`, and renders a `.dark` wrapper. It starts light on the server / first client render (hydration-safe) then syncs the saved preference on mount. `ThemeToggle` in the sidebar footer flips it (sun/moon).

## B8c. Motion

Intentionally minimal - a single **rise + fade** on mount so content settles in on load / refresh / route change, then never moves again.

- One keyframe `cat-rise` (opacity 0->1, `translateY(8px)->0`, `0.42s`, ease-out). Two utilities: `.cat-rise` for a single element and `.cat-stagger` which animates its direct children with a `+0.05s` cascade (via `nth-child`).
- Applied to: the topbar / tasks toolbar (`.cat-rise`), the dashboard card grid and the tasks stat row (`.cat-stagger`), and the tasks table (`.cat-rise`). Metrics ride in with their card.
- **Respects `prefers-reduced-motion: reduce`** - the animation is disabled entirely.
- No hover/scroll animation and no per-number count-ups; motion is an entrance only, never ambient.

### Stacking-context gotcha (read before adding any dropdown or popover)

Both utilities use `animation: cat-rise ... both`. `animation-fill-mode: both` keeps the final keyframe applied, so the element permanently computes `transform: translateY(0)` - a transform that is not `none`, which means **every `.cat-rise` element and every direct child of a `.cat-stagger` container is its own stacking context, forever, not just while animating.**

Consequences when you put a dropdown, popover or menu inside one:

- Its `z-50` is scoped to that element's context, so it cannot escape above later siblings. Later siblings in DOM order (the cards) paint on top of it regardless of how high you push the child's z-index.
- The fix is to raise the **animated ancestor**, not the menu: give it `relative z-30` (or similar). Raising the menu itself does nothing.
- Keep that value under the top bar's `z-40` so overlays never cover app chrome.

Known instances already fixed this way: the task-detail header (`relative z-20`) and the Overview greeting row that hosts `OverviewActions` (`relative z-30`).

## B9. Extending this dashboard

1. **New card** -> wrap in `<Card>`, lead with `<CardHead>` + `<Metric>`, keep it flat/bordered.
2. **New chart** -> inline SVG, derive points from data, reuse the gridline/tick tokens above.
3. **New status color** -> only if it is _data_; chrome stays brand + neutral.
4. **Wire real data** -> replace the dummy `const` arrays in `features/catalyst/constants.ts`; the render layer already maps over them, so shape-compatible data drops in without JSX changes.
5. Keep the **26px bold value + muted label** hierarchy on every metric.

## B10. File map

```
app/catalyst/layout.tsx                     # CatalystThemeProvider (dark-mode wrapper)
app/catalyst/page.tsx                       # thin route -> <CatalystDashboard/>
app/catalyst/tasks/page.tsx                 # thin route -> shell + <TasksView/>
app/fonts/MonaSans.woff2                    # global sans font (next/font/local)
features/catalyst/
  constants.ts / tasks-data.ts              # tokens + typed dummy data (single source)
  index.ts                                  # public API (exports CatalystDashboard)
  components/
    CatalystShell.tsx                       # shared frame: sidebar + scroll panel
    CatalystDashboard.tsx / DashboardContent.tsx
    CatalystThemeProvider.tsx / ThemeToggle.tsx                      # dark mode
    Sidebar.tsx                             # SidebarLogo (Signalor) -> WorkspaceSwitcher -> menu
    SidebarLogo / WorkspaceSwitcher / SidebarUser / NavItem
    Topbar.tsx / TopbarActions
    Card / CardHead / Metric / Badge / Delta / RangeTabs             # primitives
    LineChart / AreaChart / Heatmap / Radar                          # inline-SVG charts
    ChannelLegend / ChannelTable                                     # shared card parts
    cards/          TotalSales, TotalVisitors, ConversionRate, VisitorsChannels, ...
    tasks/          TasksView, TasksToolbar, TaskStatCards, TaskTable, TaskRow, ...
```

**Sidebar structure (top->bottom):** `SidebarLogo` (Signalor app brand - solid-red tile + signal glyph + collapse) -> `WorkspaceSwitcher` (bordered `rounded-md` card for the active _Catalyst_ workspace with switch chevrons) -> `Main` menu -> `Sales Channels` -> footer (`ThemeToggle`, Settings, Support) -> `SidebarUser`. Every row is `rounded-md`; active item = brand-soft fill + left rail.

- **To wire real data:** replace the exported `const` arrays in `constants.ts` - the render layer already maps over them, so shape-compatible data drops in with no JSX changes.
- A framework-free `catalyst-dashboard/index.html` mirror also exists at the repo root for a zero-toolchain preview of the same design.
