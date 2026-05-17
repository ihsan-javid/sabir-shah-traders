import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    const domain = settings?.seo?.canonicalBase || "https://sabirshahtraders.com";

    // Fetch active products
    const products = await Product.find({}).lean();

    const staticPages = [
      "",
      "/supplements",
      "/electronics",
      "/bestsellers",
      "/about",
      "/contact",
      "/policies/privacy",
      "/policies/refund",
      "/policies/shipping",
      "/policies/terms",
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach((path) => {
      xml += `
  <url>
    <loc>${domain}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    });

    // Add products
    products.forEach((p) => {
      if (p.slug) {
        xml += `
  <url>
    <loc>${domain}/product/${p.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
