
-- 1) Restrict profiles SELECT to self/admin (remove public exposure)
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role));

-- 2) Hide sensitive vendor columns from non-owners via column privileges
REVOKE SELECT (cac_number, paystack_subaccount_code, commission_rate)
  ON public.vendors FROM anon, authenticated;

-- Helper for owners/admins to read their private vendor data
CREATE OR REPLACE FUNCTION public.get_my_vendor_private()
RETURNS TABLE (
  id uuid,
  cac_number text,
  paystack_subaccount_code text,
  commission_rate numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.cac_number, v.paystack_subaccount_code, v.commission_rate
  FROM public.vendors v
  WHERE v.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role);
$$;

-- 3) Lock down loyalty_redemptions: only validated server-side function may insert
DROP POLICY IF EXISTS "Customers create own redemptions" ON public.loyalty_redemptions;

CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost int;
  _active boolean;
  _expires timestamptz;
  _max int;
  _uses int;
  _balance int;
  _redemption_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT COALESCE(points_required, points_cost), COALESCE(active, is_active, true),
         expires_at, max_uses, COALESCE(uses, 0)
    INTO _cost, _active, _expires, _max, _uses
  FROM public.loyalty_rewards WHERE id = _reward_id;

  IF _cost IS NULL THEN RAISE EXCEPTION 'reward not found'; END IF;
  IF NOT _active THEN RAISE EXCEPTION 'reward inactive'; END IF;
  IF _expires IS NOT NULL AND _expires < now() THEN RAISE EXCEPTION 'reward expired'; END IF;
  IF _max IS NOT NULL AND _uses >= _max THEN RAISE EXCEPTION 'reward exhausted'; END IF;

  SELECT COALESCE(SUM(points_change), 0) INTO _balance
  FROM public.loyalty_transactions WHERE customer_id = _uid;

  IF _balance < _cost THEN RAISE EXCEPTION 'insufficient points'; END IF;

  INSERT INTO public.loyalty_redemptions (customer_id, reward_id, points_cost)
  VALUES (_uid, _reward_id, _cost)
  RETURNING id INTO _redemption_id;

  INSERT INTO public.loyalty_transactions (customer_id, transaction_type, points_amount, points_change, balance_before, balance_after, source, description)
  VALUES (_uid, 'redeem', _cost, -_cost, _balance, _balance - _cost, 'redemption', 'Reward redemption');

  UPDATE public.loyalty_rewards SET uses = COALESCE(uses, 0) + 1 WHERE id = _reward_id;

  RETURN _redemption_id;
END;
$$;

-- 4) Lock down referrals INSERT; only server-side function may create them
DROP POLICY IF EXISTS "System inserts referrals" ON public.referrals;

CREATE OR REPLACE FUNCTION public.apply_referral_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _referrer uuid;
  _ref_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT id INTO _referrer FROM public.profiles
  WHERE referral_code = upper(_code) AND id <> _uid LIMIT 1;
  IF _referrer IS NULL THEN RAISE EXCEPTION 'invalid referral code'; END IF;

  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = _uid) THEN
    RAISE EXCEPTION 'referral already applied';
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id)
  VALUES (_referrer, _uid)
  RETURNING id INTO _ref_id;

  RETURN _ref_id;
END;
$$;

-- 5) Storage: customers can view proof-of-delivery for their own orders
CREATE POLICY "Customers view own order proof"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'proof-of-delivery'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.customer_id = auth.uid()
        AND o.proof_of_delivery = storage.objects.name
    )
  );

-- 6) Storage: vendors can delete their own logo files
CREATE POLICY "Vendors delete own logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-logos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 7) Revoke direct EXECUTE on SECURITY DEFINER helpers from clients
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_vendor_private() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.apply_referral_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_vendor_private() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(text) TO authenticated;
