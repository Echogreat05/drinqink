
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'packing', 'dispatched', 'delivered', 'cancelled', 'disputed');
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'on_hold');
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved_customer', 'resolved_vendor', 'closed');
CREATE TYPE public.flash_deal_status AS ENUM ('pending', 'active', 'expired', 'rejected');

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- USER ROLES (separate table — prevents privilege escalation)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================
-- AUTO-CREATE PROFILE + ASSIGN CUSTOMER ROLE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    upper(substring(replace(NEW.id::text, '-', '') from 1 for 8))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CORPORATE ACCOUNTS
-- ============================================================
CREATE TABLE public.corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  spending_limit NUMERIC(12,2),
  approval_required BOOLEAN NOT NULL DEFAULT false,
  monthly_invoice BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_corporate_updated BEFORE UPDATE ON public.corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT,
  phone TEXT,
  street TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cac_number TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  coverage_states TEXT[] NOT NULL DEFAULT '{}',
  coverage_areas TEXT[] NOT NULL DEFAULT '{}',
  min_order NUMERIC(12,2) NOT NULL DEFAULT 0,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  status public.vendor_status NOT NULL DEFAULT 'pending',
  badges TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false,
  response_time_minutes INT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  paystack_subaccount_code TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_vendors_status ON public.vendors(status);
CREATE INDEX idx_vendors_featured ON public.vendors(is_featured) WHERE is_featured = true;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.categories (name, slug, icon, display_order) VALUES
  ('Beer', 'beer', 'beer', 1),
  ('Wine', 'wine', 'wine', 2),
  ('Spirits', 'spirits', 'spirits', 3),
  ('Champagne', 'champagne', 'champagne', 4),
  ('Cocktail Packs', 'cocktail-packs', 'cocktail', 5),
  ('Soft Drinks', 'soft-drinks', 'soda', 6),
  ('Juices', 'juices', 'juice', 7),
  ('Water', 'water', 'water', 8),
  ('Energy Drinks', 'energy-drinks', 'energy', 9),
  ('Custom Mixes', 'custom-mixes', 'mix', 10);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  compare_at_price NUMERIC(12,2),
  min_qty INT NOT NULL DEFAULT 1,
  stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
  stock_qty INT,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  abv NUMERIC(5,2),
  volume_ml INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_products_vendor ON public.products(vendor_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;

-- ============================================================
-- PACKAGES (vendor event bundles)
-- ============================================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  event_type TEXT,
  guest_count INT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- BUNDLES (customer-saved custom mixes)
-- ============================================================
CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_bundles_updated BEFORE UPDATE ON public.bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('SC-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8))),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12,2) NOT NULL,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  vendor_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_date DATE,
  delivery_time_window TEXT,
  delivery_address JSONB,
  notes TEXT,
  proof_of_delivery TEXT,
  paystack_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  slot_id UUID,
  event_type TEXT,
  guest_count INT,
  special_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VENDOR SLOTS
-- ============================================================
CREATE TABLE public.vendor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_window TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_bookings INT NOT NULL DEFAULT 1,
  bookings_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendor_slots_vendor_date ON public.vendor_slots(vendor_id, date);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  quality_score INT NOT NULL CHECK (quality_score BETWEEN 1 AND 5),
  packaging_score INT NOT NULL CHECK (packaging_score BETWEEN 1 AND 5),
  communication_score INT NOT NULL CHECK (communication_score BETWEEN 1 AND 5),
  delivery_score INT NOT NULL CHECK (delivery_score BETWEEN 1 AND 5),
  value_score INT NOT NULL CHECK (value_score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, customer_id)
);
CREATE INDEX idx_reviews_vendor ON public.reviews(vendor_id);

-- ============================================================
-- PAYOUTS
-- ============================================================
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  gross_amount NUMERIC(12,2) NOT NULL,
  commission_deducted NUMERIC(12,2) NOT NULL,
  net_amount NUMERIC(12,2) NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'pending',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payouts_vendor ON public.payouts(vendor_id);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  status public.dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_given BOOLEAN NOT NULL DEFAULT false,
  reward_amount NUMERIC(12,2),
  type TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

-- ============================================================
-- LOYALTY POINTS
-- ============================================================
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  source TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_customer ON public.loyalty_points(customer_id);

-- ============================================================
-- FLASH DEALS
-- ============================================================
CREATE TABLE public.flash_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percent NUMERIC(5,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status public.flash_deal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);

-- ============================================================
-- WAITLISTS
-- ============================================================
CREATE TABLE public.waitlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- profiles
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- corporate_accounts
CREATE POLICY "Owners view own corporate" ON public.corporate_accounts FOR SELECT USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners manage own corporate" ON public.corporate_accounts FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- vendors
CREATE POLICY "Approved vendors public" ON public.vendors FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Vendors insert own" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors update own" ON public.vendors FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete vendors" ON public.vendors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Categories public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products
CREATE POLICY "Active products public" ON public.products FOR SELECT USING (
  is_active = true AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.status = 'approved')
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Vendors manage own products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);

-- packages
CREATE POLICY "Active packages public" ON public.packages FOR SELECT USING (
  is_active = true OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Vendors manage own packages" ON public.packages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);

-- bundles
CREATE POLICY "Customers manage own bundles" ON public.bundles FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Vendors update their orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- order_items
CREATE POLICY "View order items via order access" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
      o.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);
CREATE POLICY "Insert order items via order" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
);

-- bookings
CREATE POLICY "View bookings via order" ON public.bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
      o.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);
CREATE POLICY "Insert bookings via order" ON public.bookings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
);

-- vendor_slots
CREATE POLICY "Slots public" ON public.vendor_slots FOR SELECT USING (true);
CREATE POLICY "Vendors manage own slots" ON public.vendor_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);

-- reviews
CREATE POLICY "Reviews public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);

-- payouts
CREATE POLICY "Vendors view own payouts" ON public.payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins manage payouts" ON public.payouts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- disputes
CREATE POLICY "View disputes via involvement" ON public.disputes FOR SELECT USING (
  auth.uid() = raised_by
  OR EXISTS (SELECT 1 FROM public.orders o JOIN public.vendors v ON v.id = o.vendor_id WHERE o.id = order_id AND (o.customer_id = auth.uid() OR v.user_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Customers raise disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = raised_by);
CREATE POLICY "Admins resolve disputes" ON public.disputes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- referrals
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- loyalty_points
CREATE POLICY "Customers view own points" ON public.loyalty_points FOR SELECT USING (auth.uid() = customer_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage points" ON public.loyalty_points FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- flash_deals
CREATE POLICY "Active deals public" ON public.flash_deals FOR SELECT USING (
  status = 'active'
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Vendors create own deals" ON public.flash_deals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);
CREATE POLICY "Vendors update own deals" ON public.flash_deals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- waitlists
CREATE POLICY "Users manage own waitlist" ON public.waitlists FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('vendor-logos', 'vendor-logos', true),
  ('product-images', 'product-images', true),
  ('proof-of-delivery', 'proof-of-delivery', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read vendor-logos" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-logos');
CREATE POLICY "Vendors upload own logo" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Vendors update own logo" ON storage.objects FOR UPDATE USING (
  bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Vendors upload product images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Vendors manage product images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Vendors delete product images" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors upload proof" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'proof-of-delivery' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "View own proof" ON storage.objects FOR SELECT USING (
  bucket_id = 'proof-of-delivery' AND auth.uid()::text = (storage.foldername(name))[1]
);
