import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { GlassWater, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — DrinqInk" },
      { name: "description", content: "Sign in to your DrinqInk account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: redirect || "/dashboard" });
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <>Sign in <ArrowRight /></>}
        </Button>
      </form>

      <Divider>or continue with</Divider>

      <Button variant="ghost-gold" size="lg" className="w-full" onClick={onGoogle}>
        <GoogleIcon /> Google
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        New to DrinqInk?{" "}
        <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-50" />
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
        <GlassWater className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
        <span className="font-display text-2xl">
          Drinq<span className="text-gradient-gold">Ink</span>
        </span>
      </Link>

      <div className="relative w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-8 rounded-lg bg-card border border-border luxe-shadow space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center gap-3 py-2">
      <div className="flex-1 border-t border-border" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{children}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
