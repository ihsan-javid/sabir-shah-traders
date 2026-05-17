import AboutClient from "./AboutClient";

export const metadata = {
  title: "About Us — Sabir Shah Traders",
  description: "Learn about Sabir Shah Traders, Pakistan's most trusted source for 100% authentic dietary supplements and premium tech accessories.",
  keywords: ["about sabir shah traders", "authentic supplements pakistan", "premium electronics store pakistan"],
  openGraph: {
    title: "About Us — Sabir Shah Traders",
    description: "Learn about Sabir Shah Traders, Pakistan's most trusted source for 100% authentic dietary supplements and premium tech accessories.",
    type: "website",
  }
};

export default function AboutPage() {
  return <AboutClient />;
}
