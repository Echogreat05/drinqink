# Why you can't see your local changes

I checked your repo against the live database and the wiring:

- **Big migration file is sitting unapplied.** `supabase/migrations/20260521_add_missing_features.sql` (649 lines) creates ~25 new tables — `group_orders`, `event_plans`, `loyalty_tiers/transactions/rewards`, `subscriptions`, `favorites`, `notification_preferences`, `dispute_comments`, `order_item_customizations`, `corporate_team_members`, `vendor_analytics`, etc. None of them exist in the live DB yet. Any component that queries them silently fails → you see nothing.
- **Several new components are orphaned.** `GroupOrders`, `EventPlanner`, `TheCellar`, `BlogCMS`, `CorporateTeamManagement`, `DisputeComments`, `OrderCustomizationDialog`, `OrderTracking`, `PaymentSplitting`, `ProductReviews`, `RefundRequest`, `SearchFilters`, `NotificationPreferences`, `AddressValidation` exist on disk but nothing imports them. They literally can't render until wired into routes.
- **Only 5 of the new components are imported anywhere**: `LoyaltyPoints` + `SubscriptionManager` (dashboard), `FavoriteButton` (flash-deals, product, vendor).

So the fix is two parts: get the DB matching the code, then mount the components on real routes. Then the cinematic layer on top.

---

## Milestone A — Restore the foundation (so changes actually appear)

1. **Apply the missing-features migration** via `supabase--migration` (re-issue the 649-line file as one transaction). Includes: new enums, group orders, event planner tables, loyalty system + tiers seed, referral bonuses, subscriptions, vendor/product analytics, dispute comments, order customizations, notification channels/preferences/log, favorites, corporate team/approvals/budgets/activity tables, RLS on every new table, indexes, triggers.
2. **Regenerate `src/integrations/supabase/types.ts`** so the new tables are typed (otherwise TS will reject every new query).
3. **Smoke-test the live preview** route-by-route via the browser tool and read console + network for 4xx/5xx; fix any RLS or column mismatch found.

## Milestone B — Wire the orphan components into real routes

Mount each existing component where it belongs. No new components built here, just plumbing + small route shells:

| Component | Destination |
|---|---|
| `GroupOrders` | new `/_authenticated/group-orders` route + entry on dashboard |
| `EventPlanner` | new `/_authenticated/event-planner` route |
| `SubscriptionManager` | already on dashboard — verify it works post-migration |
| `LoyaltyPoints` | already on dashboard — verify tier data shows |
| `NotificationPreferences` | new `/_authenticated/notifications` route |
| `OrderTracking` | embed inside `_authenticated/orders.$id.tsx` |
| `ProductReviews` | embed in `product.$id.tsx` |
| `OrderCustomizationDialog` | trigger from product detail "Customize" CTA |
| `RefundRequest` + `DisputeComments` | embed in order detail when status allows |
| `PaymentSplitting` | option in checkout for group orders |
| `SearchFilters` | embed in `/browse` and `/search` |
| `AddressValidation` | embed in checkout + addresses form |
| `CorporateTeamManagement` | new `/_authenticated/corporate` route |
| `BlogCMS` | new `/_authenticated/admin/blog` route (admin-only) |
| `TheCellar` | replace static `/cellar` content or embed below hero |

Add the new routes to the header/dashboard nav so users can reach them.

## Milestone C — Cinematic 3D drinks journey (your /skill-creation brief)

Layer the immersive experience on top of the now-working app. Built incrementally so we don't regress functionality.

**Foundation:**
- Install `framer-motion` (have), `gsap`, `@studio-freight/lenis`, `@react-three/fiber`, `@react-three/drei`, `three`, `@tsparticles/react`.
- Global `LenisProvider` in `__root.tsx` for smooth scroll.
- GSAP + ScrollTrigger registration helper.

**Home page (`/`) cinematic rebuild:**
- Hero: keep premium image/video bg, layered glass nav, ambient floating particles, parallax headline.
- Section 2 onward: `<Canvas>` with a single hero **3D bottle** that travels with scroll. Use ScrollTrigger to swap GLB/material as user scrolls through categories: Wine → Champagne → Whiskey → Cola → Water → Energy → Juice → Cocktail.
- Each section is its own "environment": background gradient, lighting rig, particle palette, label all animated. Liquid/dissolve transitions between bottles via shader (custom OGL/Three material with noise dissolve + chromatic blend).
- Pinned scroll scenes for category storytelling; cursor-reactive bottle rotation.
- Mobile: degrade to a smaller bottle + reduced particle count; preserve scroll storytelling.

**Cross-site polish:**
- Lenis smooth scroll site-wide.
- Replace harsh page transitions with crossfade + slide (framer-motion `AnimatePresence` at route level).
- Premium hover/tap micro-interactions on cards, buttons, nav.
- Ambient floating motion on category cards, vendor cards, cellar hero.
- Glassmorphism pass on header, drawers, dialogs.

**Performance guardrails:**
- Lazy-load `@react-three/fiber` scene with Suspense; only mount when in viewport.
- `useReducedMotion` respected — fall back to static hero for users who opted out.
- Compressed `.glb` bottles (Draco) ≤ 300KB each; share one geometry + swap materials/labels.
- FPS budget: target 60 desktop / 30+ mobile; visible perf monitor in dev only.

## Risks / what I'll need from you

- The migration is large. If anything in it conflicts with manual DB edits you made outside of Lovable, I'll need to reconcile — I'll surface conflicts before forcing through.
- 3D bottle GLB assets: I can either generate stylized stand-ins, or you upload the real bottle models. Stand-ins keep us moving; real assets land at the polish pass.
- Some flows (Paystack split, Resend emails) still need `PAYSTACK_SECRET_KEY` / `RESEND_API_KEY` to truly work end-to-end. I'll mock-pass where keys are missing and call them out.

## Order of work when you approve

1. Migration + types regen (Milestone A).
2. Browser-test every flow, fix what breaks.
3. Wire orphan components (Milestone B), test again.
4. Install 3D stack + Lenis, ship cinematic home page (Milestone C – pass 1).
5. Cross-site motion polish (Milestone C – pass 2).
