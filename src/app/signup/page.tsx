"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle, Globe, Lock, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studioName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setConfirmationNotice(null);

      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioName: studioName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Unable to complete registration.");
        return;
      }

      if (data.data?.requiresEmailConfirmation) {
        setConfirmationNotice(
          data.data.message ||
            "Account registered! Please check your email to confirm your studio address before logging in."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error during registration.");
    } finally {
      setLoading(false);
    }
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
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800 px-3.5 py-1 text-xs font-medium">
          <Globe className="h-3.5 w-3.5" />
          <span>Zero-Friction Freelance Onboarding</span>
        </div>

        <h1 className="mt-5 font-editorial text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Create Studio Hub
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Set up your white-label freelance identity and start sharing deliverables with clients.
        </p>

        {confirmationNotice ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-300 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>Verify Your Studio Email</span>
            </div>
            <p className="text-xs leading-relaxed">{confirmationNotice}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-800 transition"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Studio or Brand Name
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Monim Creative"
                  className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Work Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@monim.studio"
                  className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full w-full py-3.5 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? "Registering..." : "Launch Studio"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Already have a studio workspace?{" "}
            <Link
              href="/login"
              className="font-semibold text-neutral-900 dark:text-white underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
