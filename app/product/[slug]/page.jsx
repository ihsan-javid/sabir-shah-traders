import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductPageClient from "./ProductPageClient";

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
  
  return <ProductPageClient product={serializedProduct} />;
}
