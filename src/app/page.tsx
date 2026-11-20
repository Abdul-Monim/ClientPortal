import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingInteractiveShowcase } from "@/components/landing/LandingInteractiveShowcase";
import { BrandLogo } from "@/components/ui/BrandLogo";
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
      <div className="w-[95%] max-w-[1760px] mx-auto rounded-[2.5rem] border border-neutral-200/80 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl transition-colors duration-300 dark:border-neutral-800 dark:bg-[#0C1017] space-y-16 sm:space-y-24">
        {/* ========================================================= */}
        {/* 1. INTERACTIVE NAVBAR (MOBILE DRAWER + THEME TOGGLE) */}
        {/* ========================================================= */}
        <LandingNavbar samplePortalHref={samplePortalHref} />

        {/* ========================================================= */}
        {/* 2. HERO TWO-COLUMN SPLIT (ABOUT ANCHOR) */}
        {/* ========================================================= */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 pb-6">
          {/* Left Column: Niche Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-xs">
              <BrandLogo size={16} variant="adaptive" className="text-neutral-900 dark:text-white" />
              <span>White-Label Client Hub for Freelancers & Studios</span>
            </div>

            <h1 className="font-ui text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
              Deliver Work Calmly.
              <br />
              Close Approvals Faster.
              <br />
              Get Paid on Time.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
              Stop losing feedback in messy WhatsApp threads and buried email chains.
              Give each client a dedicated, password-protected hub to review deliverables,
              track milestone progress, and pay invoices with one click.
            </p>

            {/* CTA Group with Material You Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition flex items-center gap-2.5 active:scale-95"
              >
                <span>Launch Free Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={samplePortalHref}
                className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Test Live Client View</span>
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-amber-500/15 border border-amber-500/30 px-5 py-3.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1.5"
                title="1-Click fast-track for developer debugging and demo inspection"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Dev / Demo Mode</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>Zero client sign-ups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>Direct Stripe card checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>Official PDF receipts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase Comp */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-[#06080E] shadow-2xl aspect-[4/3] flex items-center justify-center group">
              <Image
                src="/showcase-cosmic.jpg"
                alt="Minimalist crystal prism floating in deep space casting cyan and violet caustics"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Private Client Hub &bull; Meridian Labs</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Figma designs, milestone tracking & Stripe payments in one clean URL.
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Clients simply enter their project password. No account creation required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. 3-STEP REAL-LIFE CLIENT WORKFLOW                       */}
        {/* ========================================================= */}
        <section className="border-t border-neutral-100 dark:border-neutral-800/80 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
              The 3-Step Client Workflow
            </span>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              How ClientPortal works in practice
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Designed from real-life client-server scenarios to keep projects moving forward without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-8 dark:border-neutral-800 dark:bg-[#10141D] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md">
                01
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Create Workspace in 60s
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Add your client&apos;s name and company, outline the project milestones, and set a simple client passcode.
                No client accounts or sign-ups required.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-8 dark:border-neutral-800 dark:bg-[#10141D] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md">
                02
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Share Deliverables & Inspect
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Publish Figma links, Loom videos, PDFs, or staging URLs. Clients open the asset in an inline lightbox,
                review version changelogs, and leave formal sign-offs.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-8 dark:border-neutral-800 dark:bg-[#10141D] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold text-sm shadow-md">
                03
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Get Invoices Settled Instantly
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Attach milestone invoices directly in the client hub. Clients pay via Stripe or card,
                and download official branded PDF receipts on the spot.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. REAL-WORLD COMPARISON (OLD WAY VS CLIENTPORTAL WAY)   */}
        {/* ========================================================= */}
        <section className="border-t border-neutral-100 dark:border-neutral-800/80 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
              Harmonious Collaboration
            </span>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Why freelancers switch to ClientPortal
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="rounded-3xl border border-rose-200/70 bg-rose-50/30 p-8 dark:border-rose-950/40 dark:bg-rose-950/10 space-y-5">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <span>The Chaotic Way (Email, Slack, WhatsApp)</span>
              </div>
              <ul className="space-y-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">&times;</span>
                  <span>Feedback scattered across WhatsApp voice notes, email threads, and Figma comments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">&times;</span>
                  <span>Clients constantly asking: &ldquo;Can you resend the latest version link?&rdquo;</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">&times;</span>
                  <span>No audit trail of who approved what design or when changes were requested.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">&times;</span>
                  <span>Chasing bank transfer receipts and invoice payments at the end of the month.</span>
                </li>
              </ul>
            </div>

            {/* The ClientPortal Way */}
            <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/30 p-8 dark:border-emerald-950/40 dark:bg-emerald-950/10 space-y-5">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>The ClientPortal Blueprint</span>
              </div>
              <ul className="space-y-3.5 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 font-bold mt-0.5 shrink-0" />
                  <span>One dedicated, password-protected URL per client. Always current.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 font-bold mt-0.5 shrink-0" />
                  <span>Version vault with changelog notes and instant asset inspection modal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 font-bold mt-0.5 shrink-0" />
                  <span>Formal client approvals with timestamped audit records.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 font-bold mt-0.5 shrink-0" />
                  <span>1-click card payments via Stripe and instant branded PDF receipts.</span>
                </li>
              </ul>
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
        <section id="pricing" className="py-12 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
              Simple Pricing
            </span>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
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
                    <span>Interactive analytics & velocity charts</span>
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
          <div className="flex items-center gap-3">
            <BrandLogo size={20} variant="adaptive" />
            <span className="font-bold text-neutral-900 dark:text-white">ClientPortal</span>
            <span>&bull;</span>
            <span>M. Abdul Monim</span>
            <span>&bull;</span>
            <span>White-Label Freelancer SaaS Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition">
              Dashboard
            </Link>
            <Link href={samplePortalHref} className="hover:text-neutral-900 dark:hover:text-white transition">
              Sample Hub
            </Link>
            <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition">
              Dev Mode
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
