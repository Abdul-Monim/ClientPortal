import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  Lock,
  Receipt,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingInteractiveShowcase } from "@/components/landing/LandingInteractiveShowcase";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner();
  const projects = await repo.listProjects(studio.id);
  const featuredProject = projects[0];
  const samplePortalHref = featuredProject
    ? `/p/${studio.slug}/${featuredProject.slug}`
    : "/dashboard";

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-3 sm:p-6 lg:p-8 font-ui text-neutral-900 selection:bg-neutral-900 selection:text-white dark:bg-[#07090E] dark:text-neutral-100">
      {/* Outer Editorial Canvas Frame matching the Reference Comp strictly <= 5% side gap */}
      <div className="w-[95%] max-w-[1760px] mx-auto rounded-[2.5rem] border border-neutral-200/80 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl transition-colors duration-300 dark:border-neutral-800 dark:bg-[#0C1017]">
        {/* ========================================================= */}
        {/* 1. INTERACTIVE NAVBAR (MOBILE DRAWER + THEME TOGGLE) */}
        {/* ========================================================= */}
        <LandingNavbar samplePortalHref={samplePortalHref} />

        {/* ========================================================= */}
        {/* 2. HERO TWO-COLUMN SPLIT (ABOUT ANCHOR) */}
        {/* ========================================================= */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-10 sm:py-16 items-center">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3.5 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Next-Generation Client Hub for Creatives</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
              App To Work Your Way,
              <br />
              Across Time And Space
            </h1>

            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-lg leading-relaxed">
              A calm, dedicated client workspace that eliminates messy email chains.
              Share deliverables, collect approvals, and get paid with zero login friction for your clients.
            </p>

            {/* CTA Group with Pill Button & Guarantee Badge */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition flex items-center gap-2.5"
              >
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={samplePortalHref}
                className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Explore Live Hub</span>
              </Link>

              <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>14 days free trial</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Cosmic Prismatic Visual */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-neutral-800 bg-[#06070B] shadow-2xl aspect-square sm:aspect-[4/3] lg:aspect-square flex items-center justify-center group">
              <Image
                src="/hero-cosmic.jpg"
                alt="Astronaut floating weightlessly in deep cosmic space on iridescent liquid glass"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle Ambient Radial Light Gradient */}
              <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-black/40" />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. LOGO / TRUSTED BY ROW */}
        {/* ========================================================= */}
        <section className="pt-8 sm:pt-12 pb-6 border-t border-neutral-100 dark:border-neutral-800/80">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-medium mb-6">
            Trusted by independent freelancers, studios, and agencies
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-6 sm:gap-8 items-center text-neutral-400 dark:text-neutral-600">
            {/* 8 Clean Geometric Vector Marks */}
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="9" fillOpacity="0.2" />
                <path d="M12 3a9 9 0 0 0 0 18v-18z" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6-6.2-4.5h7.6z" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="6" height="6" rx="2" />
                <rect x="14" y="4" width="6" height="6" rx="2" />
                <rect x="4" y="14" width="6" height="6" rx="2" />
                <rect x="14" y="14" width="6" height="6" rx="2" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center justify-center hover:text-neutral-800 dark:hover:text-neutral-300 transition">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. CORE FEATURES & CAPABILITIES */}
        {/* ========================================================= */}
        <section id="features" className="py-16 sm:py-20 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
              Calm Collaboration
            </span>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Everything your clients need, zero messy email chains.
            </h2>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              Give each client a dedicated link protected by a simple passcode. They see milestones,
              review deliverables, leave approvals, and pay invoices with one click.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-8 dark:border-neutral-800 dark:bg-[#10141D] transition hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900 dark:text-white">
                Passcode Gate & Zero Sign-Up
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Clients enter a simple password. No account creation, no password resets, no friction.
                Protected by instant bank-grade passcodes so clients can view deliverables immediately.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-8 dark:border-neutral-800 dark:bg-[#10141D] transition hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900 dark:text-white">
                Deliverables & Version Revisions
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Present Figma designs, videos, PDFs, and staging links. Clients switch between
                v1 and v2, leave timestamped feedback, and sign off with a single click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-8 dark:border-neutral-800 dark:bg-[#10141D] transition hover:shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                <Receipt className="h-4 w-4" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900 dark:text-white">
                Direct Stripe & Branded PDF
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Connect Stripe for direct online card settlements, or let clients download
                clean, official branded PDF invoices with itemized totals and instant receipts.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. INTERACTIVE PRODUCT TOUR (DUAL PERSPECTIVES) */}
        {/* ========================================================= */}
        <LandingInteractiveShowcase samplePortalHref={samplePortalHref} />

        {/* ========================================================= */}
        {/* 6. PRICING SECTION */}
        {/* ========================================================= */}
        <section id="pricing" className="py-16 sm:py-20 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
              Simple Pricing
            </span>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Start free, ascend as your client roster grows.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Free Starter */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 dark:border-neutral-800 dark:bg-[#10141D] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Solo Freelancer
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    $0
                  </span>
                  <span className="text-sm text-neutral-500">/ forever</span>
                </div>
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  Perfect for independent freelancers testing client hubs.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Up to 3 active client portals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Unlimited milestones & deliverables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Official PDF invoice generator</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <Link
                  href="/dashboard"
                  className="rounded-full w-full py-3 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2"
                >
                  <span>Use Free Version</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Pro Studio */}
            <div className="rounded-3xl border-2 border-neutral-900 bg-neutral-900 p-8 text-white dark:border-white dark:bg-[#141B28] flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Pro Studio
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white">
                    Recommended
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    $19
                  </span>
                  <span className="text-sm text-neutral-400">/ month</span>
                </div>
                <p className="mt-3 text-sm text-neutral-300">
                  Custom domain, unlimited client portals, and Stripe invoicing.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Unlimited client portals & archives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Custom domain (client.yourname.com)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Direct Stripe card settlements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Hosty-grade analytics & velocity charts</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <Link
                  href="/dashboard"
                  className="rounded-full w-full py-3 text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition flex items-center justify-center gap-2"
                >
                  <span>Launch Pro Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. EDITORIAL FOOTER */}
        {/* ========================================================= */}
        <footer className="pt-10 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 dark:text-white">ClientPortal</span>
            <span>&bull;</span>
            <span>M. Abdul Monim</span>
            <span>&bull;</span>
            <span>Independent White-Label SaaS Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition">
              Dashboard
            </Link>
            <Link href={samplePortalHref} className="hover:text-neutral-900 dark:hover:text-white transition">
              Sample Hub
            </Link>
            <Link href="https://github.com/Abdul-Monim/ClientPortal" target="_blank" className="hover:text-neutral-900 dark:hover:text-white transition flex items-center gap-1">
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
