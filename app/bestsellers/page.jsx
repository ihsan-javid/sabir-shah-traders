import BestsellersClient from "./BestsellersClient";

export const metadata = {
  title: "Bestsellers — Sabir Shah Traders",
  description: "Shop our most popular, highly coveted bestsellers in supplements and electronics. Discover top products backed by 100% authenticity and fast nationwide delivery.",
  keywords: ["bestselling supplements pakistan", "most popular tech accessories pakistan", "bestsellers sabir shah traders"],
  openGraph: {
    title: "Bestsellers — Sabir Shah Traders",
    description: "Shop our most popular, highly coveted bestsellers in supplements and electronics. Discover top products backed by 100% authenticity and fast nationwide delivery.",
    type: "website",
  }
};

export default function BestsellersPage() {
  return <BestsellersClient />;
}
