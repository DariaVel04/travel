# AI Travel Planner — Project Context

> Main context document for the project. Read this first in every new development / AI session.
> Working name: **AI Travel Planner**.

---

## 1. Project goal

An AI platform that helps users find the **optimal complete trip**, not just the cheapest ticket.
It takes into account price, time, convenience, connections, accommodation, local transport,
seasonal/climate factors and personal preferences.

Core principle: **cheapest ≠ best**. Every comparison must weigh total cost _and_ inconvenience.

Example:

| Option | Price | Stops | Duration | Notes                                    |
| ------ | ----- | ----- | -------- | ---------------------------------------- |
| A      | €400  | 1     | 12 h     | daytime flight                           |
| B      | €350  | 2     | 26 h     | overnight, airport change, self-transfer |

The system must **not** rank B above A just because it is €50 cheaper.

The project starts as a learning project and is designed to grow into a commercial travel-tech service.

---

## 2. Business model

The platform **never sells** flights, accommodation, cars or tours directly.

1. **Affiliate / referral** — user finds an option → platform compares → user clicks through to a partner to book →
   platform earns a commission. Requires affiliate links, partner tracking, click tracking and conversion tracking.
2. **Free + Premium subscription** — the commercial model will include a Free plan and a Premium plan
   (e.g. unlimited AI plans, price alerts, price prediction, shared trips, advanced climate data).
   Payments are **not** implemented yet; only types and extension points exist.

---

## 3. Main features (target product)

| #   | Module                         | Summary                                                                                                    |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1   | Flexible Flight Search         | Multiple origin airports/cities, exact/range/flexible/months/cheapest dates, trip lengths 3/7/14/30/custom |
| 2   | Hotel / Accommodation Search   | Hotels, apartments, hostels, resorts, rentals, packages; filters for meals, amenities, distances           |
| 3   | Tour Operator / Package Search | Charters, package holidays, last-minute; compare _independent booking_ vs _package_                        |
| 4   | AI Vacation Planner            | Group composition, trip type, preferences → destinations, stays and plan                                   |
| 5   | Transportation Planner         | Public transport / taxi & ride-hailing / rental car, per destination                                       |
| 6   | AI Trip Cost Calculator        | Total cost: flights + accommodation + food + transport + other                                             |
| 7   | Climate Intelligence           | Temperature, humidity, rainfall, seasonal risks (pollen, jellyfish, monsoon, hurricanes…)                  |
| 8   | Price Prediction               | Historical prices, trends, "is this a good price?"                                                         |
| 9   | Day-by-Day Trip Planner        | Itinerary per day, with transport legs between stops                                                       |

Additional future capabilities: authenticated users (Email / Google / Apple), saved trips/preferences/group presets/
favourites/searches, group travel with shared trips (`/trip/abc123`) and voting, price monitoring alerts (Email, Telegram).

### Flight sources

Flight search must eventually query **all** of these, not only regular flight APIs:
airlines, OTAs, travel companies, **tour operators**, package tours, **charter flights**, special offers, last-minute deals.
Tour operators sometimes sell cheaper charter seats that regular flight search never shows —
that's why `tour_operator`, `charter` and `package` are separate `OfferSourceType`s.

### Trip Convenience Score

Offers carry `inconveniences: InconvenienceFactor[]` (overnight flight, early departure, late arrival, long layover,
multiple stops, airport change, self-transfer, short/risky connection, very long travel time, inconvenient arrival,
overnight layover, transit visa, complex route) and an optional `convenienceScore`.
A future `ScoringStrategy` combines price, duration, stops, schedule, transfers, visa and comfort using `ScoreWeights`
(can later be personalised per user). **No scoring algorithm is implemented yet.**

### Accommodation + transport integration

The best stay is the one that is best **for the whole trip**: Hotel A €700 far from the centre may need €180 of
taxis, so Hotel B €800 next to the metro is cheaper overall. `AccommodationOffer.nearestPublicTransportM` and
`distanceToCenterKm` exist for this; AI Total Cost will combine accommodation + transport + other costs.

---

## 4. Supported languages

| Code | Language                                 | Native name |
| ---- | ---------------------------------------- | ----------- |
| `en` | English (default & development language) | English     |
| `fi` | Finnish                                  | Suomi       |
| `ru` | Russian                                  | Русский     |
| `de` | German                                   | Deutsch     |
| `fr` | French                                   | Français    |

### How i18n works

- Library: **i18next** + **react-i18next** + **i18next-browser-languagedetector**.
- Setup: `src/i18n/index.ts`. Language list: `src/i18n/languages.ts`. Texts: `src/i18n/locales/<code>.json`.
- **All UI text lives in translation files.** Components call `t('some.key')`; never hardcode user-facing text.
- `en.json` is the source of truth. `src/i18n/i18next.d.ts` makes keys type-safe: `t('missing.key')` is a TypeScript error.
- Detection order: saved choice in `localStorage` (`atp.language`) → browser language → fallback `en`.
- `<html lang>` is updated on every language change.
- Plurals use i18next suffixes: `_one`, `_other` (en/fi/de), plus `_few`, `_many` (ru) and `_many` (fr).
- Money and dates are formatted with `Intl` using the language's locale (`useLocale().intlLocale`).
- `npm run i18n:check` verifies every locale has exactly the same keys as English.

**Adding a language:** add it to `SUPPORTED_LANGUAGES` → create `locales/<code>.json` → register in `i18n/index.ts` →
run `npm run i18n:check`.

**Localized URLs / SEO (future):** all paths are centralised in `src/app/paths.ts`, so moving to
`/fi/flights`, `/de/planner` only needs changes there and in `src/app/router.tsx`. For real SEO,
pre-rendering/SSR (e.g. React Router framework mode) and `hreflang` tags will be added later.
There is one app for all languages — never a separate app per language.

---

## 5. Technology

- **React 19**, **TypeScript 6** (strict, `noUncheckedIndexedAccess`), **Vite 8**
- **React Router 8** (data router: `createBrowserRouter`)
- **i18next / react-i18next** + browser language detector
- **ESLint 10** (typescript-eslint, react-hooks, react-refresh; `no-explicit-any` = error) + **Prettier**
- **CSS Modules + CSS custom properties** (design tokens in `src/styles/tokens.css`). No UI/CSS framework.
- Path alias: `@/` → `src/`

### Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + production build to dist/
npm run preview      # serve the production build
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run typecheck    # TypeScript only
npm run i18n:check   # compare translation keys across locales
```

---

## 6. Project structure

The repo is a modular monolith:

```
frontend/   React + TypeScript + Vite
backend/    Node.js + TypeScript + Express
database/   MySQL + Prisma schema and migrations
```

Frontend source (paths below are under `frontend/`):

```
src/
├── app/               # App root, router, central URL paths
├── components/        # Shared components
│   ├── ui/            # Design-system primitives: Button, Badge, Field, SegmentedControl, ChipSelect…
│   ├── Logo/  LanguageSwitcher/  PartnerLink/
├── features/          # Domain modules: types, option lists, feature components
│   ├── flights/       # search form, results, offer card, types
│   ├── hotels/        # types only (future)
│   ├── tours/         # types only (future): TourPackage, PackageComparison
│   ├── planner/       # planner form, itinerary preview, types
│   ├── transportation/# transport mode selector, types (passes, ride services, rentals)
│   ├── trips/         # Trip, SharedTrip, votes, TripCostEstimate (AI Total Cost)
│   ├── climate/       # types only (future)
│   ├── prices/        # PriceInsight, PriceAlert — types only (future)
│   ├── auth/          # User, AuthProvider, saved data — types only (future)
│   └── subscription/  # SubscriptionPlan, UserSubscription, feature access helpers
├── hooks/             # useLocale, useDocumentTitle
├── i18n/              # i18next setup, language list, locales/*.json
├── layouts/           # MainLayout with Header and Footer
├── mocks/             # Demo data (flights, partners, itinerary). Delete when real APIs arrive.
├── pages/             # Route-level pages: Home, Flights, Planner, NotFound
├── services/          # Data access layer (mock today, real APIs later)
│   ├── flights/       # FlightSearchProvider interface + provider registry
│   ├── partners/      # partner registry, affiliate URL builder, click tracking
│   └── planner/       # generateItinerary()
├── styles/            # tokens.css (design tokens), global.css
├── types/             # Cross-feature types: Money, dates, places, Partner, scoring
├── utils/             # money, date, number, classNames helpers
└── main.tsx
scripts/check-translations.mjs
```

`frontend/src/services/api` is the HTTP client for the Express API. Pages still use mock services.

**Conventions**

- Feature `options.ts` holds `as const` arrays (used for UI lists); `types.ts` derives union types from them.
- Feature form state (`searchForm.ts`, `plannerForm.ts`) is separate from domain types and converted on submit.
- Money is always `{ amountMinor, currency }` (integer cents) — never floats.
- Components never hardcode URLs (use `paths` / `build*Url`) or user-facing text (use `t()`).
- Every outgoing partner link goes through `<PartnerLink>`.

---

## 7. Future APIs (not connected)

All integrations go through the backend (API keys must never be in the frontend).

| Area             | Candidate providers (to evaluate)                                          | Integration point                             |
| ---------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| Flights          | Duffel, Amadeus, Kiwi Tequila, Skyscanner / Travelpayouts                  | `FlightSearchProvider` in `services/flights/` |
| Tour operators   | Tour operator feeds / affiliate programs (TUI, regional Nordic operators…) | `FlightSearchProvider` + `TourSearchParams`   |
| Accommodation    | Booking.com, Expedia, Hotellook, vacation rental APIs                      | `AccommodationSearchParams/Offer`             |
| Car rental       | Rentalcars, DiscoverCars, direct rental companies                          | `CarRentalOffer`                              |
| Taxi / rides     | Per-city data (Uber, Bolt, local taxis)                                    | `CityTransportInfo.rideServices`              |
| Public transport | Official city operators, GTFS feeds                                        | `CityTransportInfo.publicTransport`           |
| Weather/climate  | Historical climate datasets, weather APIs                                  | `DestinationClimateProfile`                   |
| Places           | Geocoding / places API                                                     | `PlaceRef` (`free_text` → resolved)           |
| AI               | LLM provider via backend                                                   | `services/planner/plannerService.ts`          |
| Notifications    | Email provider, Telegram Bot API                                           | `PriceAlert.channels`                         |
| Payments         | Stripe / Paddle / app stores                                               | `UserSubscription.provider`                   |

---

## 8. Future AI modules

- **AI Vacation Planner** — `PlannerRequest` → `Itinerary` (destinations, dates, stays, day plan).
- **Trip Convenience Score** — `ScoringStrategy<FlightOffer>` → `ConvenienceScore`.
- **AI Total Cost** — builds `TripCostEstimate` from `CostLineItem`s
  (flights: ticket/baggage/fees; accommodation: room/taxes/resort fee/cleaning; food: restaurants/groceries/meals;
  transportation: public transport/taxi/rental car/fuel/parking/tolls; other: activities/tickets/insurance/visas).
  The type system enforces that a subcategory belongs to its category.
- **Climate Intelligence** — uses `DestinationClimateProfile` to choose destinations and dates.
- **Price Predictor** — `PriceInsight` (current vs historical average, trend, recommendation, confidence).
- **Package vs independent comparison** — `PackageComparison` ("Independent €1250 vs package €1090 → save €160").

---

## 9. Transportation system

The planner asks: **"How do you want to move around?"** → `TransportMode` = `public_transport` | `taxi` | `rental_car`.

- **Public transport**: suitable passes (`TransportPass`: price, validity, zones, payment methods, official flag, link).
- **Taxi / ride-hailing**: services **available in that specific city** (`RideService`: rating, base fare,
  price per km, features, link). Never assume Uber/Bolt exist everywhere — availability comes from `CityTransportInfo`.
- **Rental car**: `CarRentalOffer` (price, deposit, insurance, category, one-way, conditions) +
  `CarRunningCosts` (fuel, parking, tolls) for AI Total Cost.

The chosen mode shapes the itinerary: each `ItineraryStop.legFromPrevious` is a `TransportLeg`
(mode, vehicle, duration, estimated cost). Rental car → farther places are fine; taxi → per-ride costs;
public transport → metro/bus/tram/train legs. Today the legs come from mock data.

---

## 10. Affiliate architecture

- `Partner` (`src/types/partner.ts`) with `types: PartnerType[]` —
  `flight | hotel | tour_operator | rental_car | taxi | transport | activities` — and optional `AffiliateConfig`
  (network, tracking param, tracking id, commission model).
- Offers hold `bookingOptions: BookingOption[]` (same offer can be sold by several partners at different prices).
- `<PartnerLink>` renders every outgoing link: `rel="sponsored noopener noreferrer"`, new tab,
  `buildPartnerUrl()` adds the affiliate param + UTM params, `trackPartnerClick()` records the click
  (dev console today; backend/`sendBeacon` later).
- `PartnerClickEvent` and `PartnerConversion` types are ready for click and conversion tracking.
- Mock partners (fictional): Nordic Air, SkyFly, SunHolidays — `example.com` URLs.

---

## 11. Subscription architecture (Free + Premium)

- `src/features/subscription/types.ts`: `SubscriptionPlan = 'free' | 'premium'`,
  `UserSubscription { plan, status: 'active' | 'inactive' | 'trial' | 'cancelled', trialEndsAt?, currentPeriodEnd?, billingInterval?, provider?, providerSubscriptionId? }`,
  `AppFeature`, `PlanLimits`.
- `src/features/subscription/access.ts`: `PLAN_FEATURES`, `PLAN_LIMITS` (placeholder values), `FREE_SUBSCRIPTION`,
  `isSubscriptionActive()`, `getEffectivePlan()` (inactive/cancelled premium → free), `hasFeatureAccess()`.
- `User.subscription` links users to plans. No payments, paywall or Premium UI exist yet.

---

## 12. Current implementation status (Stage 1 — Project Foundation ✅)

**Done**

- Vite + React + TypeScript, ESLint, Prettier, React Router, i18n with 5 complete locales and a key checker.
- Layout: sticky Header (logo, Flights, Vacation Planner, language switcher, Login placeholder, mobile menu), Footer
  with affiliate disclosure.
- Routes: `/` (Home), `/flights`, `/planner`, `*` (404).
- Home: hero "Plan your entire trip with AI", main search with Flights / Vacation Planner tabs (passes values to the
  pages via query params), 6 feature preview cards.
- Flights page: full flexible search form (multiple origins, 5 date modes, durations, passengers, sources incl.
  tour operators/charters) → mock results with price breakdown, stops, inconvenience badges, score placeholder,
  partner links.
- Planner page: destination/dates, group (incl. children's ages, seniors, pets), trip types, preferences, transport mode
  selector → mock day-by-day itinerary with transport legs and daily transport cost.
- Domain types for all future modules (hotels, tours, transport, trips & total cost, climate, prices & alerts, auth,
  subscription, partners, scoring).
- Responsive design (desktop / tablet / mobile).

**Mock / placeholder**

- All flight results (`src/mocks/flightOffers.ts`) — they ignore the route and dates; only source filters apply.
- Itinerary (`src/mocks/itinerary.ts`) — fixed 3-day template adapted to the transport mode.
- Partners and partner URLs (`example.com`), click tracking (console only, dev mode).
- Login button (disabled), Convenience Score ("Coming soon"), Total Cost / Climate / Price Prediction / Tour deals
  (preview cards only).

**Not implemented (by design)**: real flight/hotel/tour/transport/weather/AI APIs, authentication, database, payments,
affiliate networks, price prediction, price tracking, Telegram/email notifications. No API keys or secrets in the repo.

---

## 13. Planned development stages

1. ✅ **Project Foundation** — this stage.
2. **Backend foundation** — small API (e.g. Node/TypeScript), env config, `services/http.ts`, first real endpoint
   proxied through the backend.
3. **Flight search v1** — one real flight provider, airport autocomplete (`PlaceRef` resolution), result filters/sorting.
4. **Convenience Score v1** — rule-based `ScoringStrategy`, inconvenience detection from real segments, "best" sort.
5. **Accommodation search v1** + **Tour/package search v1** and package vs independent comparison.
6. **AI Vacation Planner v1** — LLM via backend, structured output into `Itinerary`.
7. **Transportation data** per city + **AI Total Cost v1**.
8. **Auth + saved trips/preferences**, then **shared trips and voting**.
9. **Climate Intelligence** and **Price history / prediction**, **price alerts** (email, Telegram).
10. **Affiliate networks**, click/conversion tracking, **Premium subscription** with a payment provider.
11. **SEO & localized URLs** (pre-rendering/SSR, `hreflang`), analytics, performance.

---

## 14. Rules for future AI / development sessions

- Don't jump to the next stage without an explicit request.
- Keep code readable for a frontend learner; avoid "enterprise" over-engineering, but don't add throwaway hacks.
- No `any`; derive types from `as const` option lists where possible.
- All user-facing text in `src/i18n/locales/*.json` (update **all 5** files, run `npm run i18n:check`).
- New data sources implement the existing provider interfaces; UI should not change when a mock becomes real.
- No paid services, API keys or secrets without the owner's permission; secrets never go into the frontend.
- Don't install libraries unless they are really needed.
