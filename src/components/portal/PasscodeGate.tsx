"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, KeyRound, Loader2, Lock } from "lucide-react";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function PasscodeGate({
  studioName,
  studioSlug,
  studioLogoUrl,
  welcomeMessage,
  contactEmail,
  projectSlug,
  projectTitle,
  clientCompany,
  passcodeHint,
}: {
  studioName: string;
  studioSlug: string;
  studioLogoUrl: string | null;
  welcomeMessage: string;
  contactEmail: string;
  projectSlug: string;
  projectTitle: string;
  clientCompany: string;
  passcodeHint: string | null;
}) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSlug,
          projectSlug,
          passcode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "That password did not match.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the server right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4 py-12 dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="mb-6 flex w-full max-w-lg items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandAvatar studioName={studioName} logoUrl={studioLogoUrl} size="md" />
          <div>
            <p className="font-editorial text-2xl font-bold leading-none text-neutral-900 dark:text-white">
              {studioName}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-mono">
              Private Client Hub
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg rounded-[2.5rem] border border-neutral-200/80 bg-white p-8 sm:p-10 shadow-2xl dark:border-neutral-800 dark:bg-[#0C1017]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800 px-3.5 py-1 text-xs font-medium">
          <Lock className="h-3.5 w-3.5" />
          <span>Prepared for {clientCompany}</span>
        </div>

        <h1 className="mt-5 font-editorial text-4xl font-semibold leading-tight text-neutral-900 dark:text-white tracking-tight">
          {projectTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {welcomeMessage}
        </p>

        <form onSubmit={handleUnlock} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Enter Project Passcode
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter project passcode"
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
            {passcodeHint && (
              <p className="mt-2 text-xs text-neutral-400 font-mono">
                Hint: {passcodeHint}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full w-full py-3.5 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>{loading ? "Unlocking Portal..." : "Unlock Client Hub"}</span>
          </button>
        </form>

        <p className="mt-7 border-t border-neutral-100 dark:border-neutral-800/80 pt-5 text-center text-xs text-neutral-400">
          Need access to your project hub? Contact{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-neutral-800 dark:text-neutral-200 underline"
          >
            {contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
