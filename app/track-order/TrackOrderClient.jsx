"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Clock, CheckCircle, Truck, XCircle, RefreshCw, Box } from "lucide-react";
import { formatPKR } from "@/lib/payments";
import { toast } from "sonner";
import { CategoryHero } from "@/components/CategoryHero";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: RefreshCw,
};

export default function TrackOrderClient() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    phone: "",
    verificationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orderNumber || !formData.phone || !formData.verificationCode) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to find order.");
      }

      setOrder(data.order);
      toast.success("Order found!");
    } catch (err) {
      toast.error(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CategoryHero
        eyebrow="Order Tracking"
        title="Track Your Order"
        description="Enter your order details below to see its real-time status and expected delivery."
        icon={<Box className="h-5 w-5" />}
        accent="brand"
      />

      <section className="py-12 lg:py-20 relative z-10">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10">
            {/* Tracking Form */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl h-fit">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Find Order</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value.toUpperCase() }))}
                    placeholder="SST-XXXXXXXX"
                    className="w-full rounded-xl glass px-4 py-3.5 text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. A1B2C3"
                    className="w-full rounded-xl glass px-4 py-3.5 text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="03XXXXXXXXX"
                    className="w-full rounded-xl glass px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-4 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Track Order <Search className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            <div>
              <AnimatePresence mode="wait">
                {order ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Status Tracker */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">
                            Status
                          </h3>
                          <p className="text-2xl font-black capitalize text-foreground flex items-center gap-2">
                            {(() => {
                              const StatusIcon = STATUS_ICONS[order.status] || Package;
                              return (
                                <>
                                  <StatusIcon className="h-6 w-6 text-primary" />
                                  {order.status}
                                </>
                              );
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Order Date
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {order.status !== "cancelled" && order.status !== "refunded" && (
                        <div className="relative pt-6 pb-2">
                          <div className="absolute top-8 left-0 w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${Math.max(0, STATUS_STEPS.indexOf(order.status)) / (STATUS_STEPS.length - 1) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="relative flex justify-between">
                            {STATUS_STEPS.map((step, idx) => {
                              const currentIndex = STATUS_STEPS.indexOf(order.status);
                              const isCompleted = idx <= currentIndex;
                              const isCurrent = idx === currentIndex;
                              
                              return (
                                <div key={step} className="flex flex-col items-center">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-3 z-10 transition-colors duration-500 border-2 ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'}`}>
                                    {isCompleted && <CheckCircle className="h-3 w-3" />}
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isCurrent ? 'text-primary' : 'text-muted-foreground hidden sm:block'}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {order.status === "cancelled" && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2">
                          <XCircle className="h-5 w-5" /> This order has been cancelled.
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                        <Package className="h-4 w-4" /> Ordered Items
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <div className="h-16 w-16 bg-muted rounded-xl flex-shrink-0 p-1 border border-border">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">Qty: {item.qty}</p>
                            </div>
                            <p className="font-black text-sm text-foreground">
                              {formatPKR(item.price * item.qty)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-border space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-semibold">Subtotal</span>
                          <span className="font-bold font-mono">{formatPKR(order.pricing.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-semibold">Shipping</span>
                          <span className="font-bold font-mono">{order.pricing.shipping === 0 ? "Free" : formatPKR(order.pricing.shipping)}</span>
                        </div>
                        {order.pricing.discount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span className="font-semibold">Discount</span>
                            <span className="font-bold font-mono">-{formatPKR(order.pricing.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-4 mt-2 border-t border-border">
                          <span className="text-xs font-black uppercase tracking-widest text-foreground">Total Paid</span>
                          <span className="text-lg font-black text-primary font-mono">{formatPKR(order.pricing.total)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center p-12 lg:min-h-[500px]"
                  >
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30 mb-6">
                      <Search className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Track Your Package</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Enter your order number, verification code, and phone number to see the latest updates on your shipment.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
