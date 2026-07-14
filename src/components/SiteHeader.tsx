import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, GlassWater, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CartButton } from "@/components/CartButton";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/browse", label: "Browse" },
  { to: "/categories", label: "Categories" },
  { to: "/cellar", label: "The Cellar" },
  { to: "/flash-deals", label: "Flash Deals" },
  { to: "/how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e: string, session: unknown) => {
      setAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-onyx/92 backdrop-blur-xl border-b border-border/60 shadow-lg"
          : "bg-onyx/45 backdrop-blur-md border-b border-border/20",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <GlassWater className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </motion.div>
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
              Drinq<span className="text-gradient-gold">Ink</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 sm:gap-8">
            {NAV.map((item) => (
              <div key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors relative group"
                  activeProps={{ className: "text-primary" }}
                >
                  {item.label}
                  <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <CartButton />
            {authed ? (
              <Button asChild variant="gold" size="sm" className="group">
                <Link to="/dashboard">
                  Dashboard
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="group">
                  <Link to="/login">
                    Sign in
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="gold" size="sm" className="group relative overflow-hidden">
                  <Link to="/signup">
                    <span className="relative z-10">Join DrinqInk</span>
                    <Sparkles className="ml-1 h-4 w-4 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <CartButton />

            <button
              className="text-foreground p-2 rounded-lg hover:bg-primary/10 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <motion.div
                initial={false}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-border/50 py-6 space-y-4 overflow-hidden"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block text-base text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex gap-3 pt-4 border-t border-border/50"
              >
                {authed ? (
                  <Button asChild variant="gold" className="flex-1">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="ghost-gold" className="flex-1">
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild variant="gold" className="flex-1">
                      <Link to="/signup" onClick={() => setOpen(false)}>
                        Join
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
