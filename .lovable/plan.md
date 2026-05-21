# SipCellar — Drinks Marketplace Build Plan

A reality check first: this vision is ~30 pages, 20+ DB tables, payments, AI, real-time tracking, group ordering, admin panel. **One chat turn cannot ship all of it without breaking.** I'll build it in 4 milestones, each a separate turn so we can test before moving on. Approve this plan and we start Milestone 1 immediately.

---

## Design system (applied throughout)

- **Vibe:** Premium dark bottle-shop. Deep blacks, champagne gold accents, editorial serif display + clean sans body.
- **Tokens (in `src/styles.css`):** `--background` near-black, `--primary` champagne gold, `--accent` deep burgundy, `--card` charcoal. All oklch.
- **Fonts:** Cormorant Garamond (display) + Inter (body).
- **Components:** Custom Button variants (`hero`, `gold`, `ghost-gold`), custom Card with subtle gold border-gradient.

---

## Milestone 1 — Foundation, schema, auth, design system

**Database (full schema, all 20+ tables in one migration):**
- `profiles` (linked to auth.users), `user_roles` + `app_role` enum (`customer`, `vendor`, `admin`) with `has_role()` security-definer function
- `corporate_accounts`, `vendors`, `categories`, `products`, `packages`, `bundles`
- `orders`, `order_items`, `bookings`, `vendor_slots`
- `reviews`, `payouts`, `disputes`, `referrals`, `loyalty_points`, `flash_deals`, `notifications`, `waitlists`, `addresses`
- RLS on every table. Storage buckets: `vendor-logos`, `product-images`, `proof-of-delivery`.
- Trigger to auto-create profile + assign `customer` role on signup.

**Auth & routing:**
- `/login`, `/signup` (email/password + Google)
- `_authenticated` layout guard; role-based subtree guards
- Public routes: landing, browse, vendor profile, product detail, search, categories, flash deals, the cellar, blog, contact, FAQ, about, how-it-works (×2)
- Premium landing page with hero, category showcase, featured vendors, testimonials, footer

**Deliverable:** Anyone can sign up, browse the landing page, and the full DB is ready for everything that comes next.

---

## Milestone 2 — Customer ordering loop + Paystack

- Vendor profile page, product detail page, browse + search + filters
- Cart (Zustand), checkout flow, saved addresses
- **Paystack split payments** via server function (requires `PAYSTACK_SECRET_KEY` — I'll request when we get here)
- Order confirmation, customer dashboard, order tracking with status timeline, order history, reorder
- Reviews (SipScore: 5 sub-scores)
- Resend transactional emails (requires `RESEND_API_KEY`)

---

## Milestone 3 — Vendor side + Admin panel

- Vendor onboarding multi-step form → admin approval queue
- Vendor dashboard: catalogue manager, bulk CSV upload, order management, booking calendar, availability slots, analytics, payout tracker, flash deal creator, package/bundle builder, reviews received
- Admin panel at `/x-control`: vendor approve/suspend/feature, dispute resolution, payouts, commission settings, GMV dashboard, announcements broadcaster, audit log

---

## Milestone 4 — Differentiators + polish

- **DrinkBoard AI event planner** (Lovable AI Gateway — already have `LOVABLE_API_KEY`)
- Group order pooling with share links
- Pre-built event packages, custom bundles, budget calculator
- Loyalty points + redemption, referral program, waitlists, favourites, wishlists
- Subscription packs (recurring orders)
- Corporate accounts (team profiles, spending limits, approval workflows)
- PWA setup (installable, offline shell, web push notifications)
- Google Maps integration for coverage zones (requires `GOOGLE_MAPS_API_KEY`)
- Termii SMS (requires `TERMII_API_KEY`)
- PostHog analytics (requires `POSTHOG_API_KEY`)
- SEO: sitemap.xml, robots.txt, per-route meta, JSON-LD for products/vendors

---

## API keys you'll need to add (when we reach each milestone)

| Milestone | Secret | Where to get it |
|---|---|---|
| 2 | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | paystack.com → Settings → API Keys |
| 2 | `RESEND_API_KEY` | resend.com → API Keys |
| 4 | `GOOGLE_MAPS_API_KEY` | Google Cloud Console |
| 4 | `TERMII_API_KEY` | termii.com dashboard |
| 4 | `POSTHOG_API_KEY` | posthog.com project settings |

`LOVABLE_API_KEY` is already set (for DrinkBoard AI).

---

## Tech notes (skip if non-technical)

- TanStack Start file-based routing under `src/routes/`. Each public section = own route file (SEO).
- Server logic = `createServerFn` (NOT Supabase Edge Functions). Paystack init/verify, AI calls, admin actions all live there.
- Roles in dedicated `user_roles` table with `has_role()` security-definer function (prevents privilege-escalation; never store role on `profiles`).
- React Query for server state, Zustand for cart/UI state, React Hook Form + Zod for forms.
- Real-time order tracking via Supabase Realtime channels on `orders` table.

---

## What I need from you to start

Just approve this plan. I'll begin Milestone 1 (schema + auth + design system + landing + all public route shells) in the next turn. We test it works, then move to M2.

Heads up: each milestone is a substantial build. Expect to spend several chat turns per milestone iterating on bugs, copy, and design tweaks. That's normal for a project of this size — and far safer than trying to ship everything at once.