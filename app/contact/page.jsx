import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us — Sabir Shah Traders",
  description: "Get in touch with Sabir Shah Traders. Contact us via WhatsApp, email, or contact form for quick queries regarding supplements or tech gear.",
  keywords: ["contact sabir shah traders", "customer support supplements pakistan", "electronics store phone number pakistan"],
  openGraph: {
    title: "Contact Us — Sabir Shah Traders",
    description: "Get in touch with Sabir Shah Traders. Contact us via WhatsApp, email, or contact form for quick queries regarding supplements or tech gear.",
    type: "website",
  }
};

export default function ContactPage() {
  return <ContactClient />;
}
