import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wine, Minus, Plus, ShoppingBag, ChevronRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductReviews } from "@/components/ProductReviews";
import {
  OrderCustomizationDialog,
  type OrderCustomization,
} from "@/components/OrderCustomizationDialog";
import { motion } from "framer-motion";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [{ title: "Product — SipCellar" }],
  }),
  component: ProductPage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  min_qty: number;
  images: string[];
  abv: number | null;
  volume_ml: number | null;
  stock_status: string;
  vendor_id: string;
};

function ProductPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [vendor, setVendor] = useState<{ slug: string; business_name: string } | null>(null);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [customization, setCustomization] = useState<OrderCustomization | null>(null);
  const add = useCart((s) => s.add);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from("products")
        .select("id,name,description,price,min_qty,images,abv,volume_ml,stock_status,vendor_id")
        .eq("id", id)
        .maybeSingle();
      setProduct(p);
      if (p) {
        setQty(p.min_qty);
        const { data: v } = await supabase
          .from("vendors")
          .select("slug,business_name")
          .eq("id", p.vendor_id)
          .maybeSingle();
        setVendor(v);
      }
    })();
  }, [id]);

  const addToCart = () => {
    if (!product || !vendor) return;
    add({
      product_id: product.id,
      vendor_id: product.vendor_id,
      vendor_name: vendor.business_name,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? null,
      qty,
      min_qty: product.min_qty,
    });
    toast.success(`Added ${qty} × ${product.name}`);
  };

  if (!product) {
    return (
      <div className="min-h-screen font-sans">
        <SiteHeader />
        <div className="pt-24 sm:pt-40 container mx-auto px-4 sm:px-6">
          <div className="h-96 rounded-xl bg-card animate-pulse" />
        </div>
        <SiteFooter />
      </div>
    );
  }

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
            className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="aspect-square rounded-xl border border-border/50 bg-card flex items-center justify-center overflow-hidden luxe-shadow group"
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <Wine className="h-24 w-24 text-primary" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-5 sm:space-y-6"
            >
              {vendor && (
                <Link
                  to="/vendor/$slug"
                  params={{ slug: vendor.slug }}
                  className="text-xs tracking-[0.15em] uppercase text-primary hover:underline flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  {vendor.business_name}
                </Link>
              )}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl text-gradient-gold font-display">
                ₦{product.price.toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                {product.abv && (
                  <span className="px-3 py-1 rounded-full border border-border/50 text-muted-foreground">
                    {product.abv}% ABV
                  </span>
                )}
                {product.volume_ml && (
                  <span className="px-3 py-1 rounded-full border border-border/50 text-muted-foreground">
                    {product.volume_ml}ml
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full border ${
                    product.stock_status === "in_stock"
                      ? "border-primary/40 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {product.stock_status.replace("_", " ")}
                </span>
              </div>

              {product.description && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="space-y-4 sm:space-y-5 pt-4 border-t border-border/50">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Quantity (min {product.min_qty})
                  </p>
                  <FavoriteButton type="product" itemId={product.id} />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost-gold"
                    size="icon"
                    onClick={() => setQty(Math.max(product.min_qty, qty - 1))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-12 text-center font-display text-2xl">{qty}</span>
                  <Button variant="ghost-gold" size="icon" onClick={() => setQty(qty + 1)}>
                    <Plus />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCustomizationOpen(true)}>
                    Customize
                  </Button>
                  <Button
                    variant="hero"
                    size="xl"
                    className="flex-1 group"
                    onClick={addToCart}
                    disabled={product.stock_status === "out_of_stock"}
                  >
                    <ShoppingBag />
                    Add to cart — ₦{(product.price * qty).toLocaleString()}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ProductReviews productId={product.id} />
          </motion.div>
        </div>
      </section>

      <SiteFooter />
      <OrderCustomizationDialog
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        onSave={setCustomization}
        productName={product.name}
      />
    </div>
  );
}
