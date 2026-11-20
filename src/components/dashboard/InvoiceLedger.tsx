"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Plus,
  Receipt,
  Send,
  Trash2,
} from "lucide-react";
import {
  calculateInvoiceTotals,
  dollarsToCents,
  formatCurrencyCents,
  taxPercentToBps,
} from "@/domain/money";
import type { Invoice, Project } from "@/domain/types";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  createInvoiceAction,
  updateInvoiceStatusAction,
} from "@/services/studio-actions";

interface DraftRow {
  description: string;
  quantity: string;
  unitAmountDollars: string;
}

export function InvoiceLedger({
  invoices,
  projects,
  stripeConnected,
}: {
  invoices: Array<Invoice & { projectTitle: string; clientCompany: string }>;
  projects: Project[];
  stripeConnected: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "CAD" | "AUD">("USD");
  const [taxPercent, setTaxPercent] = useState("0");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 86400 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("Net 14 terms. Thank you for your business.");
  const [rows, setRows] = useState<DraftRow[]>([
    { description: "Milestone Delivery & Handoff", quantity: "1", unitAmountDollars: "1500" },
  ]);

  const previewTotals = (() => {
    try {
      const parsed = rows
        .filter((r) => r.description.trim() && Number(r.unitAmountDollars) > 0)
        .map((r) => ({
          description: r.description,
          quantity: Math.max(1, Math.floor(Number(r.quantity) || 1)),
          unitAmountCents: dollarsToCents(Number(r.unitAmountDollars) || 0),
        }));
      if (parsed.length === 0) return null;
      return calculateInvoiceTotals(parsed, taxPercentToBps(Number(taxPercent) || 0));
    } catch {
      return null;
    }
  })();

  function addRow() {
    setRows((prev) => [
      ...prev,
      { description: "", quantity: "1", unitAmountDollars: "500" },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  }

  function updateRow(index: number, patch: Partial<DraftRow>) {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)));
  }

  function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    startTransition(async () => {
      const res = await createInvoiceAction({
        projectId,
        title,
        currency,
        taxPercent: Number(taxPercent) || 0,
        dueDate,
        notes,
        issueImmediately: true,
        lineItems: rows.map((r) => ({
          description: r.description,
          quantity: Number(r.quantity) || 1,
          unitAmountDollars: Number(r.unitAmountDollars) || 0,
        })),
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) {
        setTitle("");
        setRows([{ description: "", quantity: "1", unitAmountDollars: "500" }]);
        router.refresh();
      }
    });
  }

  function handleStatusChange(
    invoiceId: string,
    invProjectId: string,
    status: "sent" | "paid" | "void"
  ) {
    startTransition(async () => {
      const res = await updateInvoiceStatusAction({
        invoiceId,
        projectId: invProjectId,
        status,
        paymentMethodNote:
          status === "paid" ? "Settled via External Bank / Wire" : undefined,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {banner && (
        <div
          className={`rounded-3xl border px-5 py-3.5 text-xs font-medium ${
            banner.ok
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* Existing Invoices Table */}
      <section className="surface-card overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] px-6 py-5">
          <div>
            <p className="eyebrow">Billing Ledger</p>
            <h2 className="mt-1 font-ui text-2xl font-bold tracking-tight">
              Issued Invoices
            </h2>
          </div>
          <span className="rounded-full border border-[var(--border-hairline)] bg-[var(--surface-panel)] px-3.5 py-1.5 text-xs text-[var(--ink-secondary)]">
            Stripe Sync: {stripeConnected ? "Connected" : "Native PDF + Manual Settlement"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                <th className="px-6 py-3.5 font-medium">Invoice</th>
                <th className="px-6 py-3.5 font-medium">Client & Project</th>
                <th className="px-6 py-3.5 font-medium">Due Date</th>
                <th className="px-6 py-3.5 font-medium">Amount</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[var(--ink-muted)]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Receipt className="mx-auto h-8 w-8 text-neutral-400" />
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">No Invoices Issued Yet</p>
                      <p>Create a project and use the form below to issue your first itemized invoice or retainer deposit.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--surface-panel)]/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{inv.invoiceNumber}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{inv.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{inv.clientCompany}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{inv.projectTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-xs tabular-nums text-[var(--ink-secondary)]">
                      {inv.dueDate}
                    </td>
                    <td className="px-6 py-4 font-semibold tabular-nums">
                      {formatCurrencyCents(inv.totalCents, inv.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          className="pill-btn pill-btn-outline px-3 py-1.5 text-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </a>
                        {inv.stripeHostedUrl && (
                          <a
                            href={inv.stripeHostedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="pill-btn pill-btn-outline px-3 py-1.5 text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Stripe</span>
                          </a>
                        )}
                        {inv.status === "draft" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(inv.id, inv.projectId, "sent")}
                            className="pill-btn pill-btn-brand px-3 py-1.5 text-xs"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Issue</span>
                          </button>
                        )}
                        {(inv.status === "sent" || inv.status === "overdue") && (
                          <>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatusChange(inv.id, inv.projectId, "paid")}
                              className="pill-btn pill-btn-brand px-3 py-1.5 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Paid</span>
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatusChange(inv.id, inv.projectId, "void")}
                              className="pill-btn pill-btn-outline h-8 w-8 p-0 text-rose-600"
                              title="Void Invoice"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create New Invoice Form */}
      <form
        onSubmit={handleCreateInvoice}
        className="surface-card rounded-3xl p-6 space-y-5"
      >
        <div>
          <p className="eyebrow">Issue New Invoice</p>
          <h2 className="mt-1 font-ui text-2xl font-bold tracking-tight">
            Create Itemized Client Invoice
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Client Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="field-input"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clientCompany} — {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "USD" | "EUR" | "GBP" | "CAD" | "AUD")
              }
              className="field-input"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Invoice Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Final Launch & Source Handoff"
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="50"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              className="field-input tabular-nums"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--ink-secondary)]">
              Line Items
            </label>
            <button
              type="button"
              onClick={addRow}
              className="pill-btn pill-btn-outline px-3.5 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Line</span>
            </button>
          </div>

          {rows.map((row, idx) => (
            <div key={idx} className="grid items-center gap-3 sm:grid-cols-12">
              <input
                type="text"
                required
                value={row.description}
                onChange={(e) => updateRow(idx, { description: e.target.value })}
                placeholder="Deliverable or service description"
                className="field-input sm:col-span-7"
              />
              <input
                type="number"
                required
                min={1}
                value={row.quantity}
                onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                placeholder="Qty"
                className="field-input tabular-nums sm:col-span-2"
              />
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={row.unitAmountDollars}
                onChange={(e) => updateRow(idx, { unitAmountDollars: e.target.value })}
                placeholder="Rate"
                className="field-input tabular-nums sm:col-span-2"
              />
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                className="pill-btn pill-btn-outline h-10 w-10 p-0 disabled:opacity-40 sm:col-span-1"
                title="Remove line item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-[var(--border-hairline)] pt-5 sm:flex-row sm:items-end">
          <div className="w-full max-w-md">
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Payment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field-input"
            />
          </div>

          <div className="flex flex-col items-end gap-3">
            {previewTotals && (
              <div className="text-right text-xs text-[var(--ink-secondary)] space-y-1 tabular-nums">
                <p>
                  Subtotal: {formatCurrencyCents(previewTotals.subtotalCents, currency)}
                </p>
                <p>Tax: {formatCurrencyCents(previewTotals.taxCents, currency)}</p>
                <p className="text-base font-semibold text-[var(--ink-primary)]">
                  Total: {formatCurrencyCents(previewTotals.totalCents, currency)}
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="pill-btn pill-btn-brand px-6 py-3 text-sm"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Receipt className="h-4 w-4" />
              )}
              <span>{isPending ? "Issuing Invoice..." : "Issue Invoice to Portal"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
