"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Building2, Lock, Mail } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // Redirect based on role or redirect param
      const role = data.user?.role;
      if (redirectTo) {
        router.push(redirectTo);
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Building2 className="w-8 h-8 text-accent" />
            <span className="font-serif text-2xl font-bold text-primary tracking-tight">RE OneStopPage</span>
          </Link>
          <p className="text-xs text-slate-400 mt-2 font-mono">India's Verified Property Marketplace</p>
        </div>

        <div className="bg-white border border-line rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <h1 className="font-serif text-xl font-bold text-primary">Welcome back</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in to your RE OneStopPage account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">Password</label>
                <Link href="/auth/forgot-password" className="text-[10px] text-accent hover:underline font-mono">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-line rounded-xl text-sm bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-slate-800 text-secondary py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-accent font-bold hover:underline">
              Create one
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white border border-line rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Admin", email: "admin@rentahouse.in", password: "admin123" },
              { label: "Owner", email: "amit.sharma@gmail.com", password: "owner123" },
              { label: "Agent", email: "vikram.singh@agent.com", password: "agent123" },
              { label: "User", email: "arjun.das@gmail.com", password: "user123" },
            ].map(({ label, email, password }) => (
              <button
                key={label}
                type="button"
                onClick={() => setForm({ email, password })}
                className="text-left bg-secondary border border-line rounded-xl px-3 py-2.5 hover:border-accent/40 transition cursor-pointer"
              >
                <p className="text-[10px] font-bold text-accent font-mono">{label}</p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{email}</p>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-300 text-center">Click a card to auto-fill, then Sign In</p>
        </div>

        <p className="text-center text-[10px] text-slate-300 mt-6">
          <Link href="/" className="hover:text-accent transition">← Back to Homepage</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
