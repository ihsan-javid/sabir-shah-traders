"use client";
import { useState, useEffect } from "react";
import {
  Save,
  Truck,
  DollarSign,
  Bell,
  Shield,
  Store,
  Check,
  Loader2,
  Lock,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

import {
  AdminButton,
  AdminModal,
  AdminLabel,
} from "@/components/admin/AdminShared";

const TABS = [
  { key: "general", label: "General", icon: Store },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "tax", label: "Tax", icon: DollarSign },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-muted peer-checked:bg-primary rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary/20">
        <div
          className={`w-4 h-4 bg-white rounded-full shadow m-0.5 transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground">{label}</div>
        {description && (
          <div className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/20">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
          {title}
        </h3>
        {description && (
          <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
            {description}
          </p>
        )}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all bg-muted/20"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all bg-muted/20 resize-none"
    />
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 2FA Setup states
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [generating2FA, setGenerating2FA] = useState(false);
  const [disable2FAConfirm, setDisable2FAConfirm] = useState(false);

  const handleToggle2FA = async (enable) => {
    if (enable) {
      setGenerating2FA(true);
      try {
        const res = await fetch("/api/admin/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate" }),
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setSetupSecret(data.secret);
          setQrCodeData(data.qrCode);
          setSetup2FAOpen(true);
        } else {
          toast.error(data.error || "Failed to generate 2FA key");
        }
      } catch (err) {
        toast.error("Failed to connect to security service");
      } finally {
        setGenerating2FA(false);
      }
    } else {
      setDisable2FAConfirm(true);
    }
  };

  const executeDisable2FA = async () => {
    setDisable2FAConfirm(false);
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        update("security.twoFactorAuth", false);
        toast.success("Two-Factor Authentication disabled");
      } else {
        toast.error(data.error || "Failed to disable 2FA");
      }
    } catch (err) {
      toast.error("Failed to connect to security service");
    }
  };

  const handleConfirm2FA = async () => {
    if (!verificationCode) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    setVerifying2FA(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          secret: setupSecret,
          code: verificationCode,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        update("security.twoFactorAuth", true);
        setSetup2FAOpen(false);
        setVerificationCode("");
        setSetupSecret("");
        setQrCodeData("");
        toast.success("Two-Factor Authentication enabled successfully!");
      } else {
        toast.error(data.error || "Invalid verification code");
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setVerifying2FA(false);
    }
  };

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    storeName: "Sabir Shah Traders",
    contactPhone: "",
    whatsappNumber: "",
    contactEmail: "",
    contactAddress: "",
    deliveryFee: 0,
    shipping: {
      freeShippingGlobal: false,
      expressEnabled: false,
      expressRate: 0,
      codEnabled: true,
      codFee: 0,
      freeDeliveryThreshold: 0,
    },
    tax: {
      enabled: false,
      rate: 0,
      label: "GST",
      inclusive: false,
    },
    notifications: {
      newOrder: true,
      lowStock: true,
      lowStockThreshold: 5,
      newReview: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      loginAttemptLimit: 5,
    },
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
  });

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            shipping: { ...prev.shipping, ...data.shipping },
            tax: { ...prev.tax, ...data.tax },
            notifications: { ...prev.notifications, ...data.notifications },
            security: { ...prev.security, ...data.security },
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setSaved(true);
        toast.success("System-wide settings synchronized!");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(data.error || "Failed to sync settings");
      }
    } catch (err) {
      toast.error("An error occurred during synchronization");
    } finally {
      setSaving(false);
    }
  };

  const update = (path, value) => {
    setSettings((prev) => {
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [keys[0]]: value };

      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Initializing System...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">
            Master Config
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            Production Environment Controls
          </p>
        </div>
        <AdminButton
          variant="primary"
          className={saved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
          icon={saved ? Check : Save}
          loading={saving}
          onClick={handleSave}
        >
          {saved ? "Synchronized" : "Push Global Changes"}
        </AdminButton>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-2 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all text-left ${activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {activeTab === "general" && (
            <>
              <Section
                title="Store Identity"
                description="Primary identification and contact details">
                <SettingRow
                  label="Maintenance Mode"
                  description="Restrict website access to admins only">
                  <Toggle
                    checked={settings.maintenanceMode}
                    onChange={(v) => update("maintenanceMode", v)}
                  />
                </SettingRow>
                <SettingRow
                  label="Store Name"
                  description="Brand name shown across the platform">
                  <div className="w-64">
                    <Input
                      value={settings.storeName}
                      onChange={(v) => update("storeName", v)}
                    />
                  </div>
                </SettingRow>
                <SettingRow label="WhatsApp / Phone Number">
                  <div className="w-64">
                    <Input
                      value={settings.whatsappNumber}
                      onChange={(v) => {
                        update("whatsappNumber", v);
                        update("contactPhone", v);
                      }}
                      placeholder="e.g. 923000000000"
                    />
                  </div>
                </SettingRow>
                <SettingRow label="Support Email">
                  <div className="w-64">
                    <Input
                      value={settings.contactEmail}
                      onChange={(v) => update("contactEmail", v)}
                    />
                  </div>
                </SettingRow>
              </Section>

              <Section
                title="Email SMTP Mailer Configuration"
                description="Dynamic server details for dispatching contact emails"
              >
                <SettingRow
                  label="SMTP Server Host"
                  description="e.g. smtp.gmail.com"
                >
                  <div className="w-64">
                    <Input
                      value={settings.smtpHost}
                      onChange={(v) => update("smtpHost", v)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                </SettingRow>
                <SettingRow
                  label="SMTP Port"
                  description="Standard 587 (TLS) or 465 (SSL)"
                >
                  <div className="w-32">
                    <Input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(v) => update("smtpPort", Number(v))}
                      placeholder="587"
                    />
                  </div>
                </SettingRow>
                <SettingRow
                  label="SMTP Account Username"
                  description="e.g. user@gmail.com"
                >
                  <div className="w-64">
                    <Input
                      value={settings.smtpUser}
                      onChange={(v) => update("smtpUser", v)}
                      placeholder="business@gmail.com"
                    />
                  </div>
                </SettingRow>
                <SettingRow
                  label="SMTP Password / App Password"
                  description="Secure app-specific passcode"
                >
                  <div className="w-64">
                    <Input
                      type="password"
                      value={settings.smtpPass}
                      onChange={(v) => update("smtpPass", v)}
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </SettingRow>
              </Section>
            </>
          )}

          {activeTab === "shipping" && (
            <>
              <Section title="Global Shipping Policy">
                <SettingRow
                  label="Enable Free Shipping Global"
                  description="Overrides all other rates to 0">
                  <Toggle
                    checked={settings.shipping?.freeShippingGlobal}
                    onChange={(v) => update("shipping.freeShippingGlobal", v)}
                  />
                </SettingRow>
                {!settings.shipping?.freeShippingGlobal && (
                  <>
                    <SettingRow label="Standard Delivery Fee (PKR)">
                      <div className="w-32">
                        <Input
                          type="number"
                          value={settings.deliveryFee}
                          onChange={(v) => update("deliveryFee", Number(v))}
                        />
                      </div>
                    </SettingRow>
                    <SettingRow
                      label="Free Delivery Threshold (PKR)"
                      description="Minimum order for free shipping">
                      <div className="w-32">
                        <Input
                          type="number"
                          value={settings.shipping?.freeDeliveryThreshold}
                          onChange={(v) =>
                            update("shipping.freeDeliveryThreshold", Number(v))
                          }
                        />
                      </div>
                    </SettingRow>
                  </>
                )}
              </Section>
            </>
          )}

          {activeTab === "tax" && (
            <Section title="Tax & Compliance">
              <SettingRow
                label="Enable Tax System"
                description="Automatically apply tax to checkouts">
                <Toggle
                  checked={settings.tax?.enabled}
                  onChange={(v) => update("tax.enabled", v)}
                />
              </SettingRow>
              {settings.tax?.enabled && (
                <>
                  <SettingRow label="Tax Rate (%)">
                    <div className="w-32">
                      <Input
                        type="number"
                        value={settings.tax?.rate}
                        onChange={(v) => update("tax.rate", Number(v))}
                      />
                    </div>
                  </SettingRow>
                  <SettingRow
                    label="Tax Label"
                    description="e.g. GST, VAT, Sales Tax">
                    <div className="w-32">
                      <Input
                        value={settings.tax?.label}
                        onChange={(v) => update("tax.label", v)}
                      />
                    </div>
                  </SettingRow>
                  <SettingRow
                    label="Tax Inclusive Pricing"
                    description="Show prices with tax included">
                    <Toggle
                      checked={settings.tax?.inclusive}
                      onChange={(v) => update("tax.inclusive", v)}
                    />
                  </SettingRow>
                </>
              )}
            </Section>
          )}

          {activeTab === "notifications" && (
            <Section title="System Alerts">
              <SettingRow
                label="Order Alerts"
                description="Notify admin on new orders">
                <Toggle
                  checked={settings.notifications?.newOrder}
                  onChange={(v) => update("notifications.newOrder", v)}
                />
              </SettingRow>
              <SettingRow
                label="Inventory Alerts"
                description="Notify on low stock items">
                <Toggle
                  checked={settings.notifications?.lowStock}
                  onChange={(v) => update("notifications.lowStock", v)}
                />
              </SettingRow>
              {settings.notifications?.lowStock && (
                <SettingRow label="Low Stock Threshold">
                  <div className="w-32">
                    <Input
                      type="number"
                      value={settings.notifications?.lowStockThreshold}
                      onChange={(v) =>
                        update("notifications.lowStockThreshold", Number(v))
                      }
                    />
                  </div>
                </SettingRow>
              )}
              <SettingRow
                label="Review Alerts"
                description="Notify on new product reviews">
                <Toggle
                  checked={settings.notifications?.newReview}
                  onChange={(v) => update("notifications.newReview", v)}
                />
              </SettingRow>
            </Section>
          )}

          {activeTab === "security" && (
            <Section
              title="System Security"
              description="Protect your admin environment">
              <SettingRow
                label="Two Factor Authentication (2FA)"
                description="Require OTP for admin logins">
                <Toggle
                  checked={settings.security?.twoFactorAuth}
                  onChange={handleToggle2FA}
                />
              </SettingRow>
              <SettingRow
                label="Session Timeout (Minutes)"
                description="Auto logout after inactivity">
                <div className="w-32">
                  <Input
                    type="number"
                    value={settings.security?.sessionTimeout}
                    onChange={(v) =>
                      update("security.sessionTimeout", Number(v))
                    }
                  />
                </div>
              </SettingRow>
              <SettingRow
                label="Login Attempt Limit"
                description="Block access after failed attempts">
                <div className="w-32">
                  <Input
                    type="number"
                    value={settings.security?.loginAttemptLimit}
                    onChange={(v) =>
                      update("security.loginAttemptLimit", Number(v))
                    }
                  />
                </div>
              </SettingRow>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-[10px] font-medium text-amber-800 leading-relaxed uppercase tracking-tight">
                  Security changes apply immediately. Ensure you have backup
                  access before enabling strict 2FA.
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={setup2FAOpen}
        onClose={() => {
          setSetup2FAOpen(false);
          setVerificationCode("");
          setQrCodeData("");
          setSetupSecret("");
        }}
        title="Set Up Two-Factor Authentication"
        description="Scan the QR code below with Google Authenticator or Authy to secure your admin account."
      >
        <div className="space-y-6 flex flex-col items-center">
          {qrCodeData ? (
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-center">
              <img src={qrCodeData} alt="2FA QR Code" className="h-44 w-44 object-contain" />
            </div>
          ) : (
            <div className="h-44 w-44 bg-muted/30 rounded-2xl border border-border flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="w-full text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secret Key (Manual Entry)</p>
            <p className="text-xs font-mono font-bold text-foreground bg-muted/40 p-2.5 rounded-xl border border-border tracking-wider select-all font-mono">
              {setupSecret || "Generating key..."}
            </p>
          </div>

          <div className="w-full space-y-2">
            <AdminLabel required>Verification Code</AdminLabel>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full text-sm font-bold text-center tracking-[0.5em] border border-border rounded-xl p-3 bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="w-full flex items-center justify-end gap-3 pt-4 border-t border-border">
            <AdminButton
              variant="outline"
              onClick={() => {
                setSetup2FAOpen(false);
                setVerificationCode("");
                setQrCodeData("");
                setSetupSecret("");
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              loading={verifying2FA}
              disabled={!verificationCode || verifying2FA}
              onClick={handleConfirm2FA}
            >
              Verify & Enable
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmationModal
        isOpen={disable2FAConfirm}
        onClose={() => setDisable2FAConfirm(false)}
        onConfirm={executeDisable2FA}
        title="Disable Two-Factor Authentication"
        message="Are you sure you want to disable Two-Factor Authentication? Your account will be significantly less secure against unauthorized access."
      />
    </div>
  );
}
