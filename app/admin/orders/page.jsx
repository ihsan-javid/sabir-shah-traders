"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  MoreVertical,
  X,
  Package,
  MapPin,
  CreditCard,
  User,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Wallet,
  Smartphone,
  Image as ImageIcon,
} from "lucide-react";
import { formatPKR } from "@/lib/payments";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { toast } from "sonner";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: RefreshCw,
};

const PAYMENT_ICONS = {
  COD: Banknote,
  EASYPAISA: Wallet,
  JAZZCASH: Smartphone,
  CARD: CreditCard,
};

const PAYMENT_STYLES = {
  COD: "bg-green-100 text-green-700",
  EASYPAISA: "bg-yellow-100 text-yellow-700",
  JAZZCASH: "bg-pink-100 text-pink-700",
  CARD: "bg-blue-100 text-blue-700",
};

const ALL_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES = {
  pending: { label: "Pending", style: "bg-gray-100 text-gray-600" },
  authorized: { label: "Authorized", style: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", style: "bg-green-100 text-green-700" },
  failed: { label: "Failed", style: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", style: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Body scroll lock when order details slide-over is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedOrder]);

  // Bulk deletion handlers
  const triggerBulkDelete = () => {
    if (selectedOrderIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const executeBulkDelete = async () => {
    setBulkDeleteConfirmOpen(false);
    try {
      setLoading(true);
      await Promise.all(
        selectedOrderIds.map(id =>
          fetch(`/api/orders/${id}`, {
            method: "DELETE",
            credentials: "include"
          })
        )
      );
      toast.success("Selected orders deleted successfully");
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete some orders");
    } finally {
      setLoading(false);
    }
  };

  // Bulk status update handler
  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await Promise.all(
        selectedOrderIds.map(id =>
          fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: newStatus })
          })
        )
      );
      toast.success(`Selected orders updated to ${newStatus}`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err) {
      console.error("Bulk status update error:", err);
      toast.error("Failed to update status for some orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const res = await fetch(`/api/orders?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin-login";
          return;
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({ ...o, status: newStatus }));
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update order status");
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update payment status");

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ?
            { ...o, payment: { ...o.payment, status: newStatus } }
          : o,
        ),
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({
          ...o,
          payment: { ...o.payment, status: newStatus },
        }));
      }

      toast.success(`Payment status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating payment:", err);
      toast.error("Failed to update payment status");
    }
  };

  // Filter orders based on search
  const filtered = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      o.customer?.name?.toLowerCase().includes(searchLower) ||
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.customer?.phone?.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Use filtered count or just orders for display
  const displayOrders = search ? filtered : orders;

  const statusCounts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Orders</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Manage and track customer orders
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s ?
                "bg-[#1E7A46] text-white shadow-sm"
              : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}>
            {s}
            {s !== "all" && statusCounts[s] > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === s ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                {statusCounts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F3F4F6] border border-transparent rounded-lg focus:outline-none focus:border-[#1E7A46]/50 focus:bg-white transition-all"
            />
          </div>
          <p className="text-sm text-[#9CA3AF] ml-auto">
            {displayOrders.length} orders
          </p>
        </div>

        {/* Bulk Action Bar */}
        {selectedOrderIds.length > 0 && (
          <div className="bg-emerald-50 border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between transition-all">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1E7A46]">
                {selectedOrderIds.length} orders selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkStatusUpdate("confirmed")}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                Mark Confirmed
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("shipped")}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition">
                Mark Shipped
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("delivered")}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition">
                Mark Delivered
              </button>
              <button
                onClick={triggerBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition">
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={displayOrders.length > 0 && selectedOrderIds.length === displayOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds(displayOrders.map(o => o._id));
                      } else {
                        setSelectedOrderIds([]);
                      }
                    }}
                    className="rounded border-gray-300 text-[#1E7A46] focus:ring-[#1E7A46] h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Order
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Method
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ?
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#9CA3AF]" />
                    <p className="text-sm text-[#9CA3AF] mt-2">
                      Loading orders...
                    </p>
                  </td>
                </tr>
              : error ?
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto text-red-500" />
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                    <button
                      onClick={fetchOrders}
                      className="mt-3 text-sm text-[#1E7A46] hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              : displayOrders.map((o) => {
                  const Icon = STATUS_ICONS[o.status] || Clock;
                  const PaymentIcon =
                    PAYMENT_ICONS[o.payment?.method] || CreditCard;
                  const date =
                    o.createdAt ?
                      new Date(o.createdAt).toLocaleDateString("en-PK")
                    : "-";
                  return (
                    <tr
                      key={o._id}
                      className={`hover:bg-[#F8F9FA] transition-colors ${selectedOrderIds.includes(o._id) ? "bg-[#1E7A46]/5 hover:bg-[#1E7A46]/10" : ""}`}>
                      <td className="px-5 py-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(o._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(prev => [...prev, o._id]);
                            } else {
                              setSelectedOrderIds(prev => prev.filter(id => id !== o._id));
                            }
                          }}
                          className="rounded border-gray-300 text-[#1E7A46] focus:ring-[#1E7A46] h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#1E7A46]">
                        <div>{o.orderNumber}</div>
                        {o.verificationCode && (
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                            Code: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">{o.verificationCode}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#111111]">
                          {o.customer?.name}
                        </div>
                        <div className="text-xs text-[#9CA3AF]">
                          {o.customer?.phone}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7280]">{date}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>
                          <Icon className="h-3 w-3" /> {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${PAYMENT_STYLES[o.payment?.method] || "bg-gray-100 text-gray-600"}`}>
                          <PaymentIcon className="h-3 w-3" />
                          {o.payment?.method}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#111111]">
                        {formatPKR(o.pricing?.total || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111111] transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
              {!loading && !error && displayOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[#9CA3AF]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#9CA3AF]">
            Showing {displayOrders.length} of {pagination.total} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page <= 1}
              className="h-7 w-7 rounded text-xs font-medium flex items-center justify-center disabled:opacity-30 hover:bg-[#F3F4F6]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-[#6B7280] px-2">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(pagination.pages || 1, p.page + 1),
                }))
              }
              disabled={pagination.page >= (pagination.pages || 1)}
              className="h-7 w-7 rounded text-xs font-medium flex items-center justify-center disabled:opacity-30 hover:bg-[#F3F4F6]">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Slide-over Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 translate-x-0">
                <div
                  data-lenis-prevent
                  className="flex h-full flex-col overflow-y-auto overscroll-y-contain bg-card text-foreground border-l border-border shadow-2xl custom-scrollbar">
                  {/* Header */}
                  <div className="bg-muted/30 px-8 py-8 sm:px-10 border-b border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <h2 className="text-2xl font-black text-foreground flex items-center gap-3 tracking-tight font-display">
                          {selectedOrder.orderNumber}
                          {selectedOrder.verificationCode && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 font-mono px-3 py-1 rounded-full border border-amber-200 font-black tracking-widest uppercase">
                              Code: {selectedOrder.verificationCode}
                            </span>
                          )}
                        </h2>
                        <p className="mt-1.5 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                          Placed on{" "}
                          {selectedOrder.createdAt ?
                            new Date(selectedOrder.createdAt).toLocaleString(
                              "en-PK",
                              { dateStyle: "medium", timeStyle: "short" },
                            )
                          : "-"}
                        </p>
                      </div>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="rounded-full bg-muted border border-border p-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:scale-105 active:scale-95 transition-all shadow-sm">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3 relative z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          selectedOrder.status === "delivered"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : selectedOrder.status === "cancelled"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}>
                        {selectedOrder.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          selectedOrder.payment?.method === "COD" && selectedOrder.payment?.status === "pending"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}>
                        Payment:{" "}
                        {selectedOrder.payment?.method === "COD" && selectedOrder.payment?.status === "pending" ?
                          "Cash on Delivery" : (PAYMENT_STATUSES[selectedOrder.payment?.status]?.label || "Pending")
                        }
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-8 py-8 sm:px-10 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Payment Verification Section */}
                        {selectedOrder.payment?.proof?.url && (
                          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-2 mb-3">
                              <ImageIcon className="h-4.5 w-4.5 text-amber-500" />
                              <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">
                                Payment Screenshot
                              </h3>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-amber-200 group-hover:border-amber-400 transition-all duration-300">
                              <img
                                src={selectedOrder.payment.proof.url}
                                alt="Payment proof"
                                className="w-full h-64 object-contain bg-muted cursor-pointer hover:opacity-90 transition duration-300"
                                onClick={() =>
                                  window.open(
                                    selectedOrder.payment.proof.url,
                                    "_blank",
                                  )
                                }
                              />
                            </div>
                            <p className="text-[10px] text-amber-600/70 font-semibold tracking-wide mt-2.5 text-center">
                              Click image to view full size
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() =>
                                  updatePaymentStatus(selectedOrder._id, "paid")
                                }
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all active:scale-[0.97]">
                                Verify Payment
                              </button>
                              <button
                                onClick={() =>
                                  updatePaymentStatus(
                                    selectedOrder._id,
                                    "failed",
                                  )
                                }
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-50 text-white text-xs font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all active:scale-[0.97]">
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Payment Method & Status */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Payment Details
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Method</span>
                              <span className="text-xs font-black bg-muted text-foreground border border-border px-2.5 py-1 rounded uppercase font-mono">
                                {selectedOrder.payment?.method}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                              <span className={`text-xs font-black px-2.5 py-1 rounded border ${
                                selectedOrder.payment?.status === "paid" 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                              }`}>
                                {selectedOrder.payment?.method === "COD" && selectedOrder.payment?.status === "pending" ?
                                  "Cash on Delivery" : (PAYMENT_STATUSES[selectedOrder.payment?.status]?.label || "Pending")
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-border pt-3">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                              <span className="text-base font-black text-primary font-mono">
                                {formatPKR(selectedOrder.pricing?.total || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Customer
                          </h3>
                          <div className="space-y-2">
                            <p className="font-bold text-sm text-foreground">
                              {selectedOrder.customer?.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {selectedOrder.customer?.phone}
                            </p>
                            {selectedOrder.customer?.email && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {selectedOrder.customer.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Shipping Address
                          </h3>
                          <div className="text-xs text-muted-foreground space-y-2">
                            <p className="font-bold text-foreground text-sm">
                              {selectedOrder.shipping?.address}
                            </p>
                            <p className="uppercase tracking-wider font-semibold">
                              {selectedOrder.shipping?.city}
                              {selectedOrder.shipping?.postal ?
                                ` - ${selectedOrder.shipping.postal}`
                              : ""}
                            </p>
                            {selectedOrder.shipping?.notes && (
                              <p className="italic text-muted-foreground mt-3 pt-3 border-t border-border">
                                Note: {selectedOrder.shipping.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Order Status Actions */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                            Update Order Status
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {ALL_STATUSES.slice(1).map((s) => (
                              <button
                                key={s}
                                onClick={() =>
                                  updateOrderStatus(selectedOrder._id, s)
                                }
                                disabled={loading}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                                  selectedOrder.status === s
                                    ? "bg-primary text-primary-foreground shadow-sm border border-primary/30"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border hover:text-foreground"
                                }`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Items ({selectedOrder.items?.length || 0})
                          </h3>
                          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                            {selectedOrder.items?.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border hover:border-primary/20 transition-colors">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-lg object-cover bg-card"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    Qty: {item.qty}
                                  </p>
                                </div>
                                <p className="text-xs font-black text-primary">
                                  {formatPKR(item.price * item.qty)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
                          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                            Order Summary
                          </h3>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="font-bold text-foreground font-mono">
                                {formatPKR(
                                  selectedOrder.pricing?.subtotal || 0,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="font-bold text-foreground font-mono">
                                {selectedOrder.pricing?.shipping === 0 ?
                                  "Free"
                                : formatPKR(
                                    selectedOrder.pricing?.shipping || 0,
                                  )
                                }
                              </span>
                            </div>
                            {selectedOrder.pricing?.discount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span className="font-bold font-mono">
                                  -{formatPKR(selectedOrder.pricing.discount)}
                                </span>
                              </div>
                            )}
                            <div className="border-t border-border pt-3 flex justify-between items-center">
                              <span className="font-black text-foreground uppercase tracking-wider">
                                Total
                              </span>
                              <span className="text-lg font-black text-primary font-mono">
                                {formatPKR(selectedOrder.pricing?.total || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-border bg-muted/20 px-8 py-5 sm:px-10 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-5 py-2.5 border border-border rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-all active:scale-[0.98]">
                      Close
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all flex items-center gap-2 active:scale-[0.98]">
                      <Download className="h-4 w-4" />
                      Print Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={executeBulkDelete}
        title="Delete Orders"
        message={`Are you sure you want to delete the ${selectedOrderIds.length} selected orders? This action cannot be undone.`}
      />
    </div>
  );
}
