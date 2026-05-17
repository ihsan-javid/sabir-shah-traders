import PolicyClient from "../[slug]/PolicyClient";

export const metadata = {
  title: "Privacy Policy — Sabir Shah Traders",
  description: "Learn how Sabir Shah Traders protects your personal data, secure transactions, and handles client privacy with absolute care.",
  keywords: ["privacy policy", "data protection", "secure shopping", "sabir shah traders"],
  openGraph: {
    title: "Privacy Policy — Sabir Shah Traders",
    description: "Learn how Sabir Shah Traders protects your personal data, secure transactions, and handles client privacy with absolute care.",
    type: "website",
  }
};

export default function PrivacyPolicyPage() {
  return <PolicyClient staticSlug="privacy" />;
}
