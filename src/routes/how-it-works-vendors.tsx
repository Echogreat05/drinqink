import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works-vendors")({
  head: () => ({
    meta: [
      { title: "Sell on DrinqInk — For Vendors" },
      { name: "description", content: "Reach customers across Nigeria. Manage catalogue, orders, payouts and promotions in one dashboard." },
    ],
  }),
  component: VendorHowPage,
});

const PERKS = [
  { title: "Reach", body: "Nationwide visibility across 36 states. Customers find you through search, category browse, and featured placements." },
  { title: "Tools", body: "Catalogue manager, booking calendar, flash deal creator, bundle builder, analytics dashboard." },
  { title: "Trust", body: "Escrow payments, verified vendor badges, dispute mediation, and transparent payout tracking." },
  { title: "Insights", body: "Top sellers, peak times, repeat-customer rate. Know what works." },
  { title: "Promotion", body: "Featured slots, flash deals, referral discounts. Grow on your schedule." },
  { title: "Fair commission", body: "Standard 8–12%. No hidden fees. You set your prices." },
];

function VendorHowPage() {
  return (
    <PageShell eyebrow="For vendors" title="Sell on DrinqInk." subtitle="Join Nigeria's universal drinks marketplace. Onboarding takes 10 minutes — approval in 1–3 business days.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {PERKS.map((p) => (
          <div key={p.title} className="p-8 rounded-lg border border-border bg-card">
            <h3 className="font-display text-2xl mb-3 text-primary">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 p-10 rounded-2xl border border-primary/30 bg-card text-center">
        <h2 className="font-display text-3xl lg:text-4xl mb-3">Ready to start?</h2>
        <p className="text-muted-foreground mb-6">Create your account, then complete vendor onboarding from your dashboard.</p>
        <Button asChild variant="hero" size="xl"><Link to="/signup">Apply as a vendor</Link></Button>
      </div>
    </PageShell>
  );
}
