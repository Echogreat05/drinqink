import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, GlassWater } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CartButton } from "@/components/CartButton";

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: string, session: unknown) => {
      setAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => setAuthed(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-onyx/85 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <GlassWater className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">
              Drinq<span className="text-gradient-gold">Ink</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <CartButton />
            {authed ? (
              <Button asChild variant="gold" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="gold" size="sm">
                  <Link to="/signup">Join DrinqInk</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <CartButton />

            <button
              className="text-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/50 py-6 space-y-4 animate-fade-up">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block text-base text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              {authed ? (
                <Button asChild variant="gold" className="flex-1">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost-gold" className="flex-1">
                    <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                  <Button asChild variant="gold" className="flex-1">
                    <Link to="/signup" onClick={() => setOpen(false)}>Join</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
