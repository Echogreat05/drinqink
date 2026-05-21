import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, ShoppingBag, Store, Shield, Wine, Sparkles, MapPin, Award, Share2, CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoyaltyPoints } from "@/components/LoyaltyPoints";
import { ReferralProgram } from "@/components/ReferralProgram";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SipCellar" }] }),
  component: DashboardPage,
});

type Role = "customer" | "vendor" | "admin";

function DashboardPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      setName(profile?.display_name ?? user.email ?? "Guest");
      setRoles((roleRows ?? []).map((r: { role: string }) => r.role as Role));
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/" });
  };

  const isVendor = roles.includes("vendor");
  const isAdmin = roles.includes("admin");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-2">Welcome back</p>
              <h1 className="font-display text-4xl lg:text-6xl font-light">
                Hello, <span className="italic text-gradient-gold">{loading ? "…" : name}</span>.
              </h1>
            </div>
            <Button variant="ghost-gold" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashCard to="/browse" icon={Wine} title="Browse marketplace" body="Discover vendors and bottles across Nigeria." />
            <DashCard to="/cellar" icon={Sparkles} title="The Cellar" body="Rare and curated premium selections." />
            <DashCard to="/orders" icon={ShoppingBag} title="My orders" body="Track active orders and view history." />
            <DashCard to="/addresses" icon={MapPin} title="Addresses" body="Manage your saved delivery addresses." />

            {isVendor ? (
              <DashCard to="/vendor-dashboard" icon={Store} title="Vendor dashboard" body="Manage catalogue, orders and payouts." accent />
            ) : (
              <DashCard to="/vendor-onboarding" icon={Store} title="Become a vendor" body="Start selling on SipCellar." />
            )}

            {isAdmin && (
              <DashCard to="/admin" icon={Shield} title="Admin panel" body="Platform oversight & controls." accent />
            )}
          </div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl">Loyalty Rewards</h3>
              </div>
              <LoyaltyPoints />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl">Referral Program</h3>
              </div>
              <ReferralProgram />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl">Subscriptions</h3>
              </div>
              <SubscriptionManager />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl">Notification Preferences</h3>
              </div>
              <NotificationPreferences />
            </CardContent>
          </Card>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function DashCard({ to, icon: Icon, title, body, accent }: { to: string; icon: typeof Wine; title: string; body: string; accent?: boolean }) {
  return (
    <Link to={to as never} className={`group relative p-8 rounded-lg border transition-all duration-300 ${accent ? "border-primary/40 bg-card" : "border-border bg-card hover:border-primary/40"}`}>
      <Icon className={`h-7 w-7 mb-5 ${accent ? "text-primary" : "text-foreground/70 group-hover:text-primary"} transition-colors`} />
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
