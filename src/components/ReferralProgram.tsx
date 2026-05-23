import { useEffect, useState } from "react";
import { Share2, Gift, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function ReferralProgram() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [bonusEarned, setBonusEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    const [codeData, referralData] = await Promise.all([
      supabase.from("customers").select("referral_code").eq("id", user.id).single(),
      supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (codeData.data) {
      setReferralCode(codeData.data.referral_code || "");
    }
    setReferrals(referralData.data || []);
    setBonusEarned((referralData.data || []).reduce((sum, r) => sum + (r.bonus_amount || 0), 0));
    setLoading(false);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SipCellar",
          text: "Get ₦500 bonus when you sign up using my referral link!",
          url: link,
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading referral data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Refer & Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Your referral code</p>
                <p className="text-2xl font-mono font-bold">{referralCode || "Not set"}</p>
              </div>
              <Button onClick={copyReferralLink} variant="outline">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total bonus earned</p>
                <p className="text-2xl font-bold text-gradient-gold">₦{bonusEarned.toLocaleString()}</p>
              </div>
              <Badge variant="secondary">{referrals.length} referrals</Badge>
            </div>

            <Button onClick={shareReferral} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Link
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Earn ₦500 for every friend who makes their first order</p>
              <p>• Your friend gets 10% off their first order</p>
              <p>• No limit on referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Referral #{ref.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={ref.status === "completed" ? "default" : "secondary"}>
                    {ref.status}
                  </Badge>
                  {ref.bonus_amount > 0 && (
                    <p className="text-sm font-medium text-green-600 mt-1">+₦{ref.bonus_amount}</p>
                  )}
                </div>
              </div>
            ))}
            {referrals.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No referrals yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
