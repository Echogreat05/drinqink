import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — DrinqInk" },
      { name: "description", content: "How to order drinks on DrinqInk: discover, book, receive." },
    ],
  }),
  component: HowItWorksPage,
});

const STEPS = [
  { n: "01", title: "Discover", body: "Browse vetted vendors by category, state, rating or budget. Filter, compare, decide." },
  { n: "02", title: "Curate", body: "Pick individual bottles, choose a vendor event package, build a custom bundle, or let DrinkBoard AI plan your event end-to-end." },
  { n: "03", title: "Book", body: "Select a delivery slot from the vendor's calendar. Add a delivery address and any notes." },
  { n: "04", title: "Pay safely", body: "Funds go into escrow via Paystack. The vendor doesn't get paid until you confirm receipt." },
  { n: "05", title: "Track", body: "Real-time updates: confirmed → packing → dispatched → delivered. Photo on delivery." },
  { n: "06", title: "Review", body: "Rate across five dimensions: quality, packaging, communication, delivery, value. Help the next host." },
];

function HowItWorksPage() {
  return (
    <PageShell eyebrow="For customers" title="How it works." subtitle="Six steps from craving to clink. Order in minutes.">
      <div className="space-y-1 mt-12">
        {STEPS.map((s) => (
          <div key={s.n} className="grid md:grid-cols-[120px_1fr] gap-4 py-8 border-b border-border last:border-0">
            <div className="font-display text-5xl text-primary">{s.n}</div>
            <div>
              <h3 className="font-display text-3xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-wrap gap-4">
        <Button asChild variant="hero" size="lg"><Link to="/signup">Create your account</Link></Button>
        <Button asChild variant="ghost-gold" size="lg"><Link to="/browse">Browse first</Link></Button>
      </div>
    </PageShell>
  );
}
