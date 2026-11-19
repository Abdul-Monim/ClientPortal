import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  Eye,
  Ban,
  Send,
  Sparkles,
} from "lucide-react";
import type {
  DeliverableStatus,
  InvoiceStatus,
  MilestoneStatus,
  ProjectStatus,
} from "@/domain/types";

type AnyStatus = DeliverableStatus | InvoiceStatus | MilestoneStatus | ProjectStatus;

interface StatusStyle {
  label: string;
  className: string;
  Icon: typeof CheckCircle2;
}

const STATUS_MAP: Record<AnyStatus, StatusStyle> = {
  approved: {
    label: "Approved",
    className:
      "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    Icon: CheckCircle2,
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    Icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    Icon: CheckCircle2,
  },
  in_review: {
    label: "Ready for Review",
    className: "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/25",
    Icon: Eye,
  },
  sent: {
    label: "Awaiting Payment",
    className: "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/25",
    Icon: Send,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-sky-500/12 text-sky-800 dark:text-sky-300 border-sky-500/25",
    Icon: Sparkles,
  },
  active: {
    label: "Active",
    className: "bg-sky-500/12 text-sky-800 dark:text-sky-300 border-sky-500/25",
    Icon: Sparkles,
  },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25",
    Icon: AlertCircle,
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25",
    Icon: AlertCircle,
  },
  planned: {
    label: "Planned",
    className:
      "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20",
    Icon: Clock,
  },
  paused: {
    label: "Paused",
    className:
      "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20",
    Icon: Clock,
  },
  draft: {
    label: "Draft",
    className:
      "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20",
    Icon: FileEdit,
  },
  void: {
    label: "Void",
    className:
      "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20",
    Icon: Ban,
  },
  archived: {
    label: "Archived",
    className:
      "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20",
    Icon: Ban,
  },
};

export function StatusPill({ status }: { status: AnyStatus }) {
  const { label, className, Icon } = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
