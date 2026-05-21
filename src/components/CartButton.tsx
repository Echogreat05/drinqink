import { Link } from "@tanstack/react-router";
import { ShoppingBag, X, Minus, Plus, Wine } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const count = useCart((s) => s.count());
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-foreground hover:text-primary transition-colors" aria-label="Cart">
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="bg-onyx border-l border-border w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-light">Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Wine className="h-10 w-10 text-primary opacity-50 mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Button asChild variant="hero" onClick={() => setOpen(false)}>
              <Link to="/browse">Start browsing</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((i) => (
                <div key={i.product_id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="h-16 w-16 rounded bg-onyx flex items-center justify-center overflow-hidden shrink-0">
                    {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : <Wine className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{i.vendor_name}</p>
                    <p className="text-primary text-sm font-semibold mt-1">₦{(i.price * i.qty).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => remove(i.product_id)} className="text-muted-foreground hover:text-primary" aria-label="Remove"><X className="h-4 w-4" /></button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQty(i.product_id, i.qty - 1)} className="h-6 w-6 rounded border border-border hover:border-primary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                      <span className="w-7 text-center text-sm">{i.qty}</span>
                      <button onClick={() => setQty(i.product_id, i.qty + 1)} className="h-6 w-6 rounded border border-border hover:border-primary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="border-t border-border pt-4 flex-col gap-3">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-primary">₦{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground/70">Delivery + service fees calculated at checkout.</p>
              <Button asChild variant="hero" size="lg" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
