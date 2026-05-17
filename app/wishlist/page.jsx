import WishlistClient from "./WishlistClient";

export const metadata = {
  title: "My Wishlist — Sabir Shah Traders",
  robots: {
    index: false,
    follow: false,
  }
};

export default function WishlistPage() {
  return <WishlistClient />;
}
