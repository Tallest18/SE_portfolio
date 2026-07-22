"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ink-50">
      <div className="w-full max-w-sm rounded-xl border border-ink-400 bg-ink-200/50 p-8">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-copper" />
          <h1 className="font-display text-lg font-semibold text-ink-950">Admin sign in</h1>
        </div>
        <p className="text-sm text-ink-700 mb-6">
          Enter the admin password to edit your portfolio content.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-mono text-ink-600 mb-2">
              password
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-500 bg-ink-100 px-3 py-2.5 text-sm text-ink-950 focus:border-copper outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-[#ef5350]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-copper px-4 py-2.5 text-sm font-medium text-ink-50 hover:bg-copper-light transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
