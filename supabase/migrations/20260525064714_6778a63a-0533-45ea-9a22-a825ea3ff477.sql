-- Restore EXECUTE on helpers used inside RLS policies.
-- RLS USING clauses run as the calling role (anon/authenticated), so the role
-- needs EXECUTE on every function referenced, or PostgREST returns 401/42501.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_vendor_private() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(text) TO authenticated;