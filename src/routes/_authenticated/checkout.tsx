import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Wine, Lock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart, type CartItem } from "@/stores/cart";
import { toast } from "sonner";

const SERVICE_FEE_RATE = 0.025; // 2.5%
const DELIVERY_FEE_PER_VENDOR = 1500;

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — SipCellar" }] }),
  component: CheckoutPage,
});

type Address = {
  id: string; label: string | null; recipient_name: string | null; phone: string | null;
  street: string; area: string | null; city: string; state: string; is_default: boolean;
};

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const itemsByVendor = useCart((s) => s.itemsByVendor());
  const clear = useCart((s) => s.clear);
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [addrId, setAddrId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      setAddrs((data ?? []) as Address[]);
      const def = (data ?? []).find((a) => a.is_default) ?? data?.[0];
      if (def) setAddrId(def.id);
    })();
  }, []);

  const vendorIds = Object.keys(itemsByVendor);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = vendorIds.length * DELIVERY_FEE_PER_VENDOR;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + deliveryFee + serviceFee;

  const placeOrder = async () => {
    if (!addrId) return toast.error("Pick a delivery address");
    if (items.length === 0) return toast.error("Cart is empty");
    setPlacing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPlacing(false); return; }
    const addr = addrs.find((a) => a.id === addrId)!;

    try {
      const createdOrderIds: string[] = [];
      for (const vendorId of vendorIds) {
        const vendorItems = itemsByVendor[vendorId];
        const sub = vendorItems.reduce((s, i) => s + i.price * i.qty, 0);
        const svc = Math.round(sub * SERVICE_FEE_RATE);
        const del = DELIVERY_FEE_PER_VENDOR;
        const grand = sub + svc + del;
        const commission = Math.round(sub * 0.10);

        const { data: order, error: oErr } = await supabase.from("orders").insert({
          customer_id: user.id,
          vendor_id: vendorId,
          status: "pending",
          subtotal: sub,
          service_fee: svc,
          delivery_fee: del,
          total_amount: grand,
          commission,
          vendor_payout: sub - commission,
          notes: notes || null,
          delivery_address: JSON.parse(JSON.stringify(addr)),
        }).select("id").single();

        if (oErr || !order) throw new Error(oErr?.message ?? "Order failed");

        const lineItems = vendorItems.map((i: CartItem) => ({
          order_id: order.id,
          product_id: i.product_id,
          product_name: i.name,
          unit_price: i.price,
          quantity: i.qty,
          line_total: i.price * i.qty,
        }));
        const { error: iErr } = await supabase.from("order_items").insert(lineItems);
        if (iErr) throw new Error(iErr.message);
        createdOrderIds.push(order.id);
      }

      clear();
      toast.success(`${createdOrderIds.length} order${createdOrderIds.length > 1 ? "s" : ""} placed — vendor will confirm shortly.`);
      navigate({ to: "/orders" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="pt-40 pb-20 text-center container mx-auto px-6">
          <Wine className="h-12 w-12 text-primary mx-auto opacity-50 mb-4" />
          <h1 className="font-display text-4xl mb-3">Your cart is empty</h1>
          <Button asChild variant="hero" className="mt-4"><Link to="/browse">Browse vendors</Link></Button>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-10 max-w-5xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-2">Checkout</p>
          <h1 className="font-display text-4xl lg:text-5xl font-light mb-10">Almost yours.</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-end justify-between mb-3">
                  <h2 className="font-display text-2xl">Delivery address</h2>
                  <Link to="/addresses" className="text-xs text-primary hover:underline">Manage</Link>
                </div>
                {addrs.length === 0 ? (
                  <div className="p-6 border border-dashed border-primary/40 rounded-lg text-center bg-card">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No addresses saved.</p>
                    <Button asChild variant="hero"><Link to="/addresses">Add address</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addrs.map((a) => (
                      <label key={a.id} className={`block p-4 rounded-lg border cursor-pointer transition ${addrId === a.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                        <input type="radio" name="addr" className="sr-only" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                        <p className="font-display text-base">{a.label ?? "Address"}</p>
                        <p className="text-sm text-muted-foreground">{a.recipient_name} · {a.phone}</p>
                        <p className="text-sm">{a.street}{a.area ? `, ${a.area}` : ""}, {a.city}, {a.state}</p>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="font-display text-2xl mb-3">Your items</h2>
                {vendorIds.map((vid) => (
                  <div key={vid} className="mb-4 border border-border bg-card rounded-lg overflow-hidden">
                    <div className="px-4 py-2 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                      {itemsByVendor[vid][0].vendor_name}
                    </div>
                    {itemsByVendor[vid].map((i) => (
                      <div key={i.product_id} className="flex justify-between items-center px-4 py-3 text-sm">
                        <div>{i.name} <span className="text-muted-foreground">× {i.qty}</span></div>
                        <div className="text-primary">₦{(i.price * i.qty).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </section>

              <section>
                <h2 className="font-display text-2xl mb-3">Order notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery instructions, gate code, special requests…"
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-lg border border-primary/30 bg-card space-y-4">
                <h2 className="font-display text-2xl">Summary</h2>
                <Row label="Subtotal" value={subtotal} />
                <Row label={`Delivery (${vendorIds.length} vendor${vendorIds.length > 1 ? "s" : ""})`} value={deliveryFee} />
                <Row label="Service fee" value={serviceFee} />
                <div className="h-px bg-border" />
                <Row label="Total" value={total} large />
                <Button variant="hero" size="lg" className="w-full" onClick={placeOrder} disabled={placing || !addrId}>
                  <Lock className="h-4 w-4" /> {placing ? "Placing…" : `Place order`}
                </Button>
                <p className="text-[10px] text-muted-foreground/70 text-center">
                  Online payment will be enabled once Paystack is connected. For now, orders are placed and vendor will reach out to confirm payment.
                </p>
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
    <div className={`flex justify-between ${large ? "text-lg" : "text-sm"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={large ? "font-display text-gradient-gold text-2xl" : "text-foreground"}>₦{value.toLocaleString()}</span>
    </div>
  );
}
