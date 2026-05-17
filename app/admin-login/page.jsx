"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleLogin = async () => {
    if (!username || !password || (twoFactorRequired && !twoFactorCode)) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, twoFactorCode }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorRequired(true);
        } else {
          router.push("/admin");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        <div className="mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-[#1E7A46] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sabir Shah Traders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {!twoFactorRequired ? (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:border-[#1E7A46] focus:ring-1 focus:ring-[#1E7A46]"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:outline-none focus:border-[#1E7A46] focus:ring-1 focus:ring-[#1E7A46]"
              />
            </>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
               <p className="text-xs font-bold text-[#1E7A46] uppercase tracking-widest mb-2">Verification Required</p>
               <input
                type="text"
                placeholder="Enter 2FA Code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border-2 border-[#1E7A46]/20 bg-[#1E7A46]/5 p-3 rounded-lg text-sm font-bold text-center tracking-[0.5em] focus:outline-none focus:border-[#1E7A46] focus:ring-1 focus:ring-[#1E7A46]"
              />
              <button 
                onClick={() => setTwoFactorRequired(false)}
                className="mt-2 text-[10px] text-gray-500 hover:text-gray-700 font-bold uppercase tracking-widest">
                Back to Login
              </button>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#1E7A46] text-white p-3 rounded-lg text-sm font-medium hover:bg-[#166a3a] disabled:opacity-60 transition-colors">
            {loading ? "Verifying..." : twoFactorRequired ? "Confirm Access" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
