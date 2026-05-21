import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DrinqInk" },
      { name: "description", content: "DrinqInk is Nigeria's universal drinks marketplace, connecting customers with vetted vendors nationwide." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell eyebrow="About" title="A better way to pour." subtitle="DrinqInk exists because Nigeria's drinks scene deserves a single, trusted, beautiful place to discover, compare and order — from daily essentials to The Cellar's rarest bottles.">
      <div className="prose prose-invert max-w-3xl mt-10 text-muted-foreground space-y-6 leading-relaxed">
        <p>
          We started in Lagos with a simple frustration: ordering drinks for an event or restocking office supplies meant ringing five vendors, comparing prices over WhatsApp, second-guessing quality, and crossing fingers on delivery. Every step deserved better.
        </p>
        <p>
          Today, DrinqInk gives hosts, hotels, offices, lounges, and collectors one unified marketplace — every vendor vetted, every payment escrow-protected, and every rating tracked on SipScore (evaluating packaging, accuracy, and value). From an ice-cold beer crate or soda bulk to a rare single malt, it flows through the same seamless door.
        </p>
        <p>
          Lagos first. Nigeria-bound. Africa-destined.
        </p>
      </div>
    </PageShell>
  );
}
