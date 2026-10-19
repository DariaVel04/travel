# Coastal Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing travel app to the approved coastal editorial palette and type without changing layouts, navigation, copy, or behavior.

**Architecture:** All brand color lives in `frontend/src/styles/tokens.css`. Components already reference those variables. A node script locks the token values. Headings and listed price classes switch to Source Serif 4. Five CSS modules that hardcode the old navy or gray are updated to the paper and sea-green system.

**Tech Stack:** React 19, Vite, CSS modules, CSS custom properties, Inter and Source Serif 4 from Google Fonts, Node for the token check.

## Global Constraints

- Whole site uses the coastal palette. Pages, navigation, and flows stay as they are.
- UI, navigation, forms, and body stay Inter. Page titles (`h1`, `h2`, `h3`) and the listed price classes use Source Serif 4, with Georgia as the fallback.
- Do not set the serif on buttons, labels, or form fields.
- Warning, danger, and success stay the existing functional colors. Do not use `--color-accent` as a second call-to-action.
- No new user-facing strings. Do not edit translation files.
- Out of scope: routing, auth, trip storage, mock data, payments, AI, new navigation items, and a dark theme.
- Exact token values: `--color-bg` `#f4efe6`, `--color-surface` `#fffdf8`, `--color-surface-muted` `#f4efe6`, `--color-text` `#1c1915`, `--color-text-muted` `#6b6258`, `--color-border` `#e4d9c8`, `--color-border-strong` `#d7cbb8`, `--color-primary` `#1f6f5b`, `--color-primary-hover` `#184f42`, `--color-primary-soft` `#e5f2ed`, `--color-on-primary` `#ffffff`, `--color-hero` `#16382f`, `--color-hero-from` `#16382f`, `--color-hero-to` `#1f6f5b`, `--color-on-hero` `#f6f1e7`, `--color-focus` `#1f6f5b`.

**Spec:** `docs/superpowers/specs/2026-10-19-coastal-editorial-design.md`

---

### Task 1: Lock and apply the coastal tokens and serif font

**Files:**
- Create: `frontend/scripts/check-coastal-tokens.mjs`
- Modify: `frontend/package.json` (add script `tokens:check`)
- Modify: `frontend/src/styles/tokens.css`
- Modify: `frontend/index.html`

**Interfaces:**
- Consumes: nothing
- Produces: `--font-serif` and the coastal color tokens listed in Global Constraints. Later tasks use `var(--font-serif)` and the existing color variables.

- [ ] **Step 1: Write the token check**

Create `frontend/scripts/check-coastal-tokens.mjs`:

```js
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const expected = {
  '--color-bg': '#f4efe6',
  '--color-surface': '#fffdf8',
  '--color-surface-muted': '#f4efe6',
  '--color-text': '#1c1915',
  '--color-text-muted': '#6b6258',
  '--color-border': '#e4d9c8',
  '--color-border-strong': '#d7cbb8',
  '--color-primary': '#1f6f5b',
  '--color-primary-hover': '#184f42',
  '--color-primary-soft': '#e5f2ed',
  '--color-on-primary': '#ffffff',
  '--color-hero': '#16382f',
  '--color-hero-from': '#16382f',
  '--color-hero-to': '#1f6f5b',
  '--color-on-hero': '#f6f1e7',
  '--color-focus': '#1f6f5b',
};

const failures = [];

for (const [name, value] of Object.entries(expected)) {
  const pattern = new RegExp(`${name}:\\s*${value}\\s*;`);
  if (!pattern.test(tokens)) failures.push(`${name} is not ${value}`);
}

if (!tokens.includes("--font-serif:")) {
  failures.push('missing --font-serif');
}
if (!tokens.includes('Source Serif 4')) {
  failures.push('--font-serif does not name Source Serif 4');
}
if (!html.includes('Source+Serif+4')) {
  failures.push('index.html does not load Source Serif 4');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('coastal tokens ok');
```

In `frontend/package.json` scripts, add:

```json
"tokens:check": "node scripts/check-coastal-tokens.mjs"
```

- [ ] **Step 2: Run the check and confirm it fails**

Run: `npm run tokens:check -w frontend`

Expected: exit code 1, and the output names `--color-bg` (still `#f5f6f8`) plus the missing serif.

- [ ] **Step 3: Replace the palette, shadows, and font token**

In `frontend/src/styles/tokens.css`, replace the color comment and the color and shadow declarations so the file contains this block (leave spacing, radius, layout, and the existing sans scale unchanged):

```css
  /* Colors — coastal editorial: paper, ink, one sea green */
  --color-bg: #f4efe6;
  --color-surface: #fffdf8;
  --color-surface-muted: #f4efe6;
  --color-text: #1c1915;
  --color-text-muted: #6b6258;
  --color-border: #e4d9c8;
  --color-border-strong: #d7cbb8;

  --color-primary: #1f6f5b;
  --color-primary-hover: #184f42;
  --color-primary-soft: #e5f2ed;
  --color-on-primary: #ffffff;

  --color-accent: #9a4f2e;
  --color-accent-soft: #f6eee9;
  --color-accent-text: #7c3d22;

  --color-success: #1b6b4a;
  --color-success-soft: #e6f4ed;
  --color-warning: #8a5800;
  --color-warning-soft: #faf0dc;
  --color-danger: #b42318;
  --color-danger-soft: #f8e8e6;

  --color-hero: #16382f;
  --color-hero-from: #16382f;
  --color-hero-to: #1f6f5b;
  --color-on-hero: #f6f1e7;

  --color-focus: #1f6f5b;
```

Under `/* Typography */`, immediately before `--font-sans`, add:

```css
  --font-serif: 'Source Serif 4', Georgia, 'Iowan Old Style', Palatino, serif;
```

Replace the three shadow lines with:

```css
  --shadow-sm: 0 1px 2px rgb(28 25 21 / 0.05);
  --shadow-md: 0 6px 20px rgb(28 25 21 / 0.07);
  --shadow-lg: 0 18px 40px rgb(28 25 21 / 0.1);
```

In `frontend/index.html`, replace the Inter stylesheet link with:

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 4: Run the check again**

Run: `npm run tokens:check -w frontend`

Expected: `coastal tokens ok` and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/check-coastal-tokens.mjs frontend/package.json frontend/src/styles/tokens.css frontend/index.html
git commit -m "style: set coastal editorial color and serif tokens"
```

---

### Task 2: Use the serif on titles and prices

**Files:**
- Modify: `frontend/src/styles/global.css`
- Modify: `frontend/src/features/flights/components/FlightOfferCard.module.css`
- Modify: `frontend/src/features/hotels/components/HotelCard.module.css`
- Modify: `frontend/src/features/planner/components/TripOptions.module.css`
- Modify: `frontend/src/features/trips/components/TripSummary.module.css`

**Interfaces:**
- Consumes: `--font-serif` from Task 1
- Produces: serif headings and the price classes named in the spec

- [ ] **Step 1: Confirm headings are still sans**

Run: `rg -n "font-serif" frontend/src/styles/global.css frontend/src/features/flights/components/FlightOfferCard.module.css frontend/src/features/hotels/components/HotelCard.module.css frontend/src/features/planner/components/TripOptions.module.css frontend/src/features/trips/components/TripSummary.module.css`

Expected: no matches.

- [ ] **Step 2: Set the serif on headings and the listed prices**

In `frontend/src/styles/global.css`, change the heading rule to:

```css
h1,
h2,
h3 {
  font-family: var(--font-serif);
  line-height: var(--leading-tight);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
}
```

In `FlightOfferCard.module.css`, add the family to `.price`:

```css
.price {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
}
```

In `HotelCard.module.css`, add the family to `.nightly` and a separate `.total` rule after the shared muted group (keep `.total` inside the muted group so its size and color stay):

```css
.nightly {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}

.total {
  font-family: var(--font-serif);
}
```

In `TripOptions.module.css`, add the family to `.price`:

```css
.price {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: baseline;
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
}
```

In `TripSummary.module.css`, add the family to `.totalValue`:

```css
.totalValue {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}
```

Do not add `font-family` to buttons, labels, `.priceLabel`, or `.nightlyLabel`.

- [ ] **Step 3: Confirm the serif landed only on those rules**

Run: `rg -n "font-serif" frontend/src/styles/global.css frontend/src/features/flights/components/FlightOfferCard.module.css frontend/src/features/hotels/components/HotelCard.module.css frontend/src/features/planner/components/TripOptions.module.css frontend/src/features/trips/components/TripSummary.module.css`

Expected matches: `global.css` heading rule, `.price` in the flight card, `.nightly` and `.total` in the hotel card, `.price` in trip options, `.totalValue` in the trip summary. No other matches in those files.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/global.css frontend/src/features/flights/components/FlightOfferCard.module.css frontend/src/features/hotels/components/HotelCard.module.css frontend/src/features/planner/components/TripOptions.module.css frontend/src/features/trips/components/TripSummary.module.css
git commit -m "style: use the editorial serif for titles and prices"
```

---

### Task 3: Replace leftover navy and cool-gray surfaces

**Files:**
- Modify: `frontend/src/layouts/MainLayout/Header.module.css`
- Modify: `frontend/src/pages/HomePage/Hero.module.css`
- Modify: `frontend/src/features/trips/components/TripSummary.module.css`
- Modify: `frontend/src/components/LocationSelector/LocationSelector.module.css`
- Modify: `frontend/src/components/filters/ActiveFilterChips.module.css`

**Interfaces:**
- Consumes: coastal tokens from Task 1
- Produces: header, hero, trip drawer, location chips, and filter chips that no longer hardcode the old navy

- [ ] **Step 1: Confirm the old hardcoded colors are still present**

Run: `rg -n "228 232 238|255 255 255 / 0.88|16 32 44|18 32 51|#b94a2c|15 27 45|26 77 110" frontend/src/layouts/MainLayout/Header.module.css frontend/src/pages/HomePage/Hero.module.css frontend/src/features/trips/components/TripSummary.module.css frontend/src/components/LocationSelector/LocationSelector.module.css frontend/src/components/filters/ActiveFilterChips.module.css`

Expected: one match in each of those five files (header border or background, hero overlay, trip backdrop, location chip color and hover, filter chip hover).

- [ ] **Step 2: Update the five surfaces**

`Header.module.css` `.header`:

```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgb(228 217 200 / 0.9);
  background: rgb(255 253 248 / 0.9);
  backdrop-filter: saturate(1.2) blur(14px);
}
```

`Hero.module.css` `.hero` overlay only (keep the token gradient and `color: var(--color-on-hero)`):

```css
.hero {
  padding-block: clamp(var(--space-6), 6vw, 4.25rem);
  background:
    linear-gradient(180deg, rgb(22 56 47 / 0.18), transparent 42%),
    linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to));
  color: var(--color-on-hero);
}
```

Leave `.badge` and `.subtitle` light (`rgb(255 255 255 / …)`). They sit on the dark hero.

`TripSummary.module.css` `.backdrop`:

```css
.backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgb(28 25 21 / 0.32);
}
```

`LocationSelector.module.css`:

```css
.chip.country,
.chip.region,
.chip.anywhere {
  background: var(--color-accent-soft);
  color: var(--color-danger);
}
```

```css
.chipRemove:hover {
  background: rgb(28 25 21 / 0.08);
}
```

`ActiveFilterChips.module.css`:

```css
.remove:hover {
  background: var(--color-primary-soft);
}
```

- [ ] **Step 3: Confirm the old colors are gone**

Run the same `rg` command as Step 1.

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/MainLayout/Header.module.css frontend/src/pages/HomePage/Hero.module.css frontend/src/features/trips/components/TripSummary.module.css frontend/src/components/LocationSelector/LocationSelector.module.css frontend/src/components/filters/ActiveFilterChips.module.css
git commit -m "style: retint header, hero, and chips to the coastal palette"
```

---

### Task 4: Verify the running app

**Files:**
- No source edits unless a screen still shows the old navy. If one does, change only the hardcoded color in that module to a token from Task 1, then re-check.

**Interfaces:**
- Consumes: Tasks 1–3
- Produces: a checked visual pass on the existing routes

- [ ] **Step 1: Re-run the token check and the frontend build**

Run: `npm run tokens:check -w frontend && npm run build -w frontend`

Expected: `coastal tokens ok`, then a successful Vite build.

- [ ] **Step 2: Check the screens**

Start the frontend if it is not already running (`npm run dev` from the repo root). Open desktop width and a width under 768px. On each route, confirm paper background `#f4efe6`, sea-green primary actions, serif page titles, and Inter on nav and inputs:

- `/` hero is deep green, search card is paper
- `/flights` result price is serif
- `/hotels` nightly price is serif
- `/planner` option price is serif
- `/login` and `/account` titles are serif, fields are sans
- My Trip opens as a right-hand drawer, closes with the Close control and Escape, and the dim layer is warm ink rather than blue

Language switcher still changes visible labels. Do not change translation files.

- [ ] **Step 3: Commit only if Step 2 required a fix**

If Step 2 needed a color fix, commit that file with message `style: finish coastal color on leftover surface`. If Step 2 found nothing, do not create an empty commit.
