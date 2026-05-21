import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Drink Culture — SipCellar Journal" },
      { name: "description", content: "Stories, pairings, and tasting notes from Nigeria's vendor community." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <PageShell
      eyebrow="Journal"
      title="Drink culture."
      subtitle="Stories, pairings and tasting notes from Nigeria's vendor community. Coming soon."
    >
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[1, 2, 3].map((n) => (
          <article key={n} className="p-6 rounded-lg border border-border bg-card opacity-60">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">Coming soon</p>
            <h3 className="font-display text-2xl mb-2">Story #{n}</h3>
            <p className="text-sm text-muted-foreground">Vendor interviews, vintage spotlights, pairing guides.</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
