import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    const robots = settings?.seo?.robotsTxt || "User-agent: *\nAllow: /\n\nSitemap: https://sabirshahtraders.com/sitemap.xml";
    
    return new Response(robots, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    return new Response("User-agent: *\nAllow: /", {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
