"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Phone, ShoppingBag, Eye, Trash2, X, Download, Loader2, User, MapPin, Calendar } from "lucide-react";
import { formatPKR } from "@/lib/payments";
import { Tooltip } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

async function downloadExport(type) {
  const res = await fetch(`/api/admin/export?type=${type}`, { credentials: "include" });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (phone) => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setHistory(data.orders || []);
    } catch (err) {
      toast.error("Failed to fetch order history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchHistory(customer.phone);
  };

  const deleteCustomer = async (phone) => {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Customer deleted");
      fetchCustomers();
      if (selectedCustomer?.phone === phone) setSelectedCustomer(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmDelete(null);
    }
  };

  const executeBulkDelete = async () => {
    try {
      for (const phone of selected) {
        await fetch("/api/admin/customers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
      }
      toast.success(`${selected.length} customers deleted`);
      setSelected([]);
      fetchCustomers();
    } catch (err) {
      toast.error("Bulk delete failed");
    } finally {
      setBulkConfirm(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const toggleSelect = (phone) => {
    setSelected(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]);
  };

  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(c => c.phone));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">Customers</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">Manage your customer base and view history</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <button
              onClick={() => setBulkConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest border border-red-200"
            >
              <Trash2 className="h-4 w-4" /> Bulk Delete ({selected.length})
            </button>
          )}
          <button 
            onClick={async () => {
              try {
                await downloadExport("customers");
                toast.success("Customers exported successfully");
              } catch {
                toast.error("Export failed. Please try again.");
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-muted transition-all shadow-sm active:scale-95"
          >
            <Download className="h-4 w-4 text-primary" /> Export Data
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/30">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" />
          </div>
          <p className="text-[10px] text-muted-foreground ml-auto font-black uppercase tracking-widest opacity-60">{filtered.length} total</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar overscroll-contain" data-lenis-prevent>
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-5 py-3 border-b border-border">
                  <Checkbox 
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onCheckedChange={selectAll}
                  />
                </th>
                {["Customer", "Contact", "City", "Orders", "Total Spent", "Joined", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-black">Loading customers...</p>
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.phone} className={`hover:bg-muted/30 transition-colors group ${selected.includes(c.phone) ? 'bg-primary/[0.03]' : ''}`}>
                  <td className="px-5 py-3 border-b border-border/50">
                    <Checkbox checked={selected.includes(c.phone)} onCheckedChange={() => toggleSelect(c.phone)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0">
                        {c.name?.[0] || 'C'}
                      </div>
                      <div className="text-sm font-bold text-foreground">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><Mail className="h-3 w-3" />{c.email || 'N/A'}</div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground opacity-60"><Phone className="h-3 w-3" />{c.phone}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[11px] font-medium text-muted-foreground uppercase">{c.city || 'N/A'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" /> {c.orders}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-black text-primary text-sm">{formatPKR(c.spent)}</td>
                  <td className="px-5 py-3 text-[11px] font-medium text-muted-foreground">
                    {new Date(c.joined).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="View History" position="top">
                        <button onClick={() => handleSelectCustomer(c)} className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all"><Eye className="h-3.5 w-3.5" /></button>
                      </Tooltip>
                      <Tooltip content="Delete Customer" position="top">
                        <button onClick={() => setConfirmDelete(c)} className="p-1.5 rounded-lg border border-border bg-card text-red-400 hover:text-red-500 hover:border-red-500 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <User className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No customers found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Panel */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
          <div className="relative bg-card w-full max-w-xl h-full shadow-2xl overflow-y-auto custom-scrollbar flex flex-col" data-lenis-prevent style={{ overscrollBehavior: "contain" }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
              <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-xl hover:bg-muted transition-all"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            
            <div className="p-8 space-y-8 flex-1">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border border-primary/20 shadow-inner">
                  {selectedCustomer.name?.[0] || 'C'}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border"><Phone className="h-3 w-3 text-primary" /> {selectedCustomer.phone}</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border"><Mail className="h-3 w-3 text-primary" /> {selectedCustomer.email || 'No email'}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Orders", value: selectedCustomer.orders, icon: ShoppingBag },
                  { label: "Total Spent", value: formatPKR(selectedCustomer.spent), icon: Download },
                  { label: "Member Since", value: new Date(selectedCustomer.joined).toLocaleDateString(), icon: Calendar },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/30 p-4 rounded-2xl border border-border shadow-sm text-center">
                    <s.icon className="h-4 w-4 text-primary mx-auto mb-2 opacity-60" />
                    <div className="text-sm font-black text-foreground tracking-tight">{s.value}</div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-foreground text-[10px] uppercase tracking-[0.2em]">Order History</h4>
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 uppercase">{history.length} orders</span>
                </div>
                
                {historyLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" />
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((o) => (
                      <div key={o._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-card p-2 rounded-xl border border-border"><ShoppingBag className="h-4 w-4 text-primary" /></div>
                          <div>
                            <div className="text-xs font-black text-foreground uppercase tracking-wider">{o.orderNumber}</div>
                            <div className="text-[10px] font-bold text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-primary tracking-tight">{formatPKR(o.pricing.total)}</div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-card border border-border rounded-lg text-muted-foreground opacity-70">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-muted/10 rounded-3xl border border-dashed border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">No order history found</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border flex gap-4">
                <button 
                  onClick={() => setConfirmDelete(selectedCustomer)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4" /> Delete Customer Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteCustomer(confirmDelete.phone)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will remove all associated orders. This action is irreversible.`}
      />

      <ConfirmationModal
        isOpen={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete Customers"
        message={`Are you sure you want to delete ${selected.length} selected customers and all their orders?`}
      />
    </div>
  );
}
