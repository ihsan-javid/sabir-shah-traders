import PolicyClient from "../[slug]/PolicyClient";

export const metadata = {
  title: "Refund Policy — Sabir Shah Traders",
  description: "Read our comprehensive 7-day hassle-free return and refund policy at Sabir Shah Traders. Your satisfaction is our top priority.",
  keywords: ["refund policy", "return policy", "money back guarantee", "sabir shah traders"],
  openGraph: {
    title: "Refund Policy — Sabir Shah Traders",
    description: "Read our comprehensive 7-day hassle-free return and refund policy at Sabir Shah Traders. Your satisfaction is our top priority.",
    type: "website",
  }
};

export default function RefundPolicyPage() {
  return <PolicyClient staticSlug="refund" />;
}
