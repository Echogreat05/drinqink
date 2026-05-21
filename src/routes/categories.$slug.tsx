import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { GlassWater } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — DrinqInk` },
      { name: "description", content: `Browse ${params.slug} from verified vendors on DrinqInk.` },
    ],
  }),
  component: CategoryDetailPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  vendor_id: string;
};

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const [name, setName] = useState(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id,name")
        .eq("slug", slug)
        .maybeSingle();
      if (!cat) {
        setLoading(false);
        return;
      }
      setName(cat.name);
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,slug,price,images,vendor_id")
        .eq("category_id", cat.id)
        .eq("is_active", true)
        .limit(60);
      setProducts(prods ?? []);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen font-sans">
      <SiteHeader />
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
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
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
              Category
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light capitalize">
              {name}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-card border border-border/50 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-center py-20"
            >
              No products in this category yet — check back soon.
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="group relative p-4 sm:p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow flex flex-col gap-3 overflow-hidden"
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 aspect-square rounded-lg border border-border/50 bg-onyx flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <GlassWater className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                      )}
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h3 className="font-display text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-primary font-semibold">₦{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
