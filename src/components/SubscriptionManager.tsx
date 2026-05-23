import { useEffect, useState } from "react";
import { CreditCard, Calendar, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function SubscriptionManager() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    const [subData, plansData] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("customer_id", user.id)
        .maybeSingle(),
      supabase.from("subscription_plans").select("*").eq("is_active", true),
    ]);

    setSubscription(subData.data);
    setPlans(plansData.data || []);
    setLoading(false);
  };

  const subscribeToPlan = async (planId: string) => {
    const { error } = await supabase.from("subscriptions").insert({
      customer_id: user?.id,
      plan_id: planId,
      status: "active",
    });

    if (error) {
      toast.error("Failed to subscribe to plan");
    } else {
      toast.success("Successfully subscribed!");
      loadSubscriptionData();
    }
  };

  const cancelSubscription = async () => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", subscription?.id);

    if (error) {
      toast.error("Failed to cancel subscription");
    } else {
      toast.success("Subscription cancelled");
      loadSubscriptionData();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscription data...</div>;
  }

  return (
    <div className="space-y-6">
      {subscription && subscription.status === "active" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{subscription.subscription_plans?.name}</h3>
                  <p className="text-sm text-muted-foreground">{subscription.subscription_plans?.description}</p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly fee</p>
                  <p className="font-medium">₦{subscription.subscription_plans?.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next billing</p>
                  <p className="font-medium">{new Date(subscription.next_billing_date).toLocaleDateString()}</p>
                </div>
              </div>

              <Button onClick={cancelSubscription} variant="destructive" size="sm">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-lg border ${
                  subscription?.plan_id === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-gradient-gold mb-2">
                  ₦{plan.price?.toLocaleString()}/mo
                </p>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {subscription?.plan_id === plan.id ? (
                  <Button disabled className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => subscribeToPlan(plan.id)}
                    className="w-full"
                    disabled={subscription?.status === "active"}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
