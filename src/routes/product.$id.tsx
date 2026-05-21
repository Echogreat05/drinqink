import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wine, Minus, Plus, ShoppingBag } from "lucide-react";
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

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [{ title: "Product — SipCellar" }],
  }),
  component: ProductPage,
});

type Product = {
  id: string; name: string; description: string | null; price: number; min_qty: number;
  images: string[]; abv: number | null; volume_ml: number | null; stock_status: string;
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
        const { data: v } = await supabase.from("vendors").select("slug,business_name").eq("id", p.vendor_id).maybeSingle();
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
      customization,
    });
    toast.success(`Added ${qty} × ${product.name}`);
  };

  if (!product) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="pt-40 container mx-auto px-6"><div className="h-96 rounded-lg bg-card animate-pulse" /></div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="aspect-square rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden luxe-shadow">
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <Wine className="h-24 w-24 text-primary" />}
            </div>

            <div className="space-y-6">
              {vendor && (
                <Link to="/vendor/$slug" params={{ slug: vendor.slug }} className="text-xs tracking-widest uppercase text-primary hover:underline">← {vendor.business_name}</Link>
              )}
              <h1 className="font-display text-4xl lg:text-6xl font-light leading-tight">{product.name}</h1>
              <p className="text-3xl text-gradient-gold font-display">₦{product.price.toLocaleString()}</p>

              <div className="flex flex-wrap gap-2 text-xs">
                {product.abv && <span className="px-3 py-1 rounded-full border border-border text-muted-foreground">{product.abv}% ABV</span>}
                {product.volume_ml && <span className="px-3 py-1 rounded-full border border-border text-muted-foreground">{product.volume_ml}ml</span>}
                <span className={`px-3 py-1 rounded-full border ${product.stock_status === "in_stock" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                  {product.stock_status.replace("_", " ")}
                </span>
              </div>

              {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Quantity (min {product.min_qty})</p>
                  <FavoriteButton type="product" itemId={product.id} />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost-gold" size="icon" onClick={() => setQty(Math.max(product.min_qty, qty - 1))}><Minus /></Button>
                  <span className="w-12 text-center font-display text-2xl">{qty}</span>
                  <Button variant="ghost-gold" size="icon" onClick={() => setQty(qty + 1)}><Plus /></Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCustomizationOpen(true)}>
                    Customize
                  </Button>
                  <Button variant="hero" size="xl" className="flex-1" onClick={addToCart} disabled={product.stock_status === "out_of_stock"}>
                    <ShoppingBag /> Add to cart — ₦{(product.price * qty).toLocaleString()}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <ProductReviews productId={product.id} />
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
