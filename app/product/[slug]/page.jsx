import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductPageClient from "./ProductPageClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).lean();
  
  if (!product) return { title: "Product — Sabir Shah Traders" };
  
  return {
    title: `${product.name} — Sabir Shah Traders`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).lean();
  
  if (!product) notFound();

  // Convert MongoDB _id to string for serialization
  const serializedProduct = JSON.parse(JSON.stringify(product));
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "sku": product.sku || product._id.toString(),
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Sabir Shah Traders"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://sabirshah.pk/product/${product.slug}`,
      "priceCurrency": "PKR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={serializedProduct} />
    </>
  );
}
