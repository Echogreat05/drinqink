## Goal
Restore the app so it loads reliably in Lovable preview, stop the deployed site from failing, and then verify every major user flow end-to-end.

## What I found
- **Lovable preview is not consistently hard-down right now**: the current preview renders the landing page, which means the failure is likely **intermittent or route/import specific**, not a total missing app.
- **There is a strong SSR risk in shared code**: `src/stores/cart.ts` creates a persisted Zustand store at module scope, and that store is imported by `CartButton` → `SiteHeader` → landing page and other routes. That is a classic cause of **blank pages / SSR crashes / hydration failures** when browser storage is touched during server render.
- **Your Vercel site is a separate issue**: `https://drinqink.vercel.app/` returns a raw **Vercel 404 NOT_FOUND**, which means Vercel is currently **not serving this app at all**. That is a deployment/config issue, not the same runtime failure as preview.

## Plan
1. **Stabilize the shared runtime path**
   - Audit and patch all globally imported, SSR-sensitive code used by the root route and landing page.
   - Start with the cart/header stack and any other browser-only logic in shared imports.
   - Make persisted client state safe for SSR so the app can render on first load without crashing.

2. **Harden root-level error handling and route bootstrap**
   - Verify the root/router wiring is consistent for SSR, auth refresh, and loader invalidation.
   - Check routes/components that can throw before user interaction and make sure failures surface cleanly instead of blanking the app.
   - Confirm the error fallback and retry path work when a route actually fails.

3. **Run a route-by-route production audit in Lovable preview**
   - Re-test the main public routes and authenticated surfaces.
   - Validate that navigation, buttons, loaders, forms, cart interactions, auth redirects, and server-backed features behave correctly.
   - Fix any route-specific regressions uncovered during the audit.

4. **Fix the Vercel deployment as a separate environment problem**
   - Diagnose why Vercel is serving `NOT_FOUND` instead of the app.
   - Add the correct deployment/runtime configuration for this TanStack Start app, or remove the mismatch if Vercel is pointing at the wrong output/root.
   - Re-verify the live Vercel URL after the runtime fixes are in place.

5. **Final end-to-end verification**
   - Re-test preview and Vercel after fixes.
   - Confirm the landing page loads, recovery buttons work, and core marketplace flows are usable.
   - Deliver a concise report of what was broken, what was fixed, and what was verified.

## Technical focus
- `src/stores/cart.ts` SSR-safe persistence
- `src/components/CartButton.tsx` / `src/components/SiteHeader.tsx` shared import chain
- root/router bootstrap and error handling
- route-level runtime regressions across public + authenticated flows
- Vercel deployment config serving the wrong thing (`404 NOT_FOUND`)

## Expected outcome
- No more blank/internal-server-error preview loads
- Working landing page and route navigation
- Functional core flows across preview
- Vercel serving the app instead of a raw 404