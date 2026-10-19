# Coastal editorial visual refresh

## Goal

Apply one new visual direction across the existing travel app. Pages, navigation, copy, and behavior stay as they are.

Approved direction: **Coastal editorial**. Warm paper, deep sea green, serif titles and prices, sans for interface text.

## Decisions

- Whole site, not one screen.
- New color, type, and surfaces. No new flows, no reorganized navigation, no new product sections.
- Coastal editorial over Night atlas and Bright booking.
- Five languages stay on the existing i18n keys. No new user-facing strings.

## Visual system

Tokens in `frontend/src/styles/tokens.css` become the only palette. Components keep using variables.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f4efe6` | Page background |
| `--color-surface` | `#fffdf8` | Cards, inputs, header |
| `--color-surface-muted` | `#f4efe6` | Quiet fills inside cards |
| `--color-text` | `#1c1915` | Ink |
| `--color-text-muted` | `#6b6258` | Secondary text |
| `--color-border` | `#e4d9c8` | Hairlines |
| `--color-border-strong` | `#d7cbb8` | Inputs and secondary buttons |
| `--color-primary` | `#1f6f5b` | Actions, links, active nav |
| `--color-primary-hover` | `#184f42` | Hover |
| `--color-primary-soft` | `#e5f2ed` | Selected chips, focus glow |
| `--color-on-primary` | `#ffffff` | Text on green |
| `--color-hero-from` | `#16382f` | Hero start |
| `--color-hero-to` | `#1f6f5b` | Hero end |
| `--color-hero` | `#16382f` | Hero fallback |
| `--color-on-hero` | `#f6f1e7` | Text on the hero |
| `--color-focus` | `#1f6f5b` | Focus ring |

Warning, danger, and success stay functional and are not restyled into the brand. The clay accent (`--color-accent`) stays available but is not used as a second call-to-action color.

Shadows use warm ink (`rgb(28 25 21 / …)`) at the same strengths as today.

## Type

- UI, navigation, forms, and body stay **Inter**.
- Page titles (`h1`, `h2`, `h3`) and prices use **Source Serif 4**, with Georgia as the fallback.
- Load Source Serif 4 from the existing Google Fonts link in `frontend/index.html`, next to Inter.
- Add `--font-serif` in `tokens.css`. Set it on `h1–h3` in `global.css`.
- Apply the serif only to these price elements:
  - `FlightOfferCard.module.css` `.price`
  - `HotelCard.module.css` `.nightly` and `.total`
  - `TripOptions.module.css` `.price`
  - `TripSummary.module.css` `.totalValue`

Do not set the serif on buttons, labels, or form fields.

## Surfaces that hardcode the old palette

After the tokens change, update these so they match the paper and green system instead of the old cool gray and navy:

- `Header.module.css` — translucent paper header, warm border.
- `Hero.module.css` — sea-green gradient; badge and subtitle stay light on the dark hero.
- `TripSummary.module.css` — backdrop uses warm ink, not cool navy.
- `LocationSelector.module.css` — remove the leftover red `#b94a2c` and cool overlay; use `--color-danger` and a warm tint.
- `ActiveFilterChips.module.css` — selected chip uses `--color-primary-soft` instead of a hardcoded navy wash.

Everything else should pick up the new look through tokens. Do not redraw layouts, card structure, or spacing scales.

## Out of scope

- Routing, auth, trip storage, and mock data.
- Copy and translation files.
- Payments, AI, and new navigation items.
- A dark theme.

## Verification

With the frontend running, check desktop and a narrow mobile width:

- Home (hero and search)
- Flights, Hotels, Vacation Planner (forms and a result card)
- Login, registration, and account
- My Trip drawer (open, close, Escape)
- Language switcher still changes visible text

Success means the same screens, in the coastal palette, with serif titles and prices and sans controls. Focus rings stay visible. Reduced-motion behavior in `global.css` stays.
