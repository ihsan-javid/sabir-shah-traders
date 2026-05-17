import PolicyClient from "./PolicyClient";
import { Truck, Shield, FileText, RefreshCw } from "lucide-react";

const POLICY_METADATA = {
  shipping: {
    title: "Shipping Policy",
    description: "Everything you need to know about delivery times, costs, and tracking."
  },
  refund: {
    title: "Refund Policy",
    description: "Our commitment to your satisfaction with easy returns and refunds."
  },
  privacy: {
    title: "Privacy Policy",
    description: "How we protect your data and respect your privacy."
  },
  terms: {
    title: "Terms of Service",
    description: "The legal guidelines for using our platform and purchasing products."
  }
};

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  const policy = POLICY_METADATA[slug];
  if (!policy) {
    return {
      title: "Store Policy — Sabir Shah Traders",
      description: "Read the official business guidelines, terms, and policies of Sabir Shah Traders."
    };
  }
  return {
    title: `${policy.title} — Sabir Shah Traders`,
    description: policy.description,
    openGraph: {
      title: `${policy.title} — Sabir Shah Traders`,
      description: policy.description,
      type: "website",
    }
  };
}

export default function PolicyPage() {
  return <PolicyClient />;
}
