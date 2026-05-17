import PolicyClient from "../[slug]/PolicyClient";

export const metadata = {
  title: "Shipping Policy — Sabir Shah Traders",
  description: "Learn about shipping times, delivery rates, and reliable nationwide logistics across Pakistan for supplements and electronics.",
  keywords: ["shipping policy", "delivery times", "nationwide delivery pakistan", "sabir shah traders"],
  openGraph: {
    title: "Shipping Policy — Sabir Shah Traders",
    description: "Learn about shipping times, delivery rates, and reliable nationwide logistics across Pakistan for supplements and electronics.",
    type: "website",
  }
};

export default function ShippingPolicyPage() {
  return <PolicyClient staticSlug="shipping" />;
}
