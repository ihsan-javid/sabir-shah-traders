import PolicyClient from "../[slug]/PolicyClient";

export const metadata = {
  title: "Terms of Service — Sabir Shah Traders",
  description: "Read our official terms of service, guidelines, and purchasing agreement before ordering at Sabir Shah Traders.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "sabir shah traders"],
  openGraph: {
    title: "Terms of Service — Sabir Shah Traders",
    description: "Read our official terms of service, guidelines, and purchasing agreement before ordering at Sabir Shah Traders.",
    type: "website",
  }
};

export default function TermsPolicyPage() {
  return <PolicyClient staticSlug="terms" />;
}
