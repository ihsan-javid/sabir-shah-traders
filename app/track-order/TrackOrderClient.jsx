"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Shield,
  AlertCircle,
  ArrowRight,
  Home,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatPKR } from "@/lib/payments";
import { CopyButton } from "@/components/ui/copy-button";

// Order status steps
const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock, description: "Your order has been received" },
  { key: "confirmed", label: "Processing", icon: Package, description: "We are preparing your package" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "Your order is on the way" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Order delivered successfully" },
];

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  packed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  "out-for-delivery": "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !phone.trim() || !verificationCode.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
          verificationCode: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to find order");
      }

      setOrder(data.order);
      setShowForm(false);
      toast.success("Order found!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    const statusIndex = STATUS_STEPS.findIndex(s => s.key === order?.status);
    return statusIndex >= 0 ? statusIndex : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1E7A46] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SST</span>
              </div>
              <span className="font-bold text-[#111827] hidden sm:block">Sabir Shah Traders</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1E7A46] transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E7A46]/10 rounded-full mb-4">
                  <Search className="h-8 w-8 text-[#1E7A46]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Track Your Order
                </h1>
                <p className="text-gray-600">
                  Enter your order details to track your shipment
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Order Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Order Number
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. SST-250510-0001"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E7A46] focus:border-[#1E7A46] outline-none transition-all uppercase"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E7A46] focus:border-[#1E7A46] outline-none transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Same phone number used during checkout
                    </p>
                  </div>

                  {/* Verification Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Verification Code
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                        placeholder="e.g. A1B2C3"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E7A46] focus:border-[#1E7A46] outline-none transition-all uppercase font-mono tracking-wider"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800">
                        Your verification code was sent to your phone when you placed the order. Check your SMS messages.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#1E7A46] text-white font-semibold rounded-xl hover:bg-[#166335] focus:ring-4 focus:ring-[#1E7A46]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        Track Order
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  setShowForm(true);
                  setOrder(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-[#1E7A46] transition-colors"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                Track Another Order
              </button>

              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
                      <CopyButton textToCopy={order.orderNumber} />
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  {order.estimatedDelivery?.date && (
                    <span className="text-sm text-gray-600">
                      {order.estimatedDelivery.text}: <span className="font-medium">{order.estimatedDelivery.date}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Order Progress</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                    <motion.div
                      className="h-full bg-[#1E7A46] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(getCurrentStep() / (STATUS_STEPS.length - 1)) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= getCurrentStep();
                      const isCurrent = index === getCurrentStep();

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                              isActive
                                ? "bg-[#1E7A46] border-[#1E7A46] text-white"
                                : "bg-white border-gray-300 text-gray-400"
                            } ${isCurrent ? "ring-4 ring-[#1E7A46]/20" : ""}`}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                          <div className="mt-3 text-center">
                            <p className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-gray-500 mt-1 max-w-[100px]">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    Order Items ({order.items.length})
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPKR(item.price * item.qty)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="text-lg font-bold text-[#1E7A46]">
                        {formatPKR(order.pricing.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      Shipping Address
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-gray-600">{order.shipping.address}</p>
                      <p className="text-gray-600">
                        {order.shipping.city}
                        {order.shipping.postal && ` - ${order.shipping.postal}`}
                      </p>
                      <p className="text-gray-600">{order.customer.phone}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      Payment Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Method</span>
                        <span className="font-medium text-gray-900 uppercase">{order.payment.method}</span>
                      </div>
                      {order.payment.method !== "COD" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium capitalize ${
                            order.payment.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                           }`}>
                            {order.payment.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order History</h3>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#1E7A46]" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {history.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.timestamp).toLocaleString("en-PK")}
                          </p>
                          {history.note && (
                            <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
