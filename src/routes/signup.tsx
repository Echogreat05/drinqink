import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Divider, GoogleIcon } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — DrinqInk" },
      { name: "description", content: "Join DrinqInk to discover and order drinks from Nigeria's best suppliers." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName, phone },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to confirm.");
    navigate({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <AuthShell title="Join DrinqInk" subtitle="Every drink, cold & clear. Vetted vendors. Delivered.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <>Create account <ArrowRight /></>}
        </Button>
      </form>

      <Divider>or sign up with</Divider>

      <Button variant="ghost-gold" size="lg" className="w-full" onClick={onGoogle}>
        <GoogleIcon /> Google
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
      <p className="text-center text-[11px] text-muted-foreground">
        By signing up you confirm you're 18+ and agree to our terms.
      </p>
    </AuthShell>
  );
}
