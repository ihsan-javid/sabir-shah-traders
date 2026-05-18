export const metadata = {
  title: "Track Order — Sabir Shah Traders",
  description: "Track the real-time status of your order.",
  openGraph: {
    title: "Track Order — Sabir Shah Traders",
    description: "Track the real-time status of your order.",
    type: "website",
  }
};

import TrackOrderClient from "./TrackOrderClient";

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
