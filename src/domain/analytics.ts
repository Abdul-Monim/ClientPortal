import { format, subDays } from "date-fns";
import { calculateProjectProgressPct } from "./milestones";
import { summarizeAccountsReceivable } from "./money";
import type {
  ActivityEvent,
  DeliverableStatus,
  Invoice,
  InvoiceStatus,
  ProjectBundle,
} from "./types";

export interface AnalyticsKpiCard {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  deltaPct: number;
  tone: "sky" | "lime" | "peach" | "slate";
}

export interface SplineSeriesPoint {
  dateKey: string;
  label: string;
  primaryValue: number;
  secondaryValue: number;
  revenueCents: number;
}

export interface BreakdownSegment {
  key: string;
  label: string;
  count: number;
  percentage: number;
  colorToken: "sky" | "lime" | "peach" | "slate";
}

export interface StudioAnalyticsPayload {
  generatedAt: string;
  kpis: AnalyticsKpiCard[];
  activitySpline: SplineSeriesPoint[];
  deliverableBreakdown: {
    total: number;
    segments: BreakdownSegment[];
  };
  invoiceBreakdown: {
    total: number;
    totalBilledCents: number;
    segments: BreakdownSegment[];
  };
  projectProgressSummary: Array<{
    projectId: string;
    title: string;
    clientCompany: string;
    progressPct: number;
    pendingReviewCount: number;
  }>;
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

export function buildStudioAnalytics(params: {
  bundles: ProjectBundle[];
  invoices: Invoice[];
  activities: ActivityEvent[];
  referenceDate?: Date;
}): StudioAnalyticsPayload {
  const { bundles, invoices, activities, referenceDate = new Date() } = params;

  const allDeliverables = bundles.flatMap((b) => b.deliverables);
  const deliverableCounts: Record<DeliverableStatus, number> = {
    approved: 0,
    in_review: 0,
    changes_requested: 0,
    draft: 0,
  };
  for (const d of allDeliverables) {
    deliverableCounts[d.status] += 1;
  }

  const totalDeliverables = allDeliverables.length;
  const decidedDeliverables =
    deliverableCounts.approved + deliverableCounts.changes_requested;
  const approvalRatePct =
    decidedDeliverables > 0
      ? pct(deliverableCounts.approved, decidedDeliverables)
      : totalDeliverables > 0
        ? pct(deliverableCounts.approved, totalDeliverables)
        : 100;

  const ar = summarizeAccountsReceivable(invoices);

  const invoiceCounts: Record<InvoiceStatus, number> = {
    paid: 0,
    sent: 0,
    overdue: 0,
    draft: 0,
    void: 0,
  };
  for (const inv of invoices) {
    invoiceCounts[inv.status] += 1;
  }
  const activeInvoicesTotal =
    invoiceCounts.paid + invoiceCounts.sent + invoiceCounts.overdue + invoiceCounts.draft;

  const avgProgressPct =
    bundles.length > 0
      ? Math.round(
          bundles.reduce((sum, b) => sum + calculateProjectProgressPct(b.milestones), 0) /
            bundles.length
        )
      : 0;

  const kpis: AnalyticsKpiCard[] = [
    {
      id: "active_portals",
      label: "Active Portals",
      value: String(bundles.length),
      numericValue: bundles.length,
      deltaPct: bundles.length > 0 ? 12.5 : 0,
      tone: "sky",
    },
    {
      id: "approval_rate",
      label: "Approval Rate",
      value: `${approvalRatePct}%`,
      numericValue: approvalRatePct,
      deltaPct: 4.8,
      tone: "lime",
    },
    {
      id: "pending_reviews",
      label: "Awaiting Review",
      value: String(deliverableCounts.in_review),
      numericValue: deliverableCounts.in_review,
      deltaPct: deliverableCounts.changes_requested > 0 ? -2.4 : 1.6,
      tone: "peach",
    },
    {
      id: "avg_progress",
      label: "Avg. Milestone Completion",
      value: `${avgProgressPct}%`,
      numericValue: avgProgressPct,
      deltaPct: 6.2,
      tone: "slate",
    },
  ];

  // Build 7 deterministic rolling time-series buckets for smooth spline rendering
  const buckets: SplineSeriesPoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = subDays(referenceDate, i * 5);
    const dateKey = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM d");
    buckets.push({
      dateKey,
      label,
      primaryValue: 0,
      secondaryValue: 0,
      revenueCents: 0,
    });
  }

  for (const ev of activities) {
    const evDate = ev.createdAt.slice(0, 10);
    const targetBucket =
      buckets.find((b) => evDate <= b.dateKey) ?? buckets[buckets.length - 1];
    if (!targetBucket) continue;
    if (ev.actorRole === "client") {
      targetBucket.primaryValue += 1;
    } else {
      targetBucket.secondaryValue += 1;
    }
  }

  for (const inv of invoices) {
    if (inv.status === "void") continue;
    const invDate = inv.issueDate.slice(0, 10);
    const targetBucket =
      buckets.find((b) => invDate <= b.dateKey) ?? buckets[buckets.length - 1];
    if (targetBucket) {
      targetBucket.revenueCents += inv.totalCents;
    }
  }

  const deliverableBreakdown = {
    total: totalDeliverables,
    segments: [
      {
        key: "approved",
        label: "Approved",
        count: deliverableCounts.approved,
        percentage: pct(deliverableCounts.approved, totalDeliverables),
        colorToken: "lime" as const,
      },
      {
        key: "in_review",
        label: "Ready for Review",
        count: deliverableCounts.in_review,
        percentage: pct(deliverableCounts.in_review, totalDeliverables),
        colorToken: "sky" as const,
      },
      {
        key: "changes_requested",
        label: "Changes Requested",
        count: deliverableCounts.changes_requested,
        percentage: pct(deliverableCounts.changes_requested, totalDeliverables),
        colorToken: "peach" as const,
      },
      {
        key: "draft",
        label: "Draft",
        count: deliverableCounts.draft,
        percentage: pct(deliverableCounts.draft, totalDeliverables),
        colorToken: "slate" as const,
      },
    ],
  };

  const invoiceBreakdown = {
    total: activeInvoicesTotal,
    totalBilledCents: ar.totalBilledCents,
    segments: [
      {
        key: "paid",
        label: "Paid",
        count: invoiceCounts.paid,
        percentage: pct(invoiceCounts.paid, activeInvoicesTotal),
        colorToken: "lime" as const,
      },
      {
        key: "sent",
        label: "Awaiting Payment",
        count: invoiceCounts.sent,
        percentage: pct(invoiceCounts.sent, activeInvoicesTotal),
        colorToken: "sky" as const,
      },
      {
        key: "overdue",
        label: "Overdue",
        count: invoiceCounts.overdue,
        percentage: pct(invoiceCounts.overdue, activeInvoicesTotal),
        colorToken: "peach" as const,
      },
      {
        key: "draft",
        label: "Draft",
        count: invoiceCounts.draft,
        percentage: pct(invoiceCounts.draft, activeInvoicesTotal),
        colorToken: "slate" as const,
      },
    ],
  };

  const projectProgressSummary = bundles.map((b) => ({
    projectId: b.project.id,
    title: b.project.title,
    clientCompany: b.project.clientCompany,
    progressPct: calculateProjectProgressPct(b.milestones),
    pendingReviewCount: b.deliverables.filter((d) => d.status === "in_review").length,
  }));

  return {
    generatedAt: referenceDate.toISOString(),
    kpis,
    activitySpline: buckets,
    deliverableBreakdown,
    invoiceBreakdown,
    projectProgressSummary,
  };
}
