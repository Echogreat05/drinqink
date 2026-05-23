import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GroupOrders } from "@/components/GroupOrders";

export const Route = createFileRoute("/_authenticated/group-orders")({
  head: () => ({ meta: [{ title: "Group Orders — DrinqInk" }] }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Together</p>
          <h1 className="font-display text-4xl lg:text-6xl font-light mb-10">Group <span className="italic text-gradient-gold">orders</span></h1>
          <GroupOrders />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});
