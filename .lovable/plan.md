# Full Production Audit & Stabilization

## What I already verified

- The current live sandbox preview at `id-preview--eaaa8b1c-...lovable.app/` **loads successfully** (HTTP 200, full DrinqInk landing page renders, no runtime errors in console).
- The "refused to connect" URL you saw (`preview-982bef60--drinqink.lovable.app`) is a **per-commit historical snapshot** that goes cold after a while — it is not the live preview. The GitHub connection is unrelated.
- The big features migration is already applied — `group_orders`, `event_plans`, `loyalty_*`, `favorites`, `notification_preferences`, `corporate_*`, `dispute_comments`, `order_item_customizations`, `order_tracking`, etc. all exist in the live DB with RLS.
- I found one real silent breakage already: `src/start.ts` does not register `attachSupabaseAuth` as a `functionMiddleware`. Every `createServerFn` call protected by `requireSupabaseAuth` will 401 because no bearer token is attached. This is the kind of bug that makes "nothing happens" when you click things.

## Goals

1. Make the preview reachable from your side (explain + verify URLs).
2. Wire auth correctly end-to-end so protected actions work.
3. Audit and exercise every flow (public + authenticated) and fix what breaks.
4. Tighten types / remove `@ts-nocheck` where it hides real bugs.
5. Re-run security + linter and produce a clean production checklist.

## Phase 1 — Preview access + auth wiring (blocking)

1. Tell you the correct stable preview URL to bookmark:
   - Live preview: `https://id-preview--eaaa8b1c-01bf-4798-bdad-b4f96c42a681.lovable.app`
   - Stable dev: `https://project--eaaa8b1c-01bf-4798-bdad-b4f96c42a681-dev.lovable.app`
   The `preview-<hash>--drinqink.lovable.app` URLs are per-version snapshots and are expected to go cold.
2. Patch `src/start.ts` to register the existing `attachSupabaseAuth` middleware (append, do not replace `errorMiddleware`). Without this, every `requireSupabaseAuth` server function 401s.
3. Add a root-level `onAuthStateChange` listener (one place only) that calls `router.invalidate()` + `queryClient.invalidateQueries()` so the UI updates immediately after sign-in/out. Currently sign-in works but stale data persists.

## Phase 2 — Route & flow audit (browser-driven)

I will walk every route, watch console + network, and fix any 4xx/5xx, blank state, or broken interaction I find. Coverage:

Public:
- `/`, `/browse`, `/categories`, `/categories/$slug`, `/cellar`, `/flash-deals`, `/search`, `/product/$id`, `/vendor/$slug`, `/blog`, `/about`, `/contact`, `/faq`, `/how-it-works`, `/how-it-works-vendors`, `/login`, `/signup`, `/forgot-password`, `/reset-password`.

Authenticated (`_authenticated/*`):
- `/dashboard`, `/orders`, `/orders/$id` (incl. embedded `OrderTracking`, `RefundRequest`, `ProductReviews`), `/favorites`, `/addresses`, `/checkout`, `/group-orders`, `/events`, `/corporate`, `/admin`, `/admin/blog`, `/vendor-dashboard`, `/vendor-onboarding`.

For each: load the page logged in (you said you can log in and safe test writes are OK), capture errors, fix root cause (not a try/catch swallow), re-verify.

## Phase 3 — Component wiring sanity check

Confirm every component that was supposed to be wired in the last pass actually renders and queries successfully:
- `GroupOrders`, `EventPlanner`, `CorporateTeamManagement`, `BlogCMS` (admin gated).
- `OrderTracking`, `RefundRequest`, `ProductReviews` embedded on `/orders/$id` and `/product/$id`.
- `LoyaltyPoints`, `SubscriptionManager`, `NotificationPreferences` on the dashboard/notifications surface.
- `SearchFilters`, `AddressValidation`, `FavoriteButton`, `CartButton`, `OrderCustomizationDialog`, `PaymentSplitting`, `DisputeComments`.

Mount anything still orphaned and add nav entries where users can't reach it.

## Phase 4 — Type & error hygiene

- Replace remaining `as any` casts and `@ts-nocheck` headers added during the last fix-up with real typed queries now that the DB types match the schema.
- Confirm `src/routes/__root.tsx` still has `<Outlet />` and a real `errorComponent` (it does — keep it).
- Spot-check that no client file imports `@/integrations/supabase/client.server` (service role must not leak to the browser).
- Verify Paystack helpers don't read `process.env` at module scope.

## Phase 5 — Security, linter, performance

- Re-run security scan + DB linter. Fix anything new; document anything intentionally ignored in the security memory.
- Confirm RLS on every table actually used by the UI.
- Confirm `loyalty_redemptions` / `referrals` are only written via the `redeem_loyalty_reward` / `apply_referral_code` SECURITY DEFINER functions from the UI.
- Light perf pass: lazy-load heavy admin components, ensure hero/cellar images use width/height + lazy loading (already mostly done).

## Phase 6 — Verification & handoff

- Final pass on `/` and the top 6 routes with browser + network capture.
- Produce a short checklist of what's production-ready and what still needs a human decision (e.g. enabling Leaked Password Protection in the Supabase dashboard; setting `PAYSTACK_SECRET_KEY` / email keys if you want live transactional emails).

## Out of scope for this loop

The cinematic 3D drinks journey (Lenis + R3F + GSAP) is a separate milestone — I will not touch it here so this audit lands cleanly. Once you confirm everything in Phases 1–6 is green, I'll start it as its own plan.

## What I need from you

- Stay signed in in the preview so I can hit authenticated routes.
- Confirm safe test orders/refunds are OK in the live DB (you already said yes).
- If you want me to also seed any sample data (e.g. a few products / a vendor) for the audit, say so; otherwise I'll only touch existing records.

## Risks

- Some flows (Paystack split payments, transactional emails) can't be fully end-to-end verified without live API keys. I'll mark those as "wired but pending keys" rather than claim they work.
- If `vite.config.ts`'s SSR error wrapper isn't loading correctly on your network, the "refused to connect" you saw could also reflect that — I'll watch the worker logs while testing and patch if I see h3-swallowed 500s.