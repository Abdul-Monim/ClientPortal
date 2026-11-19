import { formatCurrencyCents, summarizeAccountsReceivable } from "@/domain/money";
import { InvoiceLedger } from "@/components/dashboard/InvoiceLedger";
import { isStripeConfigured } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

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
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Revenue & Receipts</p>
        <h1 className="mt-1 font-editorial text-4xl font-semibold sm:text-5xl">
          Invoices & Payments
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Every invoice is computed in integer cents and downloadable by clients as a
          white-labeled PDF directly inside their portal.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card rounded-3xl p-6">
          <p className="eyebrow">Total Billed</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {formatCurrencyCents(ar.totalBilledCents)}
          </p>
        </div>
        <div className="surface-card rounded-3xl p-6">
          <p className="eyebrow">Collected</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--brand-accent)]">
            {formatCurrencyCents(ar.totalPaidCents)}
          </p>
        </div>
        <div className="surface-card rounded-3xl p-6">
          <p className="eyebrow">Awaiting Payment</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {formatCurrencyCents(ar.totalOutstandingCents)}
          </p>
        </div>
      </section>

      <InvoiceLedger
        invoices={invoices}
        projects={projects}
        stripeConnected={isStripeConfigured()}
      />
    </div>
  );
}
