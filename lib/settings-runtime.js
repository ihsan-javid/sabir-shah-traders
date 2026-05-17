/**
 * Shared settings helpers for API + client pricing.
 * Security / admin notification prefs are stripped for public responses.
 */

export function sanitizeSettingsForStorefront(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const {
    security: _s,
    notifications: _n,
    __v,
    ...rest
  } = doc;
  return rest;
}

export function checkoutConfigsFromSettings(settings) {
  if (!settings) {
    return {
      shipping: { threshold: 0, rate: 0, freeShippingGlobal: false },
      tax: { enabled: false, rate: 0, label: "Tax", inclusive: false },
      codEnabled: true,
      codFee: 0,
    };
  }
  return {
    shipping: {
      threshold: Number(settings.freeDeliveryThreshold) || 0,
      rate: Number(settings.deliveryFee) || 0,
      freeShippingGlobal: Boolean(settings.shipping?.freeShippingGlobal),
    },
    tax: {
      enabled: Boolean(settings.tax?.enabled),
      rate: Number(settings.tax?.rate) || 0,
      label: settings.tax?.label || "Tax",
      inclusive: Boolean(settings.tax?.inclusive),
    },
    codEnabled: true,
    codFee: 0,
  };
}
