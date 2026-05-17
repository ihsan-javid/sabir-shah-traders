import ElectronicsClient from "./ElectronicsClient";

export const metadata = {
  title: "Electronics — Sabir Shah Traders",
  description: "Explore premium, hand-picked headphones, smartwatches, speakers, and premium audio gear in Pakistan. 100% genuine tech with local warranty.",
  keywords: ["premium headphones pakistan", "buy smartwatches karachi", "original bluetooth speakers pakistan", "tech accessories store pakistan"],
  openGraph: {
    title: "Electronics — Sabir Shah Traders",
    description: "Explore premium, hand-picked headphones, smartwatches, speakers, and premium audio gear in Pakistan. 100% genuine tech with local warranty.",
    type: "website",
  }
};

export default function ElectronicsPage() {
  return <ElectronicsClient />;
}
