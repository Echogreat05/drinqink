INSERT INTO public.vendors (id, user_id, business_name, slug, description, status, is_featured, coverage_states, rating_avg, rating_count, contact_email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'fdb1366d-be64-4bae-9071-86e6deabbeac',
  'DrinqInk Demo Cellar',
  'drinqink-demo-cellar',
  'Hand-picked demo selection across every drinks category.',
  'approved', true,
  ARRAY['Lagos','Abuja','Rivers'],
  4.8, 124,
  'demo@drinqink.local'
)
ON CONFLICT (id) DO NOTHING;

WITH cats AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (vendor_id, category_id, name, slug, description, price, compare_at_price, stock_status, stock_qty, is_active, is_featured, images, volume_ml)
SELECT
  '11111111-1111-1111-1111-111111111111',
  c.id,
  p.name, p.pslug, p.descr, p.price, p.compare, 'in_stock', 120, true, p.feat, ARRAY[]::text[], p.ml
FROM cats c
JOIN (VALUES
  ('beer',         'Heineken Crate',       'heineken-crate',        'Cold Heineken 24-pack, ice-packed.',                15000.00, 18000.00, true,  330),
  ('wine',         'Chateau Margaux 2018', 'chateau-margaux-2018',  'Premium Bordeaux red, full-bodied.',                95000.00, NULL,     true,  750),
  ('spirits',      'Hennessy VSOP',        'hennessy-vsop',         'Aged cognac, smooth oak finish.',                   78000.00, 85000.00, false, 700),
  ('champagne',    'Moet Imperial Brut',   'moet-imperial-brut',    'Crisp champagne with citrus and brioche notes.',    62000.00, NULL,     true,  750),
  ('cocktail-packs','Margarita Party Pack','margarita-party-pack',  'Ready-to-pour for 10 — tequila, triple sec, lime.', 28000.00, 32000.00, false, 1500),
  ('soft-drinks',  'Coca-Cola Crate',      'coca-cola-crate',       '24-bottle crate of chilled Coke.',                   8500.00, NULL,     false, 330),
  ('juices',       'Chivita 100% Orange',  'chivita-orange',        'Pulp-free natural orange, 1L pack of 6.',            7200.00, NULL,     false, 1000),
  ('water',        'Eva Premium Water',    'eva-water-bulk',        'Bulk 75cl bottles, 12-pack.',                        4500.00, NULL,     false,  750),
  ('energy-drinks','Red Bull 24-pack',     'red-bull-24',           'Energy hits delivered cold.',                       16500.00, NULL,     false,  250),
  ('custom-mixes', 'Build-Your-Crate',     'custom-build-your-crate','Mix-and-match crate up to 24 bottles.',             12000.00, NULL,     true,  330)
) AS p(slug,name,pslug,descr,price,compare,feat,ml)
  ON p.slug = c.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.products pr WHERE pr.slug = p.pslug
);

INSERT INTO public.flash_deals (vendor_id, product_id, discount_percent, starts_at, ends_at, status)
SELECT
  '11111111-1111-1111-1111-111111111111',
  pr.id,
  25,
  now() - interval '1 hour',
  now() + interval '24 hours',
  'active'
FROM public.products pr
WHERE pr.slug = 'heineken-crate'
AND NOT EXISTS (SELECT 1 FROM public.flash_deals fd WHERE fd.product_id = pr.id AND fd.status = 'active');

INSERT INTO public.loyalty_rewards (name, description, points_required, discount_amount, active)
SELECT * FROM (VALUES
  ('₦2,000 Off Next Order', 'Apply at checkout on orders over ₦20,000.', 500, 2000.00, true),
  ('Free Delivery (Lagos)', 'One free delivery in Lagos coverage area.', 250, 1500.00, true)
) AS r(name, description, points_required, discount_amount, active)
WHERE NOT EXISTS (SELECT 1 FROM public.loyalty_rewards);