"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextButton } from "@/components/ui/text-button";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Logged in");
      router.push("/admin");
      router.refresh();
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl glass p-8">
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-6">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-8">Admin Login</h1>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Username</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>
          <TextButton
            type="submit"
            disabled={loading}
            className="mt-8 w-full"
            text={loading ? "Signing in..." : "Sign in"}
          />
        </div>
      </form>
    </div>
  );
}
