import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wine, ArrowLeft, Star, RotateCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";
import { OrderTracking } from "@/components/OrderTracking";
import { RefundRequest } from "@/components/RefundRequest";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order — SipCellar" }] }),
  component: OrderDetailPage,
});

type Order = {
  id: string; order_number: string; status: string; subtotal: number; service_fee: number;
  delivery_fee: number; total_amount: number; created_at: string; notes: string | null;
  delivery_address: { recipient_name?: string; phone?: string; street?: string; area?: string; city?: string; state?: string } | null;
  vendor_id: string;
};
type OrderItem = { id: string; product_id: string | null; product_name: string; unit_price: number; quantity: number; line_total: number };

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

function OrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [vendor, setVendor] = useState<{ business_name: string; slug: string } | null>(null);
  const [existingReview, setExistingReview] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      setOrder(o as Order | null);
      if (o) {
        const [{ data: it }, { data: v }, { data: { user } }] = await Promise.all([
          supabase.from("order_items").select("*").eq("order_id", id),
          supabase.from("vendors").select("business_name,slug").eq("id", o.vendor_id).maybeSingle(),
          supabase.auth.getUser(),
        ]);
        setItems((it ?? []) as OrderItem[]);
        setVendor(v);
        if (user) {
          const { data: r } = await supabase.from("reviews").select("id").eq("order_id", id).eq("customer_id", user.id).maybeSingle();
          setExistingReview(!!r);
        }
      }
    })();
  }, [id]);

  const reorder = async () => {
    if (!order || !vendor) return;
    const productIds = items.map((i) => i.product_id).filter(Boolean) as string[];
    if (productIds.length === 0) return toast.error("Items no longer available");
    const { data: products } = await supabase.from("products").select("id,name,price,images,min_qty,vendor_id").in("id", productIds).eq("is_active", true);
    let added = 0;
    for (const i of items) {
      const p = (products ?? []).find((x) => x.id === i.product_id);
      if (!p) continue;
      add({
        product_id: p.id,
        vendor_id: p.vendor_id,
        vendor_name: vendor.business_name,
        name: p.name,
        price: Number(p.price),
        image: p.images?.[0] ?? null,
        qty: i.quantity,
        min_qty: p.min_qty,
      });
      added++;
    }
    toast.success(`${added} item${added !== 1 ? "s" : ""} added to cart`);
    navigate({ to: "/checkout" });
  };

  if (!order) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="pt-40 container mx-auto px-6"><div className="h-80 rounded-lg bg-card animate-pulse" /></div>
        <SiteFooter />
      </div>
    );
  }

  const currentStep = STATUSES.indexOf(order.status);
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
          <Link to="/orders" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary hover:underline mb-6"><ArrowLeft className="h-3 w-3" /> All orders</Link>

          <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-2">Order</p>
              <h1 className="font-display text-4xl lg:text-5xl font-light">#{order.order_number}</h1>
              <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost-gold" onClick={reorder}><RotateCw className="h-4 w-4" /> Reorder</Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 rounded-lg border border-border bg-card mb-8">
            <h2 className="font-display text-xl mb-6">Status</h2>
            <div className="flex justify-between relative">
              <div className="absolute top-3 left-3 right-3 h-px bg-border" />
              <div className="absolute top-3 left-3 h-px bg-primary transition-all" style={{ width: `calc(${(currentStep / (STATUSES.length - 1)) * 100}% - 1.5rem)` }} />
              {STATUSES.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2" style={{ flex: 1 }}>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${i <= currentStep ? "bg-primary border-primary" : "bg-card border-border"}`}>
                    {i <= currentStep && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest text-center ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>{s.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="p-6 rounded-lg border border-border bg-card">
                <h2 className="font-display text-xl mb-4">Items {vendor && <span className="text-sm text-muted-foreground font-sans">from <Link to="/vendor/$slug" params={{ slug: vendor.slug }} className="text-primary hover:underline">{vendor.business_name}</Link></span>}</h2>
                <div className="space-y-3">
                  {items.map((i) => (
                    <div key={i.id} className="flex justify-between items-start text-sm pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <Wine className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate">{i.product_name}</p>
                          <p className="text-xs text-muted-foreground">{i.quantity} × ₦{Number(i.unit_price).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-primary shrink-0">₦{Number(i.line_total).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              {order.delivery_address && (
                <section className="p-6 rounded-lg border border-border bg-card">
                  <h2 className="font-display text-xl mb-3">Delivery to</h2>
                  <p className="text-sm">{order.delivery_address.recipient_name} · {order.delivery_address.phone}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.delivery_address.street}{order.delivery_address.area ? `, ${order.delivery_address.area}` : ""}, {order.delivery_address.city}, {order.delivery_address.state}
                  </p>
                  {order.notes && <p className="text-sm text-muted-foreground mt-3 italic">"{order.notes}"</p>}
                </section>
              )}

              <OrderTracking orderId={order.id} />

              {isDelivered && !existingReview && (
                <ReviewForm orderId={order.id} vendorId={order.vendor_id} onDone={() => setExistingReview(true)} />
              )}
              {existingReview && (
                <div className="p-6 rounded-lg border border-primary/30 bg-card text-sm text-primary">
                  ★ You've reviewed this order. Thanks!
                </div>
              )}

              <RefundRequest orderId={order.id} />
            </div>

            <aside>
              <div className="p-6 rounded-lg border border-primary/30 bg-card space-y-3 sticky top-28">
                <h2 className="font-display text-xl">Summary</h2>
                <Row label="Subtotal" value={order.subtotal} />
                <Row label="Delivery" value={order.delivery_fee} />
                <Row label="Service fee" value={order.service_fee} />
                <div className="h-px bg-border" />
                <Row label="Total" value={order.total_amount} large />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value, large }: { label: string; value: number; large?: boolean }) {
  return (
    <div className={`flex justify-between ${large ? "text-base" : "text-sm"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={large ? "font-display text-gradient-gold text-xl" : ""}>₦{Number(value).toLocaleString()}</span>
    </div>
  );
}

const SCORE_KEYS = [
  { key: "quality_score", label: "Quality" },
  { key: "delivery_score", label: "Delivery" },
  { key: "packaging_score", label: "Packaging" },
  { key: "communication_score", label: "Communication" },
  { key: "value_score", label: "Value" },
] as const;

function ReviewForm({ orderId, vendorId, onDone }: { orderId: string; vendorId: string; onDone: () => void }) {
  const [scores, setScores] = useState<Record<string, number>>({ quality_score: 5, delivery_score: 5, packaging_score: 5, communication_score: 5, value_score: 5 });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId, vendor_id: vendorId, customer_id: user.id, comment: comment || null,
      quality_score: scores.quality_score, delivery_score: scores.delivery_score,
      packaging_score: scores.packaging_score, communication_score: scores.communication_score,
      value_score: scores.value_score,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review submitted");
    onDone();
  };

  return (
    <form onSubmit={submit} className="p-6 rounded-lg border border-primary/30 bg-card space-y-4">
      <h2 className="font-display text-2xl">Rate this order</h2>
      <p className="text-xs text-muted-foreground -mt-2">SipScore — five dimensions, 1–5 each.</p>
      {SCORE_KEYS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm">{label}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setScores((p) => ({ ...p, [key]: n }))} aria-label={`${label} ${n}`}>
                <Star className={`h-5 w-5 ${n <= scores[key] ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment…" className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <Button type="submit" variant="hero" disabled={submitting} className="w-full">{submitting ? "Submitting…" : "Submit review"}</Button>
    </form>
  );
}
