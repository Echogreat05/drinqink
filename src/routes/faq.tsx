import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

const FAQS = [
  { q: "Do I need an account to order?", a: "You can browse without an account. Checkout requires sign-up so we can deliver and contact you about your order." },
  { q: "Which areas do you cover?", a: "Vendors set their own coverage states. Use the browse filter to see who delivers to you." },
  { q: "How are payments protected?", a: "Funds are held in escrow and released to the vendor once you confirm delivery. Disputes are handled by our team." },
  { q: "How do I become a vendor?", a: "Go to 'For vendors' and complete the multi-step onboarding. Approval takes 1–3 business days." },
  { q: "What's The Cellar?", a: "A curated section for rare bottles, vintages and limited releases — vetted by sommeliers." },
  { q: "Can I cancel an order?", a: "Yes, before the vendor accepts and starts packing. Once dispatched, contact support to raise an issue." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — DrinqInk" },
      { name: "description", content: "Frequently asked questions about ordering, delivery, vendors and payments on DrinqInk." },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <PageShell eyebrow="FAQ" title="Good questions." subtitle="Everything you wanted to know — and a few things you didn't.">
      <div className="divide-y divide-border border-y border-border mt-8">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-6">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
              <span className="font-display text-2xl group-hover:text-primary transition-colors">{f.q}</span>
              <span className="text-primary text-3xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
