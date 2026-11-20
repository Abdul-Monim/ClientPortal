import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
} from "lucide-react";
import { formatCurrencyCents, summarizeAccountsReceivable } from "@/domain/money";
import { InvoiceLedger } from "@/components/dashboard/InvoiceLedger";
import { isStripeConfigured } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const freelancer = await getAuthenticatedFreelancer();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer?.id);
  const [projects, invoices] = await Promise.all([
    repo.listProjects(studio.id),
    repo.listInvoicesForStudio(studio.id),
  ]);
  const ar = summarizeAccountsReceivable(invoices);

  return (
    <div className="w-full space-y-8">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB */}
      {/* ========================================================= */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
            <span>Finance</span>
            <span>&bull;</span>
            <span className="text-neutral-900 dark:text-white">Invoices & Settlements</span>
          </div>
          <h1 className="mt-1 font-ui text-3xl font-bold tracking-tight sm:text-4xl text-neutral-900 dark:text-white">
            Invoices & Payments
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Deterministic integer-cents invoicing for freelance projects. Clients pay online
            via Stripe or download pure-JS white-labeled branded PDFs directly in their hub.
          </p>
        </div>

        {/* Filter Pills matching Hosty style */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800 px-4 py-1.5 text-xs font-medium">
            All Invoices ({invoices.length})
          </span>
          <span className="rounded-full bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-700 px-4 py-1.5 text-xs font-medium">
            Settled ({ar.paidCount})
          </span>
          <span className="rounded-full bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-700 px-4 py-1.5 text-xs font-medium">
            Awaiting ({ar.openCount})
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FOUR PASTEL FINANCIAL STATS CARDS (Hosty Aesthetic) */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sky Card: Total Billed */}
        <div className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs dark:bg-[#162738] dark:text-[#BAE6FD]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-200/60 text-[#133E53] dark:bg-sky-900/50 dark:text-sky-300">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              Billed
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">
            {formatCurrencyCents(ar.totalBilledCents)}
          </div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Total Invoiced
          </div>
        </div>

        {/* Lime Card: Collected & Settled */}
        <div className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs dark:bg-[#1A3320] dark:text-[#BBF7D0]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200/60 text-[#1F4E24] dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              Settled
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">
            {formatCurrencyCents(ar.totalPaidCents)}
          </div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Collected Revenue ({ar.paidCount} paid)
          </div>
        </div>

        {/* Peach Card: Outstanding / Awaiting Payment */}
        <div className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-xs dark:bg-[#3D2516] dark:text-[#FED7AA]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/60 text-[#7C2D12] dark:bg-amber-900/50 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200">
              Awaiting
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">
            {formatCurrencyCents(ar.totalOutstandingCents)}
          </div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Open Receivables ({ar.openCount} open)
          </div>
        </div>

        {/* Lavender / Purple Card: Invoicing Engine Mode */}
        <div className="rounded-2xl bg-[#F1EEFE] p-5 text-[#4C1D95] shadow-xs dark:bg-[#251D3A] dark:text-[#DDD6FE]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-200/70 text-[#4C1D95] dark:bg-purple-900/60 dark:text-purple-300">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 shadow-xs">
              {isStripeConfigured() ? "Stripe Live" : "Native PDF"}
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">100%</div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Branded PDF & Card Readiness
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INVOICE LEDGER TABLE & ISSUANCE WORKBENCH */}
      {/* ========================================================= */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-[#0E131F]">
        <InvoiceLedger
          invoices={invoices}
          projects={projects}
          stripeConnected={isStripeConfigured()}
        />
      </section>
    </div>
  );
}
