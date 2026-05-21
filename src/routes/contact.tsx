import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — DrinqInk" },
      { name: "description", content: "Reach the DrinqInk team for support, partnerships, or press." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="We're listening." subtitle="Reach us any way you like — we respond within one business day.">
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[
          { icon: Mail, title: "Email", value: "hello@drinqink.com" },
          { icon: Phone, title: "Phone", value: "+234 800 DRINQINK" },
          { icon: MessageSquare, title: "Live chat", value: "Mon–Sat, 9am–9pm WAT" },
        ].map((c) => (
          <div key={c.title} className="p-8 rounded-lg border border-border bg-card">
            <c.icon className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-xl mb-1">{c.title}</h3>
            <p className="text-muted-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
