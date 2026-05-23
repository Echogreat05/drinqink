import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    emailOrders: true,
    emailPromotions: false,
    emailUpdates: true,
    pushOrders: true,
    pushPromotions: false,
    smsOrders: false,
    smsPromotions: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPreferences({
        emailOrders: data.email_orders ?? true,
        emailPromotions: data.email_promotions ?? false,
        emailUpdates: data.email_updates ?? true,
        pushOrders: data.push_orders ?? true,
        pushPromotions: data.push_promotions ?? false,
        smsOrders: data.sms_orders ?? false,
        smsPromotions: data.sms_promotions ?? false,
      });
    }
    setLoading(false);
  };

  const updatePreference = async (key: string, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user?.id,
        [key]: value,
      });

    if (error) {
      toast.error("Failed to update preferences");
    } else {
      toast.success("Preferences updated");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceItem
            label="Order updates"
            description="Receive emails about your order status"
            checked={preferences.emailOrders}
            onChange={(v) => updatePreference("email_orders", v)}
          />
          <PreferenceItem
            label="Promotions"
            description="Receive promotional emails and offers"
            checked={preferences.emailPromotions}
            onChange={(v) => updatePreference("email_promotions", v)}
          />
          <PreferenceItem
            label="Account updates"
            description="Receive emails about account activity"
            checked={preferences.emailUpdates}
            onChange={(v) => updatePreference("email_updates", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceItem
            label="Order updates"
            description="Receive push notifications about your orders"
            checked={preferences.pushOrders}
            onChange={(v) => updatePreference("push_orders", v)}
          />
          <PreferenceItem
            label="Promotions"
            description="Receive push notifications for offers"
            checked={preferences.pushPromotions}
            onChange={(v) => updatePreference("push_promotions", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceItem
            label="Order updates"
            description="Receive SMS about your order status"
            checked={preferences.smsOrders}
            onChange={(v) => updatePreference("sms_orders", v)}
          />
          <PreferenceItem
            label="Promotions"
            description="Receive SMS for promotional offers"
            checked={preferences.smsPromotions}
            onChange={(v) => updatePreference("sms_promotions", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={label} className="font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
