// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export async function generateSitemap() {
  const baseUrl = "https://sipcellar.com";

  const staticPages: Array<{ url: string; changefreq: string; priority: number; lastmod?: string | null }> = [
    { url: "", changefreq: "daily", priority: 1.0 },
    { url: "/browse", changefreq: "daily", priority: 0.9 },
    { url: "/cellar", changefreq: "weekly", priority: 0.8 },
    { url: "/about", changefreq: "monthly", priority: 0.5 },
  ];

  // Fetch dynamic content
  const [products, vendors, blogPosts] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("vendors").select("slug, updated_at").eq("status", "approved"),
    supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
  ]);

  const productUrls = (products.data || []).map((p) => ({
    url: `/product/${p.slug}`,
    changefreq: "weekly" as const,
    priority: 0.7,
    lastmod: p.updated_at,
  }));

  const vendorUrls = (vendors.data || []).map((v) => ({
    url: `/vendor/${v.slug}`,
    changefreq: "weekly" as const,
    priority: 0.6,
    lastmod: v.updated_at,
  }));

  const blogUrls = (blogPosts.data || []).map((b) => ({
    url: `/blog/${b.slug}`,
    changefreq: "monthly" as const,
    priority: 0.5,
    lastmod: b.updated_at,
  }));

  const allUrls = [...staticPages, ...productUrls, ...vendorUrls, ...blogUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return sitemap;
}
