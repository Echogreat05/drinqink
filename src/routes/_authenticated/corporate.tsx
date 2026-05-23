import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CorporateTeamManagement } from "@/components/CorporateTeamManagement";

export const Route = createFileRoute("/_authenticated/corporate")({
  head: () => ({ meta: [{ title: "Corporate — DrinqInk" }] }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Enterprise</p>
          <h1 className="font-display text-4xl lg:text-6xl font-light mb-10">Corporate <span className="italic text-gradient-gold">accounts</span></h1>
          <CorporateTeamManagement />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});
