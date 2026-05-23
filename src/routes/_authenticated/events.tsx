import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventPlanner } from "@/components/EventPlanner";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Event Planner — DrinqInk" }] }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Curated</p>
          <h1 className="font-display text-4xl lg:text-6xl font-light mb-10">Event <span className="italic text-gradient-gold">planner</span></h1>
          <EventPlanner />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});
