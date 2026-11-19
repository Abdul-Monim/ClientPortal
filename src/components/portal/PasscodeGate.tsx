"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface PasscodeGateProps {
  studioName: string;
  studioSlug: string;
  studioLogoUrl: string | null;
  welcomeMessage: string;
  contactEmail: string;
  projectSlug: string;
  projectTitle: string;
  clientCompany: string;
  passcodeHint: string | null;
  demoPasscode?: string;
}

const DEMO_PROJECTS = [
  {
    title: "Meridian Rebrand",
    slug: "meridian-rebrand",
    passcode: "meridian2026",
    client: "Meridian Labs",
  },
  {
    title: "Acme Corp Portal",
    slug: "acme-corp",
    passcode: "acme2026",
    client: "Acme Corp",
  },
  {
    title: "Lumen Design System",
    slug: "lumen-design-system",
    passcode: "lumen2026",
    client: "Lumen Health",
  },
  {
    title: "BrightTech HR Platform",
    slug: "brighttech-solutions",
    passcode: "bright2026",
    client: "BrightTech Solutions",
  },
  {
    title: "NordBrand Identity",
    slug: "nordbrand-gmbh",
    passcode: "nord2026",
    client: "NordBrand GmbH",
  },
];

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
  demoPasscode,
}: PasscodeGateProps) {
  const router = useRouter();
  const resolvedDemoCode =
    demoPasscode ||
    passcodeHint?.replace(/^Demo passcode:\s*/i, "").trim() ||
    `${projectSlug.split("-")[0]}2026`;

  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoList, setShowDemoList] = useState(false);

  async function performUnlock(codeToUse: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSlug,
          projectSlug,
          passcode: codeToUse,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "The project passcode did not match.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the server right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    await performUnlock(passcode);
  }

  async function handleQuickDemoUnlock() {
    setPasscode(resolvedDemoCode);
    await performUnlock(resolvedDemoCode);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4 py-12 dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 font-ui">
      {/* Studio Header Bar */}
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
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Studio</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Glassmorphic Gate Card */}
      <div className="w-full max-w-lg rounded-[2.5rem] border border-neutral-200/80 bg-white p-8 sm:p-10 shadow-2xl dark:border-neutral-800 dark:bg-[#0C1017]">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800 px-3.5 py-1 text-xs font-medium">
            <Lock className="h-3.5 w-3.5" />
            <span>Prepared for {clientCompany}</span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-800 px-2.5 py-1 text-[11px] font-semibold">
            <ShieldCheck className="h-3 w-3" />
            <span>Encrypted Gate</span>
          </div>
        </div>

        <h1 className="mt-5 font-editorial text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 dark:text-white tracking-tight">
          {projectTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {welcomeMessage}
        </p>

        {/* 1-Click Demo Unlock Action */}
        <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Demo Quick Unlock</span>
            </div>
            <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
              Code: {resolvedDemoCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoUnlock}
            disabled={loading}
            className="rounded-full w-full py-2.5 text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>1-Click Unlock Demo Portal ({resolvedDemoCode})</span>
          </button>
        </div>

        {/* Manual Passcode Form */}
        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Or Enter Project Passcode Manually
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={`e.g. ${resolvedDemoCode}`}
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 pl-11 pr-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full w-full py-3.5 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>{loading ? "Unlocking Portal..." : "Unlock Client Hub"}</span>
          </button>
        </form>

        {/* Accordion / Toggle for other Demo Projects */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
              Want to inspect another client portal?
            </span>
            <button
              type="button"
              onClick={() => setShowDemoList(!showDemoList)}
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 underline hover:text-sky-500"
            >
              {showDemoList ? "Hide Demo Portals" : "View All 5 Demo Portals"}
            </button>
          </div>

          {showDemoList && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              {DEMO_PROJECTS.map((demo) => (
                <div
                  key={demo.slug}
                  className="flex items-center justify-between rounded-2xl bg-neutral-50 dark:bg-[#141B2A] p-2.5 px-3.5 text-xs border border-neutral-200/70 dark:border-neutral-800"
                >
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-white block">
                      {demo.title}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Client: {demo.client} • Passcode:{" "}
                      <code className="text-amber-600 dark:text-amber-400 font-mono">
                        {demo.passcode}
                      </code>
                    </span>
                  </div>
                  <Link
                    href={`/p/${studioSlug}/${demo.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-200/80 dark:bg-neutral-800 px-3 py-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-white hover:bg-neutral-900 dark:hover:bg-neutral-700 transition"
                  >
                    <span>Open</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-5 border-t border-neutral-100 dark:border-neutral-800/80 pt-4 text-center text-xs text-neutral-400">
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
