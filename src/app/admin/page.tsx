"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SceneBackground } from "@/components/SceneBackground";
import { CodLoader } from "@/components/CodLoader";
import { AttentionModal } from "@/components/AttentionModal";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Access denied. Check command credentials.");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("Command link failed. Retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#050505]">
      <SceneBackground />
      {loading && <CodLoader label="AUTHENTICATING..." />}
      <AttentionModal
        open={Boolean(error)}
        message={error || ""}
        onClose={() => setError(null)}
      />
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full rounded-xl border border-white/10 px-6 py-8" style={{ backgroundColor: "#141414" }}>
          <div className="mb-5 flex items-center justify-center">
            <Image
              src="/logos/uon-onuss.png"
              alt="University of Nairobi and ONUSS"
              width={996}
              height={370}
              className="h-14 w-auto max-w-full object-contain"
              style={{ borderRadius: 10 }}
              priority
            />
          </div>
          <h1 className="text-center text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Admin Command Access
          </h1>
          <div className="mx-auto mt-4 h-px w-full" style={{ backgroundColor: "#2f6fed" }} />
          <form onSubmit={onSubmit} className="mt-6">
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs text-white/80">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md px-3 py-2.5 text-sm text-white outline-none"
                style={{ border: "1px solid #3a3a3a", backgroundColor: "#2a2a2a" }}
                placeholder="Enter admin password"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-md py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "#3a3a3a" }}
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
