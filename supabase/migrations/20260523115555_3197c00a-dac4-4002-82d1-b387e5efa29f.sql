-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at);
CREATE POLICY "Published blog posts are public" ON public.blog_posts FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order tracking events
CREATE TABLE public.order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  courier_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_tracking_order ON public.order_tracking(order_id);
CREATE POLICY "View order tracking via order access" ON public.order_tracking FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (
      o.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);
CREATE POLICY "Vendors and admins add tracking" ON public.order_tracking FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (
      EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

-- Loyalty redemptions
CREATE TABLE public.loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
  points_cost INT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_redemptions_customer ON public.loyalty_redemptions(customer_id);
CREATE POLICY "Customers view own redemptions" ON public.loyalty_redemptions FOR SELECT
  USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers create own redemptions" ON public.loyalty_redemptions FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Per-channel notification preferences
ALTER TABLE public.notification_preferences
  ADD COLUMN email_orders BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN email_promotions BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN email_updates BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN push_orders BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN push_promotions BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN sms_orders BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN sms_promotions BOOLEAN NOT NULL DEFAULT false;

-- Loyalty rewards UI alignment
ALTER TABLE public.loyalty_rewards
  ADD COLUMN is_active BOOLEAN GENERATED ALWAYS AS (active) STORED,
  ADD COLUMN points_cost INT GENERATED ALWAYS AS (points_required) STORED;

-- Loyalty transactions UI alignment
ALTER TABLE public.loyalty_transactions
  ADD COLUMN points_change INT GENERATED ALWAYS AS (
    CASE WHEN transaction_type IN ('earned','bonus','adjusted') THEN points_amount
         ELSE -points_amount END
  ) STORED;

-- profiles needs loyalty fields for the customers view
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze';

-- customers view (compat shim)
CREATE VIEW public.customers
WITH (security_invoker = on) AS
SELECT id, display_name, phone, avatar_url, referral_code,
       loyalty_points, loyalty_tier, created_at, updated_at
FROM public.profiles;

-- group_order_participants view (compat shim for older component naming)
CREATE VIEW public.group_order_participants
WITH (security_invoker = on) AS
SELECT id, group_order_id, member_id AS user_id, member_id,
       member_amount, status, joined_at
FROM public.group_order_members;