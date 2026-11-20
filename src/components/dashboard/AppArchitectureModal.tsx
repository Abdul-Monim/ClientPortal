"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  ShieldCheck,
  FolderKanban,
  ExternalLink,
  Laptop,
} from "lucide-react";
import Link from "next/link";

interface AppArchitectureModalProps {
  samplePortalPath?: string;
}

export function AppArchitectureModal({
  samplePortalPath = "/p/atelier-vance/meridian-rebrand",
}: AppArchitectureModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111726] px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition flex items-center gap-1.5 shadow-xs"
        title="View platform architecture and how everything works"
      >
        <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
        <span>How Platform Works</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl dark:border-neutral-800 dark:bg-[#0E131F] font-ui space-y-6 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Laptop className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                    ClientPortal System Blueprint & Workflow
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Understanding the relationship between your Studio Workspace and the Private Client Hubs.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white transition"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 2-Side Interactive Architecture Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pillar 1: Freelancer Studio Workspace */}
              <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/70 p-5 dark:border-neutral-800 dark:bg-[#121826] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
                    <FolderKanban className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Studio Side
                  </span>
                </div>

                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Freelancer Studio Dashboard
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Your private mission control for all client projects, deliverables, milestones, and billing ledgers.
                </p>

                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span><strong>Project Management:</strong> Create client workspaces, set target deadlines, and define weighted milestone phases.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span><strong>Deliverable Drops:</strong> Publish Figma, Loom, Staging URLs, or Cloudinary assets with full version changelogs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span><strong>Invoicing Engine:</strong> Generate itemized invoices linked to milestones with 1-click Stripe settlement.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2: Client View Portal */}
              <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/70 p-5 dark:border-neutral-800 dark:bg-[#121826] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Client Side
                  </span>
                </div>

                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Private Client Hub (/p/studio/project)
                </h4>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  The password-protected link you share with clients. Zero sign-up friction—clients simply enter a passcode.
                </p>

                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>Instant Access:</strong> Clients unlock their workspace with a simple passcode. No account registration needed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>Asset Inspection & Sign-Off:</strong> Clients preview assets in-browser, approve revisions, or request changes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span><strong>1-Click Payment:</strong> Clients settle invoices directly via card through Stripe or download official PDFs.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Complete Transaction Lifecycle */}
            <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 p-4 border border-blue-100 dark:border-blue-900/50">
              <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                Complete End-to-End Collaboration Cycle:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 p-2.5 border border-blue-200/60 dark:border-neutral-800">
                  <span className="font-bold text-blue-600 block mb-1">1. Launch Workspace</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Create project in studio & share /p/... link + passcode</span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 p-2.5 border border-blue-200/60 dark:border-neutral-800">
                  <span className="font-bold text-blue-600 block mb-1">2. Upload Work</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Drop deliverables into phases for client review</span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 p-2.5 border border-blue-200/60 dark:border-neutral-800">
                  <span className="font-bold text-blue-600 block mb-1">3. Client Approval</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Client approves with signature note in portal</span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-[#0B0F17]/80 p-2.5 border border-blue-200/60 dark:border-neutral-800">
                  <span className="font-bold text-blue-600 block mb-1">4. Settlement</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Issue invoice; client pays via card or PDF</span>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href={samplePortalPath}
                target="_blank"
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-semibold transition flex items-center gap-2 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Test Meridian Client Hub (Passcode: meridian2026)</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
