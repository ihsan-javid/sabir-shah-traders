// Payment processing utilities for Pakistan e-commerce
// Supports COD, EasyPaisa, JazzCash, and Card payments

// Payment method definitions for Pakistan e-commerce
// This is defined here (not in models/Order.js) to avoid importing Mongoose in client components
export const PAYMENT_METHODS = {
  COD: {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay in cash when your order arrives",
    icon: "Banknote",
    color: "#1E7A46",
    gateway: null, // No gateway needed
  },
  EASYPAISA: {
    id: "easypaisa",
    name: "EasyPaisa",
    description: "Pay via EasyPaisa mobile wallet",
    icon: "Wallet",
    color: "#FFD700",
    gateway: "easypaisa",
    accountNumber: process.env.EASYPAISA_ACCOUNT || "03XX-XXXXXXX",
  },
  JAZZCASH: {
    id: "jazzcash",
    name: "JazzCash",
    description: "Pay via JazzCash mobile wallet",
    icon: "Smartphone",
    color: "#EE1D52",
    gateway: "jazzcash",
    accountNumber: process.env.JAZZCASH_ACCOUNT || "03XX-XXXXXXX",
  },
  CARD: {
    id: "card",
    name: "Debit / Credit Card",
    description: "Pay securely with your card (Visa/Mastercard)",
    icon: "CreditCard",
    color: "#1E3A5F",
    gateway: "stripe", // Ready for Stripe integration
  },
};

/**
 * Get all available payment methods for checkout
 */
export function getAvailablePaymentMethods() {
  return Object.entries(PAYMENT_METHODS).map(([key, config]) => ({
    id: key,
    ...config,
  }));
}

/**
 * Get payment method details by ID
 */
export function getPaymentMethod(methodId) {
  return PAYMENT_METHODS[methodId.toUpperCase()] || PAYMENT_METHODS.COD;
}

/**
 * Validate payment method selection
 */
export function validatePaymentMethod(methodId) {
  const method = PAYMENT_METHODS[methodId?.toUpperCase()];

  if (!method) {
    return {
      valid: false,
      error: "Invalid payment method selected",
    };
  }

  return {
    valid: true,
    method,
  };
}

/**
 * Calculate shipping cost based on order total
 */
export function calculateShipping(subtotal) {
  // Free shipping for orders over 5000 PKR
  const FREE_SHIPPING_THRESHOLD = 5000;
  const BASE_SHIPPING_RATE = 250;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      free: true,
      message: "Free shipping",
    };
  }

  return {
    cost: BASE_SHIPPING_RATE,
    free: false,
    message: `Rs ${BASE_SHIPPING_RATE} shipping`,
  };
}

/**
 * Calculate order totals from store settings (legacy API)
 * Used by cart, checkout, and product page clients
 */
export function orderTotalsFromSettings(items, settings, coupon, paymentMethod) {
  const freeThreshold = settings?.shipping?.freeThreshold ?? 5000;
  const shippingRate = settings?.shipping?.rate ?? 250;

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty = item.qty || 1;
    return sum + price * qty;
  }, 0);

  const shippingFree = subtotal >= freeThreshold;
  const shipping = shippingFree ? 0 : shippingRate;

  let discount = 0;
  let couponCode = null;
  if (coupon) {
    discount = coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;
    couponCode = coupon.code || null;
  }

  const tax = 0;
  const total = Math.max(0, subtotal + shipping - discount + tax);

  return {
    subtotal,
    shipping,
    shippingFree,
    shippingLabel: shippingFree ? "Free shipping" : `Rs ${shippingRate} shipping`,
    discount,
    tax,
    total,
    itemCount: items.reduce((sum, item) => sum + (item.qty || 1), 0),
    couponCode,
    paymentMethod: paymentMethod || "COD",
  };
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(items, discountCode = null) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const qty = item.qty || 1;
    return sum + price * qty;
  }, 0);

  const shipping = calculateShipping(subtotal);
  const discount = 0; // TODO: Apply discount code logic
  const tax = 0; // TODO: Apply tax calculation if needed

  const total = subtotal + shipping.cost - discount + tax;

  return {
    subtotal,
    shipping: shipping.cost,
    shippingFree: shipping.free,
    discount,
    tax,
    total,
    itemCount: items.reduce((sum, item) => sum + (item.qty || 1), 0),
  };
}

/**
 * Generate EasyPaisa payment instructions
 */
export function generateEasyPaisaInstructions(
  accountNumber,
  amount,
  reference,
) {
  return {
    title: "EasyPaisa Payment Instructions",
    steps: [
      `Open your EasyPaisa mobile app`,
      `Select "Send Money" or "Mobile Account"`,
      `Enter this account number: ${accountNumber}`,
      `Enter amount: Rs ${amount.toLocaleString("en-PK")}`,
      `Add reference: ${reference}`,
      `Confirm and complete the payment`,
      `Note your transaction ID for verification`,
    ],
    accountNumber,
    amount,
    reference,
    note: "Your order will be processed once payment is confirmed",
  };
}

/**
 * Generate JazzCash payment instructions
 */
export function generateJazzCashInstructions(accountNumber, amount, reference) {
  return {
    title: "JazzCash Payment Instructions",
    steps: [
      `Dial *786# from your Jazz number`,
      `Select "Send Money"`,
      `Enter recipient mobile number: ${accountNumber}`,
      `Enter amount: Rs ${amount.toLocaleString("en-PK")}`,
      `Enter your MPIN to confirm`,
      `Note your transaction ID for verification`,
    ],
    alternativeApp: [
      `Or use JazzCash App:`,
      `Open JazzCash mobile app`,
      `Tap "Send Money"`,
      `Enter ${accountNumber} and amount`,
      `Confirm payment`,
    ],
    accountNumber,
    amount,
    reference,
    note: "Your order will be processed once payment is confirmed",
  };
}

/**
 * Format price in PKR
 */
export function formatPKR(amount) {
  if (amount === 0) return "Free";
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

/**
 * Generate unique reference number for payment
 */
export function generatePaymentReference(orderId) {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `PAY-${orderId.slice(-6)}-${timestamp.slice(-4)}`;
}

/**
 * Check if payment method requires manual verification
 */
export function requiresManualVerification(methodId) {
  return ["EASYPAISA", "JAZZCASH"].includes(methodId?.toUpperCase());
}

/**
 * Check if payment method is instant
 */
export function isInstantPayment(methodId) {
  return ["COD", "CARD"].includes(methodId?.toUpperCase());
}

/**
 * Get payment status flow
 */
export function getPaymentStatusFlow(currentStatus) {
  const flows = {
    pending: ["authorized", "paid", "failed", "cancelled"],
    authorized: ["paid", "failed", "cancelled"],
    paid: ["refunded"],
    failed: ["pending"],
    cancelled: [],
    refunded: [],
  };

  return flows[currentStatus] || [];
}

/**
 * Validate card details (basic validation for Pakistan cards)
 */
export function validateCardDetails(cardNumber, expiry, cvv) {
  const errors = [];

  // Remove spaces from card number
  const cleanNumber = cardNumber.replace(/\s/g, "");

  // Check length (16 for most cards)
  if (!/^\d{16}$/.test(cleanNumber)) {
    errors.push("Card number must be 16 digits");
  }

  // Luhn algorithm check (basic)
  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  if (sum % 10 !== 0) {
    errors.push("Invalid card number");
  }

  // Expiry validation (MM/YY format)
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.push("Expiry must be in MM/YY format");
  } else {
    const [month, year] = expiry.split("/").map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      errors.push("Invalid expiry month");
    } else if (
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      errors.push("Card has expired");
    }
  }

  // CVV validation
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push("CVV must be 3 or 4 digits");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect card type from number
 */
export function detectCardType(cardNumber) {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    jcb: /^(?:2131|1800|35)/,
  };

  const cleanNumber = cardNumber.replace(/\s/g, "");

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }

  return "unknown";
}

/**
 * Create order data from checkout form
 */
export function createOrderData(checkoutData) {
  const {
    customer,
    items,
    paymentMethod,
    shipping,
    pricing,
    ipAddress,
    userAgent,
  } = checkoutData;

  return {
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim()?.toLowerCase() || "",
      userId: customer.userId || null,
    },
    items: items.map((item) => ({
      productId: item.product._id || item.product.id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      qty: item.qty,
      variant: item.variant || null,
    })),
    payment: {
      method: paymentMethod.toUpperCase(),
      status: paymentMethod.toUpperCase() === "COD" ? "pending" : "pending",
    },
    shipping: {
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      postal: shipping.postal?.trim() || "",
      notes: shipping.notes?.trim() || "",
    },
    pricing: {
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      discount: pricing.discount || 0,
      tax: pricing.tax || 0,
      total: pricing.total,
      currency: "PKR",
    },
    status: "pending",
    ipAddress,
    userAgent,
    source: "website",
  };
}

// Payment method UI configurations for React components
export const PAYMENT_UI_CONFIG = {
  COD: {
    icon: "Banknote",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  EASYPAISA: {
    icon: "Wallet",
    color: "from-yellow-400 to-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
  },
  JAZZCASH: {
    icon: "Smartphone",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
  },
  CARD: {
    icon: "CreditCard",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
};
