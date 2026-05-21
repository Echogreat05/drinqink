
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role must remain callable in RLS — it's read-only and only checks roles
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon;

-- Restrict bucket listing: vendor-logos and product-images individual files are still accessible via direct URL (public bucket),
-- but the broad SELECT policy is replaced so users can only LIST files in their own folder.
DROP POLICY IF EXISTS "Public read vendor-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;

CREATE POLICY "Vendors list own logo folder" ON storage.objects FOR SELECT USING (
  bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Vendors list own product folder" ON storage.objects FOR SELECT USING (
  bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
