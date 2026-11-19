"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Globe, Lock, Mail, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setNotice("Enter your studio email and password, or launch Studio Sandbox below.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4 py-12 dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-[2.5rem] border border-neutral-200/80 bg-white p-8 sm:p-10 shadow-2xl dark:border-neutral-800 dark:bg-[#0C1017]">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800 px-3.5 py-1 text-xs font-medium">
          <Globe className="h-3.5 w-3.5" />
          <span>Freelancer Studio Access</span>
        </div>

        <h1 className="mt-5 font-editorial text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Manage client hubs, track deliverable approvals, and issue branded invoices.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourstudio.com"
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Studio Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          {notice && (
            <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
              {notice}
            </p>
          )}

          <button
            type="submit"
            className="rounded-full w-full py-3.5 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Sign In to Studio</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center">
          <Link
            href="/dashboard"
            className="rounded-full w-full py-3 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Enter Studio Sandbox Directly</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
