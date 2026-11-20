"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
  Layers,
  Check,
} from "lucide-react";

interface LandingInteractiveShowcaseProps {
  samplePortalHref: string;
}

export function LandingInteractiveShowcase({
  samplePortalHref,
}: LandingInteractiveShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"client" | "freelancer">("client");
  const [approvedDeliverable, setApprovedDeliverable] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState(false);

  return (
    <section id="showcase" className="py-16 sm:py-24 border-t border-neutral-100 dark:border-neutral-800/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
            Interactive Product Tour
          </span>
          <h2 className="mt-2 font-ui text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Two perspectives. One effortless flow.
          </h2>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-xl">
            Experience how your clients interact with your work compared to your private freelancer cockpit.
            Switch between views to test the real workflow.
          </p>
        </div>

        {/* View Switcher Capsule (100% Material You 50% radius pill) */}
        <div className="inline-flex rounded-full bg-neutral-100 p-1.5 dark:bg-[#141A26] border border-neutral-200/80 dark:border-neutral-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("client")}
            className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "client"
                ? "bg-white text-neutral-950 shadow-sm dark:bg-white dark:text-neutral-950"
                : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Client Portal View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("freelancer")}
            className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "freelancer"
                ? "bg-white text-neutral-950 shadow-sm dark:bg-white dark:text-neutral-950"
                : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4 text-blue-500" />
            <span>Freelancer Studio View</span>
          </button>
        </div>
      </div>

      {/* Interactive Showcase Frame */}
      <div className="relative rounded-[2.5rem] border border-neutral-200/80 bg-neutral-50/60 p-5 sm:p-8 lg:p-10 dark:border-neutral-800 dark:bg-[#0A0D14] overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          {activeTab === "client" ? (
            <motion.div
              key="client-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Context Pill Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Private Client Portal &bull; Meridian Rebrand
                    </div>
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Zero login required &bull; Unlocked with passcode: <code className="bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs">meridian-2026</code>
                    </div>
                  </div>
                </div>

                <Link
                  href={samplePortalHref}
                  className="rounded-full bg-neutral-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition flex items-center gap-1.5"
                >
                  <span>Open Live Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Client Interactive Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Milestone & Deliverable Approval Card (8 cols) */}
                <div className="lg:col-span-8 rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-[#10141D] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Milestone 2 of 4 &bull; In Review
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                        Design System & Component Library v2
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-3.5 py-1 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                      Due Friday
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    All color tokens, typography scales, and 40 responsive Figma components are organized for your review.
                    Inspect the preview and click approve to greenlight production development.
                  </p>

                  {/* Interactive Deliverable Item */}
                  <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-[#141A26] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                          Meridian-BrandKit-v2.fig
                        </div>
                        <div className="text-xs text-neutral-500">
                          14.8 MB &bull; Uploaded 2 hours ago
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setApprovedDeliverable(!approvedDeliverable)}
                        className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                          approvedDeliverable
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        }`}
                      >
                        {approvedDeliverable ? (
                          <>
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>Approved by Client</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Click to Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Client Feedback Reassurance */}
                  {approvedDeliverable && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5"
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Approval timestamp recorded! The studio team received notification to proceed to development.</span>
                    </motion.div>
                  )}
                </div>

                {/* Instant Stripe Payment Card (4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-[#10141D] shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Invoice #INV-2026-002
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                          paidInvoice
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {paidInvoice ? "Settled" : "Due Upon Approval"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        $4,500.00
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        50% Milestone Deposit &bull; Card or Bank Transfer
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-4 text-xs text-neutral-600 dark:text-neutral-400">
                      <div className="flex justify-between">
                        <span>Milestone 2 Assets</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">$4,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Express Revisions</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">$500.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setPaidInvoice(!paidInvoice)}
                      className={`w-full rounded-full py-3 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm ${
                        paidInvoice
                          ? "bg-emerald-600 text-white"
                          : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{paidInvoice ? "Payment Confirmed via Stripe" : "Pay $4,500 with Card"}</span>
                    </button>
                    <p className="mt-2 text-center text-[11px] text-neutral-400">
                      Secured by Stripe &bull; Official PDF receipt generated automatically
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="freelancer-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Context Pill Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      FreelanceOS Studio Cockpit
                    </div>
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Hosty-inspired performance dashboard &bull; Real-time client activity
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition flex items-center gap-1.5"
                >
                  <span>Open Studio Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* 4 Pastel Studio KPI Cards (Matching Reference Comp Style) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">Active Portals</div>
                  <div className="mt-2 text-2xl font-bold text-sky-950 dark:text-sky-100">4 Studios</div>
                  <div className="mt-1 text-[11px] text-sky-700 dark:text-sky-400">100% On-Track</div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Approval Rate</div>
                  <div className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-100">96.8%</div>
                  <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">+4.2% this month</div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Outstanding Invoices</div>
                  <div className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-100">$6,200</div>
                  <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">2 pending settlement</div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-100/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-300">Total Billed</div>
                  <div className="mt-2 text-2xl font-bold text-neutral-950 dark:text-white">$38,400</div>
                  <div className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400">All clients to date</div>
                </div>
              </div>

              {/* Freelancer Workbench Comp Preview Image */}
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-[#06080E] aspect-[16/7] shadow-lg flex items-center justify-center group">
                <Image
                  src="/showcase-cosmic.jpg"
                  alt="Minimalist crystal prism floating in deep cosmic space representing smooth client workflows"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 sm:p-8">
                  <div className="space-y-1">
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white inline-block">
                      Instant Deliverable Publishing
                    </span>
                    <h4 className="text-lg sm:text-xl font-semibold text-white">
                      Drop files, set milestones, and share a clean branded link in seconds.
                    </h4>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
