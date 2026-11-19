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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-canvas)] px-4 py-12">
      <div className="mb-8 flex w-full max-w-lg items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandAvatar studioName={studioName} logoUrl={studioLogoUrl} size="md" />
          <div>
            <p className="font-editorial text-2xl font-semibold leading-none">
              {studioName}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Private Client Portal
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="surface-card w-full max-w-lg rounded-[2rem] p-8 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-soft)] px-3.5 py-1 text-xs font-medium text-[var(--brand-accent)]">
          <Lock className="h-3.5 w-3.5" />
          <span>Prepared for {clientCompany}</span>
        </div>

        <h1 className="mt-5 font-editorial text-4xl font-semibold leading-tight">
          {projectTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
          {welcomeMessage}
        </p>

        <form onSubmit={handleUnlock} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Enter Portal Password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your project password"
                className="field-input rounded-full pl-11 pr-4"
              />
            </div>
            {passcodeHint && (
              <p className="mt-2 text-xs text-[var(--ink-muted)]">{passcodeHint}</p>
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
            className="pill-btn pill-btn-brand w-full py-3.5 text-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>{loading ? "Unlocking Portal..." : "Unlock Client Hub"}</span>
          </button>
        </form>

        <p className="mt-7 border-t border-[var(--border-hairline)] pt-5 text-center text-xs text-[var(--ink-muted)]">
          Need help accessing your portal? Contact{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-[var(--ink-primary)] underline"
          >
            {contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
