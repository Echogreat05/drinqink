import { Link } from "@tanstack/react-router";
import { ShoppingBag, X, Minus, Plus, Wine, ChevronRight } from "lucide-react";
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
import { motion } from "framer-motion";

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
        <button
          className="relative p-2 text-foreground hover:text-primary transition-colors group"
          aria-label="Cart"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </motion.div>
        </button>
      </SheetTrigger>
      <SheetContent className="bg-onyx border-l border-border/50 w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl sm:text-3xl font-light">
            Your cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="relative mb-4"
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Wine className="h-12 w-12 text-primary relative z-10" />
            </motion.div>
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Button asChild variant="hero" onClick={() => setOpen(false)} className="group">
              <Link to="/browse">
                Start browsing
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((i, idx) => (
                <motion.div
                  key={i.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex gap-3 p-3 sm:p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300"
                >
                  <div className="h-16 w-16 rounded-lg border border-border/50 bg-onyx flex items-center justify-center overflow-hidden shrink-0">
                    {i.image ? (
                      <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    ) : (
                      <Wine className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                      {i.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{i.vendor_name}</p>
                    <p className="text-primary text-sm font-semibold mt-1">
                      ₦{(i.price * i.qty).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => remove(i.product_id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(i.product_id, i.qty - 1)}
                        className="h-6 w-6 rounded border border-border/50 hover:border-primary flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-display">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.product_id, i.qty + 1)}
                        className="h-6 w-6 rounded border border-border/50 hover:border-primary flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <SheetFooter className="border-t border-border/50 pt-4 flex-col gap-3">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-primary">₦{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Delivery + service fees calculated at checkout.
              </p>
              <Button
                asChild
                variant="hero"
                size="lg"
                className="w-full group"
                onClick={() => setOpen(false)}
              >
                <Link to="/checkout">
                  Proceed to checkout
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
