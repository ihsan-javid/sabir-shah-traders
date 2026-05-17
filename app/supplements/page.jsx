import SupplementsClient from "./SupplementsClient";

export const metadata = {
  title: "Supplements — Sabir Shah Traders",
  description: "Shop 100% authentic dietary supplements in Pakistan. Whey proteins, daily vitamins, weight gainer, creatine, and pre-workout sourced directly from USA/UK.",
  keywords: ["buy whey protein pakistan", "authentic supplements karachi", "creatine price pakistan", "optimum nutrition pakistan"],
  openGraph: {
    title: "Supplements — Sabir Shah Traders",
    description: "Shop 100% authentic dietary supplements in Pakistan. Whey proteins, daily vitamins, weight gainer, creatine, and pre-workout sourced directly from USA/UK.",
    type: "website",
  }
};

export default function SupplementsPage() {
  return <SupplementsClient />;
}
