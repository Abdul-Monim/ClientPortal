"use client";

import React from "react";
import Link from "next/link";
import {
  FolderPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface FreshStartOnboardingProps {
  studioName: string;
  studioSlug?: string;
}

export function FreshStartOnboarding({
  studioName,
}: FreshStartOnboardingProps) {

  return (
    <div className="w-full rounded-[2.5rem] border border-neutral-200/80 bg-white p-6 sm:p-10 shadow-xl dark:border-neutral-800 dark:bg-[#0B0F17] font-ui space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700/80">
            <BrandLogo size={26} variant="adaptive" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Fresh Studio Ready</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Welcome to {studioName}!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              You haven&apos;t created any client workspaces yet. Follow these 3 simple steps to launch your first hub:
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/projects"
          className="rounded-full bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <FolderPlus className="h-4 w-4" />
          <span>Create First Workspace</span>
        </Link>
      </div>

      {/* 3 Step Interactive Guiding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-6 dark:border-neutral-800 dark:bg-[#10141D] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                1
              </span>
              <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-semibold">
                Setup
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Create Client Workspace
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Name your project (e.g. &ldquo;Acme Web Redesign&rdquo;), input the client contact email, and assign a simple passcode.
            </p>
          </div>
          <Link
            href="/dashboard/projects"
            className="rounded-full w-full py-2.5 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-6 dark:border-neutral-800 dark:bg-[#10141D] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                2
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-semibold">
                Collaborate
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Drop Deliverables & Milestones
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Share Figma prototypes, videos, documents, or staging links. Clients can inspect versions and sign off with a single click.
            </p>
          </div>
          <div className="rounded-full w-full py-2.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 text-center bg-neutral-100 dark:bg-neutral-800/40">
            Available once workspace is created
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-6 dark:border-neutral-800 dark:bg-[#10141D] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold shadow-xs">
                3
              </span>
              <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-semibold">
                Settle
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Send Invoices & Get Paid
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Issue itemized invoices directly in your client portal. Clients pay via Stripe or download official branded PDF receipts.
            </p>
          </div>
          <div className="rounded-full w-full py-2.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 text-center bg-neutral-100 dark:bg-neutral-800/40">
            Available once workspace is created
          </div>
        </div>
      </div>

      {/* Helpful Hint Callout */}
      <div className="rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/40 p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Zero client sign-up friction:</strong> Your clients enter their password-protected link directly without creating an account.
          </span>
        </div>

        <Link
          href="/p/atelier-vance/meridian-rebrand"
          target="_blank"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
        >
          <span>Preview Meridian Demo Hub</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
