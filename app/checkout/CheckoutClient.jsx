"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Banknote,
  Wallet,
  Smartphone,
  CreditCard,
  AlertCircle,
  Loader2,
  ChevronRight,
  Copy,
  CheckCheck,
  ArrowLeft,
  Upload,
  X,
  Package,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPKR, orderTotalsFromSettings } from "@/lib/payments";
import { toast } from "sonner";
import { CopyButton } from "@/components/ui/copy-button";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

const validatePhone = (phone) => {
  const cleaned = phone.replace(/\s/g, "");
  return /^\+?92\d{10}$/.test(cleaned) || /^0\d{10}$/.test(cleaned);
};

const validateEmail = (email) => {
  if (!email) return true; // Optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

function Field({ label, error, className = "", icon: Icon, ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {rest.required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <input
          {...rest}
          className={`mt-1.5 w-full rounded-xl bg-surface-elevated border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
            Icon ? "pl-10" : ""
          } ${
            error ?
              "border-red-500 focus:border-red-500 focus:ring-red-500/30"
            : "border-border focus:border-tech focus:ring-tech/30"
          }`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </label>
  );
}

function PaymentInstructions({ orderDetails }) {
  return (
    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
      <div className="flex items-center gap-2 text-primary font-semibold mb-2">
        <Banknote className="h-5 w-5" />
        Cash on Delivery
      </div>
      <p className="text-sm text-muted-foreground">
        You will pay {formatPKR(orderDetails.total)} in cash when your order is
        delivered
        {orderDetails.codFee > 0 ?
          ` (includes ${formatPKR(orderDetails.codFee)} COD service fee).`
        : "."}
      </p>
    </div>
  );
}

export default function CheckoutClient() {
  const { items, clear, buyNowItem, clearBuyNow } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const { settings } = useStoreSettings();

  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e) => {
      const { deltaY } = e;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });

    return () => el.removeEventListener("wheel", handler);
  }, []);

  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [verificationCode, setVerificationCode] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const hasItems = buyNowItem || items.length > 0;

  const checkoutItems = useMemo(
    () => (buyNowItem ? [buyNowItem] : items),
    [buyNowItem, items],
  );

  const pricing = useMemo(
    () =>
      orderTotalsFromSettings(
        checkoutItems,
        settings,
        appliedCoupon,
        paymentMethod,
      ),
    [checkoutItems, appliedCoupon, settings, paymentMethod],
  );

  const applyCoupon = async () => {
    if (!couponCode || !couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) {
        throw new Error("Failed to fetch coupons");
      }
      const coupons = await res.json();
      const normalizedCode = couponCode.trim().toUpperCase();
      const found = coupons.find(
        (c) => c.code && c.code.toUpperCase() === normalizedCode,
      );

      if (!found) {
        toast.error("Invalid coupon code");
        return;
      }

      if (found.active === false) {
        toast.error("Coupon is inactive");
        return;
      }

      if (found.expiry && new Date(found.expiry) < new Date()) {
        toast.error("This coupon has expired.");
        return;
      }

      if (
        (found.maxUsage > 0 && found.usageCount >= found.maxUsage) ||
        (found.maxUses > 0 && found.used >= found.maxUses)
      ) {
        toast.error("This coupon has reached its usage limit.");
        return;
      }

      const minOrder = found.minOrder || 0;
      if (pricing.subtotal < minOrder) {
        toast.error(`Minimum order of ${formatPKR(minOrder)} required`);
        return;
      }

      setAppliedCoupon(found);
      toast.success("Coupon applied!");
    } catch (err) {
      console.error("Coupon validation error:", err);
      toast.error("Error validating coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return (
          !value?.trim() ? "Full name is required"
          : value.trim().length < 2 ? "Name is too short"
          : null
        );
      case "phone":
        return (
          !value?.trim() ? "Phone number is required"
          : !validatePhone(value) ? "Enter a valid Pakistani phone number"
          : null
        );
      case "email":
        return value && !validateEmail(value) ?
            "Enter a valid email address"
          : null;
      case "address":
        return (
          !value?.trim() ? "Delivery address is required"
          : value.trim().length < 10 ? "Please enter a complete address"
          : null
        );
      case "city":
        return !value?.trim() ? "City is required" : null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["name", "phone", "address", "city"];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    setTouched(Object.fromEntries(requiredFields.map((f) => [f, true])));

    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (paymentMethod === "COD" && settings?.shipping?.codEnabled === false) {
      toast.error(
        "Cash on delivery is not available. Please contact the store.",
      );
      return;
    }

    if (paymentMethod === "CARD") {
      toast.info("Card payments coming soon! Please select another method.");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || "",
        },
        items: checkoutItems.map((item) => ({
          productId: item.product._id || item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          qty: item.qty,
        })),
        payment: {
          method: paymentMethod,
        },
        shipping: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          postal: formData.postal?.trim() || "",
          notes: formData.notes?.trim() || "",
        },
        pricing: {
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          discount: pricing.discount,
          tax: pricing.tax,
          codFee: pricing.codFee,
          total: pricing.total,
        },
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setOrderNumber(data.order.orderNumber);
        setVerificationCode(data.order.verificationCode);
        setDone(true);
        if (buyNowItem) {
          clearBuyNow();
        } else {
          clear();
        }
        toast.success(`Order ${data.order.orderNumber} placed successfully!`);
      } else {
        const errorMsg = data.error || "Failed to create order";
        console.error("Order API error:", {
          status: res.status,
          error: errorMsg,
        });
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done && orderNumber) {
    return (
      <section className="pt-28 pb-24 min-h-[80vh] grid place-items-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.7 }}
          className="text-center max-w-md w-full">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 grid place-items-center shadow-lg">
            <Check className="h-10 w-10 text-white" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We&apos;ve sent the details to your phone.
          </p>

          <div className="mt-6 p-4 bg-surface-elevated rounded-xl border border-border">
            <div className="text-sm text-muted-foreground mb-1">
              Order Number
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl font-bold text-primary">
                {orderNumber}
              </div>
              <CopyButton textToCopy={orderNumber} />
            </div>
          </div>

          {verificationCode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-600 mb-1 font-medium">
                Verification Code (Save this!)
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-xl font-bold text-blue-700 tracking-wider font-mono">
                  {verificationCode}
                </div>
                <CopyButton textToCopy={verificationCode} />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                You need this code to track your order. We&apos;ve also sent it
                to your phone.
              </p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push("/track-order")}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
              <Package className="h-5 w-5" />
              Track Your Order
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-border bg-surface-elevated py-3 rounded-xl font-semibold hover:bg-muted transition">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-24 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>

        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete your order by filling in your details below.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="rounded-2xl glass p-5 sm:p-6">
              <div className="font-semibold mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                Contact Information
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && errors.name}
                  required
                  placeholder="Enter your full name"
                  className="sm:col-span-2"
                />
                <Field
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && errors.phone}
                  required
                  placeholder="03XX-XXXXXXX"
                />
                <Field
                  label="Email (optional)"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="rounded-2xl glass p-5 sm:p-6">
              <div className="font-semibold mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </div>
                Delivery Address
              </div>
              <div className="grid gap-3">
                <Field
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && errors.address}
                  required
                  placeholder="House #, Street, Area"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.city && errors.city}
                    required
                    placeholder="e.g., Lahore, Karachi"
                  />
                  <Field
                    label="Postal Code (optional)"
                    name="postal"
                    value={formData.postal}
                    onChange={handleChange}
                    placeholder="54000"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Delivery Notes (optional)
                  </span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any special instructions for delivery..."
                    className="mt-1.5 w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/30 transition resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass p-5 sm:p-6">
              <div className="font-semibold mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                Payment Method
              </div>

              {settings?.shipping?.codEnabled === false ?
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
                  Cash on delivery is turned off in store settings. Please
                  contact {settings?.contactPhone || "the store"} to complete
                  your order.
                </div>
              : <>
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <Banknote className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">
                        Cash on Delivery (COD)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pay in cash when your order arrives.
                        {pricing.codFee > 0 ?
                          ` A ${formatPKR(pricing.codFee)} COD fee applies.`
                        : ""}
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <PaymentInstructions
                      orderDetails={{
                        total: pricing.total,
                        codFee: pricing.codFee,
                      }}
                    />
                  </div>
                </>
              }
            </div>
          </div>

          <div className="space-y-4">
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="rounded-2xl glass p-5 sm:p-6 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar z-10"
              style={{ overscrollBehavior: "contain" }}>
              <div className="font-semibold mb-4 text-lg">Order Summary</div>

              <div
                className="space-y-3 max-h-64 overflow-auto pr-2 -mr-2"
                data-lenis-prevent>
                {checkoutItems.length === 0 ?
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Your cart is empty
                  </div>
                : checkoutItems.map((item) => (
                    <div
                      key={item.product._id || item.product.id}
                      className="flex items-center gap-3 text-sm">
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          loading="lazy"
                          className="h-12 w-12 rounded-lg object-cover bg-muted"
                        />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                          {item.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-1 font-medium">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPKR(item.product.price)} × {item.qty}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatPKR(item.product.price * item.qty)}
                      </div>
                    </div>
                  ))
                }
              </div>

              {!appliedCoupon ?
                <div className="mt-6 mb-4 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 rounded-xl bg-surface-elevated border border-border px-4 py-2 text-sm focus:outline-none focus:border-tech transition"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-foreground text-background rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 transition-all">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              : <div className="mt-6 mb-4 flex items-center justify-between p-3 rounded-xl bg-tech/10 border border-tech/20">
                  <div className="text-xs">
                    <span className="font-bold text-tech">
                      {appliedCoupon.code}
                    </span>{" "}
                    applied
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="p-1 rounded-lg hover:bg-tech/20 text-tech transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              }

              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({pricing.itemCount} items)</span>
                  <span>{formatPKR(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span
                    className={
                      pricing.shippingFree ? "text-primary font-medium" : ""
                    }>
                    {pricing.shippingLabel}
                  </span>
                </div>
                {settings?.tax?.enabled && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {pricing.taxLabel} ({settings.tax.rate}%)
                      {pricing.taxInclusive ? " (inclusive)" : ""}
                    </span>
                    <span>{formatPKR(pricing.tax)}</span>
                  </div>
                )}
                {pricing.codFee > 0 &&
                  settings?.shipping?.codEnabled !== false && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>COD fee</span>
                      <span>{formatPKR(pricing.codFee)}</span>
                    </div>
                  )}
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>
                      Discount
                      {appliedCoupon && appliedCoupon.type === "percent" ?
                        ` (${appliedCoupon.value}%)`
                      : appliedCoupon ?
                        ` (Rs ${appliedCoupon.value})`
                      : ""}
                      :
                    </span>
                    <span>-{formatPKR(pricing.discount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPKR(pricing.total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  checkoutItems.length === 0 ||
                  (paymentMethod === "COD" &&
                    settings?.shipping?.codEnabled === false)
                }
                className="mt-6 w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ?
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                : <>
                    {settings?.uiLabels?.buyNow || "Place Order"}
                    <ChevronRight className="h-5 w-5" />
                  </>
                }
              </button>

              <p className="mt-3 text-xs text-center text-muted-foreground">
                By placing this order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>

            <div className="rounded-xl bg-surface-elevated border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                <span>Secure SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Check className="h-4 w-4 text-green-500" />
                <span>
                  {settings?.shipping?.codEnabled === false ?
                    "Contact the store to arrange payment"
                  : "Cash on delivery available"}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
