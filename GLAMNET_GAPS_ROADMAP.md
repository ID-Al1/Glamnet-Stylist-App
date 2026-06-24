# GlamNet — Platform Gaps Roadmap for Claude Code

This file is the staged implementation guide for completing all 10 platform gaps in VS Code using Claude Code.
Each stage lists the exact files to wire up, the commands to run, and what Claude Code should do.

---

## Before you start

### 1. Push new DB tables to Postgres

Run this in the `lib/db` package to create all new tables:

```powershell
cd lib/db
pnpm drizzle-kit push
```

New tables being created:
- `portfolio_items` — Gap 2 creator portfolio
- `verifications`, `escrow`, `disputes` — Gap 5 trust system
- `payments`, `fx_rates` — Gap 3 Paystack / multi-currency
- `referral_codes`, `referral_uses`, `photographer_castings`, `casting_applications` — Gap 1 flywheel
- `subscriptions` — Gap 4 Creator Pro
- `contracts` — Gap 9 offline contracts

### 2. Add env vars

Copy to `artifacts/api-server/.env`:

```
PAYSTACK_SECRET_KEY=sk_test_...
EXCHANGE_RATE_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+27...
ADMIN_SECRET=your-admin-secret
```

DATABASE_URL lives in `lib/db/.env` — do NOT commit it.

---

## Stage 1 — Wire API column updates (30 min)

The `bookings` table is referenced by multiple new routes but currently doesn't have:
- `agreedRate` (integer) — needed by insights and contracts
- `talentRole` (text) — needed by rate benchmarking
- `city` (text) — needed by geographic filtering

**Claude Code task:**

Open `lib/db/src/schema/bookings.ts` and add:
```typescript
agreedRate: integer("agreed_rate"),
talentRole: text("talent_role"),
city: text("city"),
```
Then run `pnpm drizzle-kit push` again.

---

## Stage 2 — Gap 2 (Cold Start / Portfolio) — COMPLETE

Files already in place. Wire them in:

1. In `artifacts/mobile/app/(tabs)/profile.tsx` (or wherever the profile tab is), add a button:
   ```tsx
   <TouchableOpacity onPress={() => router.push("/portfolio-editor")}>
     <Text>Add Portfolio Item</Text>
   </TouchableOpacity>
   ```
2. The portfolio section already renders in `app/talent/[id].tsx`.

---

## Stage 3 — Gap 5 (Trust) — COMPLETE

All backend routes live at `/api/trust/*`.

Wire into UI:
1. In profile screen, add a "Get Verified" button → `router.push("/verification")`
2. On booking cards, import `VerifiedBadge` from `components/VerifiedBadge.tsx` and pass the talent's approved verification types.

---

## Stage 4 — Gap 3 (Africa Infrastructure / Paystack) — COMPLETE

Routes live at `/api/payments/*`.
`PaymentContext` is wired into `_layout.tsx`.
`PaymentScreen` at `/payment` accepts `amountZar` and `bookingId` as params.

Wire into booking flow:
1. In `app/book/[id].tsx`, after booking is confirmed, navigate to payment:
   ```tsx
   router.push({ pathname: "/payment", params: { amountZar: String(rate), bookingId: booking.id } })
   ```

---

## Stage 5 — Gap 1 (Flywheel) — COMPLETE

Casting calls: `GET /api/flywheel/castings`
Referrals: `GET /api/flywheel/referral/mine`

Wire into tabs:
1. Add a "Castings" tab or button in the home/discover screen → `router.push("/castings")`
2. In the profile screen, show the referral code from `GET /api/flywheel/referral/mine`

---

## Stage 6 — Gap 6 (AI Data / Insights) — COMPLETE

Routes at `/api/insights/*`. Career screen at `/career-insights`.

Wire into profile:
1. In profile tab, add "Career Insights" button → `router.push("/career-insights")`

---

## Stage 7 — Gap 4 (Monetization / Pro) — COMPLETE

Routes at `/api/subscriptions/*`. Upgrade screen at `/upgrade-pro`.

Wire into profile:
1. Show current tier from `GET /api/subscriptions/mine`
2. If `isPro === false`, show "Upgrade to Pro" button → `router.push("/upgrade-pro")`
3. Gate Pro features (portfolio limit > 5, analytics access) by checking `isPro` in context

---

## Stage 8 — Gap 8 (Education) — COMPLETE

Learning center at `/learn`. No backend needed (static content).

Wire into tabs:
1. Add a "Learn" button or tab in the main nav → `router.push("/learn")`

---

## Stage 9 — Gap 7 (Geographic) — COMPLETE

`CityPicker` component at `components/CityPicker.tsx`.
Talent API now supports `?city=` query param.

Wire into:
1. **Signup screen** — replace plain text city input with `<CityPicker>` component
2. **Profile edit screen** — same
3. **Discover/search screen** — add city filter using `CityPicker`

---

## Stage 10 — Gap 9 (WhatsApp/Offline) — COMPLETE

Notification service at `artifacts/api-server/src/services/notifications.ts`.
Contracts at `/api/contracts/*`. Schema: `contracts` table.

Wire into booking flow:
1. After `POST /api/bookings` confirms, also call `POST /api/contracts` with the agreed terms
2. In booking detail screen, add "View Contract" button → fetch `GET /api/contracts/:bookingId`
3. Add "Share via WhatsApp" button that fetches `GET /api/contracts/:id/text` and calls `Share.share()` from `react-native`

---

## Stage 11 — Gap 10 (Moat) — COMPLETE

Analytics API at `/api/analytics/*`. Platform stats screen at `/platform-stats`.

Wire into:
1. Home screen — show `GET /api/analytics/pulse` numbers as social proof at the top
2. Profile screen — add "Your Impact" button → `router.push("/platform-stats")`

---

## Stage 12 — Final QA pass (Claude Code)

Run in each package directory:

```powershell
# API server
cd artifacts/api-server
pnpm tsc --noEmit

# Mobile
cd artifacts/mobile
pnpm tsc --noEmit
```

Fix any type errors flagged. The most likely issues:
- `bookingsTable.agreedRate` / `talentRole` / `city` — add to schema first (Stage 1)
- `req.auth!.email` — ensure `requireAuth` middleware sets `email` on the auth object (check `middlewares/requireAuth.ts`)
- `Colors.greenDim`, `Colors.blue`, `Colors.muted` — add any missing tokens to `constants/colors.ts`

---

## New env vars summary

| Var | Where | Purpose |
|-----|-------|---------|
| `PAYSTACK_SECRET_KEY` | api-server/.env | Paystack payments |
| `EXCHANGE_RATE_API_KEY` | api-server/.env | FX rate refresh |
| `TWILIO_ACCOUNT_SID` | api-server/.env | WhatsApp + SMS |
| `TWILIO_AUTH_TOKEN` | api-server/.env | WhatsApp + SMS |
| `TWILIO_WHATSAPP_FROM` | api-server/.env | WhatsApp sender |
| `TWILIO_SMS_FROM` | api-server/.env | SMS sender (SA number) |
| `ADMIN_SECRET` | api-server/.env | Analytics admin routes |

---

## New files summary

### `lib/db/src/schema/`
- `portfolio.ts` — `portfolioItemsTable`
- `verification.ts` — `verificationsTable`, `escrowTable`, `disputesTable`
- `payments.ts` — `paymentsTable`, `fxRatesTable`
- `referrals.ts` — `referralCodesTable`, `referralUsesTable`, `photographerCastingsTable`, `castingApplicationsTable`
- `subscriptions.ts` — `subscriptionsTable`
- `contracts.ts` — `contractsTable`

### `artifacts/api-server/src/routes/`
- `portfolio.ts` — CRUD for portfolio items
- `verification.ts` — trust / escrow / disputes
- `payments.ts` — Paystack checkout + FX
- `referrals.ts` — referral codes + casting calls
- `insights.ts` — rate benchmarking
- `subscriptions.ts` — Pro tier + fee calculator
- `contracts.ts` — booking contracts + WhatsApp text export
- `analytics.ts` — network effects metrics

### `artifacts/api-server/src/services/`
- `paystack.ts` — Paystack API wrapper
- `notifications.ts` — WhatsApp → SMS → Push cascade

### `artifacts/mobile/app/`
- `portfolio-editor.tsx` — add portfolio item
- `verification.tsx` — verification screen
- `payment.tsx` — WebView Paystack checkout
- `castings.tsx` — casting calls feed
- `career-insights.tsx` — rate benchmarking
- `upgrade-pro.tsx` — Pro upgrade modal
- `learn.tsx` — learning center
- `platform-stats.tsx` — network effects dashboard

### `artifacts/mobile/context/`
- `PortfolioContext.tsx`
- `PaymentContext.tsx`

### `artifacts/mobile/components/`
- `VerifiedBadge.tsx` — compact verified type badges
- `CityPicker.tsx` — SA city bottom-sheet picker
