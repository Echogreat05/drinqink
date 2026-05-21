import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — SipCellar" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell title="Forgot password" subtitle="We'll send you a reset link.">
      {sent ? (
        <div className="text-center space-y-4 py-4">
          <p className="text-foreground">Check your email at <span className="text-primary">{email}</span>.</p>
          <Button asChild variant="ghost-gold" className="w-full"><Link to="/login">Back to sign in</Link></Button>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <>Send reset link <ArrowRight /></>}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground pt-4">
            <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
