import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, GlassWater, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — DrinqInk" },
      {
        name: "description",
        content:
          "Browse drinks by category: beer, soft drinks, water crates, cocktails, spirits, wine, and more.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cats, setCats] = useState<
    { id: string; name: string; slug: string; description: string | null }[]
  >([]);
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,slug,description")
      .order("display_order")
      .then(({ data }: { data: typeof cats | null }) => setCats(data ?? []));
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <SiteHeader />
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-12 sm:mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
              By category
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05]">
              Explore by <span className="italic text-gradient-gold">style</span>.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {cats.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="group relative p-6 sm:p-8 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow aspect-[5/3] flex flex-col justify-between overflow-hidden"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <GlassWater className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="font-display text-2xl sm:text-3xl mb-1">{c.name}</h2>
                    <motion.div
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      whileInView={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Browse category <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
