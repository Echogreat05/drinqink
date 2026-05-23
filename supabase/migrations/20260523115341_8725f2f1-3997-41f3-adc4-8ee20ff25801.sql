-- ============================================================
-- MISSING FEATURES MIGRATION
-- ============================================================

CREATE TYPE public.notification_channel_type AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed', 'bounced');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'pending_first_order');
CREATE TYPE public.subscription_frequency AS ENUM ('weekly', 'biweekly', 'monthly');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.loyalty_transaction_type AS ENUM ('earned', 'redeemed', 'adjusted', 'expired', 'bonus');
CREATE TYPE public.event_plan_status AS ENUM ('draft', 'recommended', 'accepted', 'rejected', 'completed');
CREATE TYPE public.group_order_status AS ENUM ('open', 'closing_soon', 'closed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');

-- 1. GROUP ORDERS
CREATE TABLE public.group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.group_order_status NOT NULL DEFAULT 'open',
  min_participants INT NOT NULL DEFAULT 1,
  max_participants INT,
  closing_at TIMESTAMPTZ NOT NULL,
  event_date DATE,
  event_time TEXT,
  location TEXT,
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  participants_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_group_orders_updated BEFORE UPDATE ON public.group_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_group_orders_vendor ON public.group_orders(vendor_id);
CREATE INDEX idx_group_orders_organizer ON public.group_orders(organizer_id);
CREATE INDEX idx_group_orders_status ON public.group_orders(status);

CREATE TABLE public.group_order_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_order_id, member_id)
);
CREATE INDEX idx_group_order_members_group ON public.group_order_members(group_order_id);
CREATE INDEX idx_group_order_members_member ON public.group_order_members(member_id);

CREATE TABLE public.group_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES public.group_orders(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_group_order_items_group ON public.group_order_items(group_order_id);
CREATE INDEX idx_group_order_items_member ON public.group_order_items(member_id);

-- 2. EVENT PLANNER
CREATE TABLE public.event_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  guest_count INT NOT NULL,
  budget NUMERIC(12,2),
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  special_requests TEXT,
  status public.event_plan_status NOT NULL DEFAULT 'draft',
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_event_plans_updated BEFORE UPDATE ON public.event_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_event_plans_customer ON public.event_plans(customer_id);
CREATE INDEX idx_event_plans_status ON public.event_plans(status);

CREATE TABLE public.event_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_plan_id UUID NOT NULL REFERENCES public.event_plans(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  recommended_qty INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_event_plan_items_plan ON public.event_plan_items(event_plan_id);
CREATE INDEX idx_event_plan_items_product ON public.event_plan_items(product_id);

CREATE TABLE public.event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_plan_id UUID NOT NULL REFERENCES public.event_plans(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_event_bookings_plan ON public.event_bookings(event_plan_id);
CREATE INDEX idx_event_bookings_vendor ON public.event_bookings(vendor_id);

-- 3. LOYALTY
CREATE TABLE public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INT NOT NULL UNIQUE,
  min_points INT NOT NULL,
  max_points INT,
  multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.loyalty_tiers (name, level, min_points, max_points, multiplier, benefits) VALUES
  ('Bronze', 1, 0, 999, 1.0, '["5% discount on next order", "Early access to flash deals"]'::jsonb),
  ('Silver', 2, 1000, 4999, 1.25, '["10% discount on next order", "Free delivery over ₦5000"]'::jsonb),
  ('Gold', 3, 5000, 9999, 1.5, '["15% discount on next order", "Free delivery always", "Priority support"]'::jsonb),
  ('Platinum', 4, 10000, NULL, 2.0, '["20% discount on next order", "Free delivery always", "Dedicated account manager", "Exclusive events"]'::jsonb);

CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type public.loyalty_transaction_type NOT NULL,
  points_amount INT NOT NULL,
  source TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  description TEXT,
  balance_before INT DEFAULT 0,
  balance_after INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_type ON public.loyalty_transactions(transaction_type);

CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(12,2),
  max_uses INT,
  uses INT DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ADD COLUMN balance INT DEFAULT 0;
ALTER TABLE public.loyalty_points ADD COLUMN tier_id UUID REFERENCES public.loyalty_tiers(id);

-- 4. REFERRALS
CREATE TABLE public.referral_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_type TEXT NOT NULL UNIQUE,
  referrer_bonus NUMERIC(12,2) NOT NULL,
  referred_bonus NUMERIC(12,2) NOT NULL,
  min_order_amount NUMERIC(12,2) DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.referral_bonuses (referral_type, referrer_bonus, referred_bonus, min_order_amount) VALUES
  ('customer', 2500, 1000, 0),
  ('vendor', 10000, 5000, 0);

CREATE TABLE public.referral_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  bonus_amount NUMERIC(12,2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT DEFAULT 'wallet'
);

-- 5. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.subscription_status NOT NULL DEFAULT 'pending_first_order',
  frequency public.subscription_frequency NOT NULL DEFAULT 'weekly',
  next_order_date DATE NOT NULL,
  last_order_date DATE,
  pause_until TIMESTAMPTZ,
  total_spent NUMERIC(12,2) DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_subscriptions_customer ON public.subscriptions(customer_id);
CREATE INDEX idx_subscriptions_vendor ON public.subscriptions(vendor_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE TABLE public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscription_items_subscription ON public.subscription_items(subscription_id);

CREATE TABLE public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  scheduled_for DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, order_id)
);
CREATE INDEX idx_subscription_orders_subscription ON public.subscription_orders(subscription_id);

-- 6. ANALYTICS
CREATE TABLE public.vendor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  orders_count INT DEFAULT 0,
  total_sales NUMERIC(12,2) DEFAULT 0,
  total_items_sold INT DEFAULT 0,
  unique_customers INT DEFAULT 0,
  average_order_value NUMERIC(12,2) DEFAULT 0,
  cancellation_rate NUMERIC(5,2) DEFAULT 0,
  page_views INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, analytics_date)
);
CREATE INDEX idx_vendor_analytics_vendor_date ON public.vendor_analytics(vendor_id, analytics_date);

CREATE TABLE public.product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  units_sold INT DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, analytics_date)
);
CREATE INDEX idx_product_analytics_vendor_date ON public.product_analytics(vendor_id, analytics_date);

CREATE TABLE public.traffic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_traffic_logs_vendor ON public.traffic_logs(vendor_id);
CREATE INDEX idx_traffic_logs_product ON public.traffic_logs(product_id);
CREATE INDEX idx_traffic_logs_created ON public.traffic_logs(created_at);

-- 7. DISPUTE COMMENTS
CREATE TABLE public.dispute_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dispute_comments_dispute ON public.dispute_comments(dispute_id);
CREATE INDEX idx_dispute_comments_user ON public.dispute_comments(user_id);

-- 8. ORDER ITEM CUSTOMIZATIONS
CREATE TABLE public.order_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  customization_name TEXT NOT NULL,
  customization_value TEXT NOT NULL,
  price_adjustment NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_item_customizations_item ON public.order_item_customizations(order_item_id);

-- 9. NOTIFICATIONS
CREATE TABLE public.notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type public.notification_channel_type NOT NULL,
  channel_identifier TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel_type, channel_identifier)
);
CREATE INDEX idx_notification_channels_user ON public.notification_channels(user_id);

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_updates BOOLEAN NOT NULL DEFAULT true,
  promotional BOOLEAN NOT NULL DEFAULT true,
  flash_deals BOOLEAN NOT NULL DEFAULT true,
  new_products BOOLEAN NOT NULL DEFAULT true,
  loyalty_rewards BOOLEAN NOT NULL DEFAULT true,
  system_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
CREATE TRIGGER trg_notification_preferences_updated BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notification_sent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.notification_channels(id) ON DELETE SET NULL,
  channel_type public.notification_channel_type NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status public.notification_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notification_sent_log_user ON public.notification_sent_log(user_id);
CREATE INDEX idx_notification_sent_log_status ON public.notification_sent_log(status);
CREATE INDEX idx_notification_sent_log_created ON public.notification_sent_log(created_at);

-- 10. FAVORITES
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((vendor_id IS NOT NULL AND product_id IS NULL) OR (vendor_id IS NULL AND product_id IS NOT NULL)),
  UNIQUE (user_id, vendor_id, product_id)
);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_vendor ON public.favorites(vendor_id);
CREATE INDEX idx_favorites_product ON public.favorites(product_id);

-- 11. CORPORATE
CREATE TABLE public.corporate_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  spending_limit NUMERIC(12,2),
  is_approver BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (corporate_account_id, user_id)
);
CREATE INDEX idx_corporate_team_members_account ON public.corporate_team_members(corporate_account_id);
CREATE INDEX idx_corporate_team_members_user ON public.corporate_team_members(user_id);

CREATE TABLE public.corporate_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.approval_status NOT NULL DEFAULT 'pending',
  approval_amount NUMERIC(12,2) NOT NULL,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);
CREATE INDEX idx_corporate_approvals_account ON public.corporate_approvals(corporate_account_id);
CREATE INDEX idx_corporate_approvals_status ON public.corporate_approvals(status);

CREATE TABLE public.corporate_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  budget_amount NUMERIC(12,2) NOT NULL,
  spent_amount NUMERIC(12,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_corporate_budgets_updated BEFORE UPDATE ON public.corporate_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_corporate_budgets_account ON public.corporate_budgets(corporate_account_id);

CREATE TABLE public.corporate_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_corporate_activity_log_account ON public.corporate_activity_log(corporate_account_id);
CREATE INDEX idx_corporate_activity_log_created ON public.corporate_activity_log(created_at);

-- ============================================================
-- RLS POLICIES
-- ============================================================

CREATE POLICY "Group orders viewable by members" ON public.group_orders FOR SELECT USING (
  auth.uid() = organizer_id
  OR EXISTS (SELECT 1 FROM public.group_order_members WHERE group_order_id = group_orders.id AND member_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Customers create group orders" ON public.group_orders FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizer updates group orders" ON public.group_orders FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "View group members via order" ON public.group_order_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_orders go
    WHERE go.id = group_order_members.group_order_id
    AND (go.organizer_id = auth.uid() OR group_order_members.member_id = auth.uid())
  )
);
CREATE POLICY "Customers join group orders" ON public.group_order_members FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "View group items via order" ON public.group_order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_orders go
    WHERE go.id = group_order_items.group_order_id
    AND (
      go.organizer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.group_order_members gm WHERE gm.group_order_id = go.id AND gm.member_id = auth.uid())
    )
  )
);
CREATE POLICY "Members add items to group order" ON public.group_order_items FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Customers view own event plans" ON public.event_plans FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create event plans" ON public.event_plans FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own event plans" ON public.event_plans FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "View event plan items via plan" ON public.event_plan_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.event_plans WHERE id = event_plan_id AND customer_id = auth.uid())
);

CREATE POLICY "Customers view own event bookings" ON public.event_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.event_plans WHERE id = event_plan_id AND customer_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);

CREATE POLICY "Loyalty tiers public" ON public.loyalty_tiers FOR SELECT USING (true);

CREATE POLICY "Customers view own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins manage loyalty transactions" ON public.loyalty_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Loyalty rewards public" ON public.loyalty_rewards FOR SELECT USING (true);

CREATE POLICY "Referral bonuses public" ON public.referral_bonuses FOR SELECT USING (true);

CREATE POLICY "Users view own referral redemptions" ON public.referral_redemptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.referrals WHERE id = referral_id AND (referrer_id = auth.uid() OR referred_id = auth.uid()))
);

CREATE POLICY "Customers view own subscriptions" ON public.subscriptions FOR SELECT USING (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
CREATE POLICY "Customers create subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "View subscription items via subscription" ON public.subscription_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.id = subscription_id
    AND (s.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = s.vendor_id AND v.user_id = auth.uid()))
  )
);

CREATE POLICY "View subscription orders via subscription" ON public.subscription_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.id = subscription_id
    AND (s.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = s.vendor_id AND v.user_id = auth.uid()))
  )
);

CREATE POLICY "Vendors view own analytics" ON public.vendor_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Vendors view own product analytics" ON public.product_analytics FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins view traffic logs" ON public.traffic_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View dispute comments via dispute" ON public.dispute_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.disputes d
    WHERE d.id = dispute_id AND (
      d.raised_by = auth.uid()
      OR EXISTS (SELECT 1 FROM public.orders o JOIN public.vendors v ON v.id = o.vendor_id WHERE o.id = d.order_id AND (o.customer_id = auth.uid() OR v.user_id = auth.uid()))
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);
CREATE POLICY "Users comment on disputes" ON public.dispute_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.disputes d
    WHERE d.id = dispute_id AND (
      d.raised_by = auth.uid()
      OR EXISTS (SELECT 1 FROM public.orders o JOIN public.vendors v ON v.id = o.vendor_id WHERE o.id = d.order_id AND (o.customer_id = auth.uid() OR v.user_id = auth.uid()))
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "View customizations via order" ON public.order_item_customizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id
    AND (o.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid()))
  )
);

CREATE POLICY "Users manage own notification channels" ON public.notification_channels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notification logs" ON public.notification_sent_log FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Corporate owner view team" ON public.corporate_team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_account_id AND owner_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "View corporate approvals" ON public.corporate_approvals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_account_id AND owner_id = auth.uid())
  OR auth.uid() = assigned_to OR auth.uid() = requested_by
);
CREATE POLICY "Approvers manage approvals" ON public.corporate_approvals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.corporate_team_members ctm WHERE ctm.corporate_account_id = corporate_approvals.corporate_account_id AND ctm.user_id = auth.uid() AND ctm.is_approver = true)
);

CREATE POLICY "Corporate owner view budgets" ON public.corporate_budgets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_account_id AND owner_id = auth.uid())
  OR member_id = auth.uid()
);

CREATE POLICY "Corporate owner view activity" ON public.corporate_activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_accounts WHERE id = corporate_account_id AND owner_id = auth.uid())
);

CREATE INDEX idx_notifications_user_type ON public.notifications(user_id, type);
CREATE INDEX idx_loyalty_points_customer_balance ON public.loyalty_points(customer_id, balance);