import { createFileRoute, redirect, Outlet, isRedirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw redirect({ to: "/login", search: { redirect: location.href } });
      }
    } catch (err) {
      // Re-throw intentional redirects; swallow transient network failures so
      // a flaky Supabase call doesn't blank the whole authenticated section.
      if (isRedirect(err)) throw err;
      // Fall through — if there's truly no session the next read will redirect.
    }
  },
  component: () => <Outlet />,
});
