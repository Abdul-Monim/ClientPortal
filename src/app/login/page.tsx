"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setNotice("Enter your studio email and password, or enter Sandbox Workbench below.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-canvas)] px-4 py-12">
      <div className="mb-8 flex w-full max-w-md items-center justify-between">
        <Link href="/" className="pill-btn pill-btn-outline px-4 py-2 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="surface-card w-full max-w-md rounded-[2rem] p-8 shadow-sm">
        <p className="eyebrow">Freelancer Access</p>
        <h1 className="mt-2 font-editorial text-4xl font-semibold">
          Sign in to your studio
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Manage client portals, upload deliverable versions, and issue invoices.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourstudio.com"
                className="field-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="field-input pl-10"
              />
            </div>
          </div>

          {notice && (
            <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
              {notice}
            </p>
          )}

          <button type="submit" className="pill-btn pill-btn-brand w-full py-3 text-sm">
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-5 border-t border-[var(--border-hairline)] pt-5 text-center">
          <Link
            href="/dashboard"
            className="pill-btn pill-btn-outline w-full py-2.5 text-xs"
          >
            <span>Continue to Interactive Studio Workbench</span>
          </Link>
          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            New studio?{" "}
            <Link href="/signup" className="font-medium text-[var(--ink-primary)] underline">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
