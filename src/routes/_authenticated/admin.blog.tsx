import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BlogCMS } from "@/components/BlogCMS";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Blog CMS — DrinqInk" }] }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Editorial</p>
          <h1 className="font-display text-4xl lg:text-6xl font-light mb-10">Blog <span className="italic text-gradient-gold">CMS</span></h1>
          <BlogCMS />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});
