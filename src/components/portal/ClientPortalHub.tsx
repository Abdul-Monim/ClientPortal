"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Film,
  Figma,
  Globe,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Receipt,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { calculateProjectProgressPct, countCompletedMilestones } from "@/domain/milestones";
import { formatCurrencyCents } from "@/domain/money";
import type { Deliverable, DeliverableStatus, ProjectBundle } from "@/domain/types";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusPill } from "@/components/ui/StatusPill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type PortalTab = "deliverables" | "milestones" | "invoices" | "activity";

function KindIcon({ kind }: { kind: Deliverable["kind"] }) {
  switch (kind) {
    case "figma":
      return <Figma className="h-4 w-4" />;
    case "loom":
    case "video":
      return <Film className="h-4 w-4" />;
    case "staging_url":
      return <Globe className="h-4 w-4" />;
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

export function ClientPortalHub({ bundle }: { bundle: ProjectBundle }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PortalTab>("deliverables");
  const [filterStatus, setFilterStatus] = useState<"all" | DeliverableStatus>("all");
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Formal Approval / Revision Modal state
  const [reviewModal, setReviewModal] = useState<{
    deliverable: Deliverable;
    versionId: string;
    versionNumber: number;
    decision: "approved" | "changes_requested";
  } | null>(null);
  const [reviewerName, setReviewerName] = useState(bundle.project.clientName);
  const [reviewerEmail, setReviewerEmail] = useState(bundle.project.clientEmail);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Comment composer state per deliverable
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentPostingId, setCommentPostingId] = useState<string | null>(null);

  const progressPct = calculateProjectProgressPct(bundle.milestones);
  const milestoneCount = countCompletedMilestones(bundle.milestones);
  const pendingReviewCount = bundle.deliverables.filter(
    (d) => d.status === "in_review"
  ).length;
  const openInvoicesCount = bundle.invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  ).length;

  const visibleDeliverables =
    filterStatus === "all"
      ? bundle.deliverables
      : bundle.deliverables.filter((d) => d.status === filterStatus);

  async function handleSignOut() {
    await fetch(`/api/portal/auth?projectId=${encodeURIComponent(bundle.project.id)}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function handleSubmitDecision(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewModal) return;
    setSubmittingReview(true);
    setBanner(null);

    try {
      const res = await fetch(
        `/api/portal/deliverables/${reviewModal.deliverable.id}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: bundle.project.id,
            deliverableVersionId: reviewModal.versionId,
            decision: reviewModal.decision,
            reviewerName,
            reviewerEmail,
            feedbackNote,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setBanner({ ok: false, text: data.error ?? "Could not record your review." });
        return;
      }

      setBanner({
        ok: true,
        text:
          reviewModal.decision === "approved"
            ? `Thank you! Approved v${reviewModal.versionNumber} of "${reviewModal.deliverable.title}".`
            : `Revision request sent for "${reviewModal.deliverable.title}".`,
      });
      setReviewModal(null);
      setFeedbackNote("");
      router.refresh();
    } catch {
      setBanner({ ok: false, text: "Network issue while saving your response." });
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handlePostComment(e: React.FormEvent, deliverableId: string) {
    e.preventDefault();
    const body = (commentDrafts[deliverableId] ?? "").trim();
    if (!body) return;

    setCommentPostingId(deliverableId);
    setBanner(null);
    try {
      const res = await fetch(`/api/portal/deliverables/${deliverableId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: bundle.project.id,
          authorRole: "client",
          authorName: reviewerName || bundle.project.clientName,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ ok: false, text: data.error ?? "Could not post comment." });
        return;
      }
      setCommentDrafts((prev) => ({ ...prev, [deliverableId]: "" }));
      router.refresh();
    } catch {
      setBanner({ ok: false, text: "Unable to post your comment right now." });
    } finally {
      setCommentPostingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-neutral-900 dark:bg-[#070A0F] dark:text-neutral-100 pb-24 transition-colors duration-200">
      {/* Branded Floating Capsule Header with <= 5% side margins */}
      <header className="sticky top-4 z-40 w-[95%] max-w-[1740px] mx-auto px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#0A0E17] text-white px-5 py-3 shadow-xl border border-neutral-800">
          <div className="flex items-center gap-3 pl-1">
            <BrandAvatar
              studioName={bundle.studio.studioName}
              logoUrl={bundle.studio.logoUrl}
              size="sm"
            />
            <div className="leading-tight">
              <p className="font-editorial text-xl font-bold tracking-tight text-white">
                {bundle.studio.studioName}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                {bundle.project.clientCompany} Client Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${bundle.studio.contactEmail}`}
              className="hidden sm:inline-flex rounded-full bg-neutral-800/80 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition ring-1 ring-neutral-700/60 items-center gap-2"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Studio</span>
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-[95%] max-w-[1740px] mx-auto space-y-8 px-2 sm:px-4 pt-8">
        {/* Hero Overview Band matching Hosty / FreelanceOS rounded outer frame */}
        <section className="flex flex-col justify-between gap-8 rounded-[2.5rem] border border-neutral-200/80 bg-white p-7 sm:p-10 shadow-xl lg:flex-row lg:items-center dark:border-neutral-800 dark:bg-[#0E131F]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill status={bundle.project.status} />
              {bundle.project.targetLaunchDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Target Launch: {bundle.project.targetLaunchDate}</span>
                </span>
              )}
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {bundle.project.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {bundle.project.summary || bundle.studio.welcomeMessage}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                <strong className="text-neutral-900 dark:text-white">
                  {milestoneCount.completed}/{milestoneCount.total}
                </strong>{" "}
                milestones approved
              </span>
              <span>
                <strong className="text-neutral-900 dark:text-white">{pendingReviewCount}</strong>{" "}
                deliverables awaiting review
              </span>
              <span>
                <strong className="text-neutral-900 dark:text-white">{openInvoicesCount}</strong>{" "}
                open invoices
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center p-2 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200/60 dark:ring-neutral-800">
            <ProgressRing percentage={progressPct} size={124} strokeWidth={9} />
          </div>
        </section>

        {/* 4 Pastel Summary Cards in Client Hub */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs dark:bg-[#162738] dark:text-[#BAE6FD]">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Progress</div>
            <div className="mt-2 text-3xl font-bold">{progressPct}%</div>
            <div className="mt-1 text-xs opacity-80">Milestone completion</div>
          </div>
          <div className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs dark:bg-[#1A3320] dark:text-[#BBF7D0]">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Approved</div>
            <div className="mt-2 text-3xl font-bold">
              {bundle.deliverables.filter((d) => d.status === "approved").length}
            </div>
            <div className="mt-1 text-xs opacity-80">Deliverables signed off</div>
          </div>
          <div className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-xs dark:bg-[#3D2516] dark:text-[#FED7AA]">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Review Ready</div>
            <div className="mt-2 text-3xl font-bold">{pendingReviewCount}</div>
            <div className="mt-1 text-xs opacity-80">Awaiting your approval</div>
          </div>
          <div className="rounded-2xl bg-neutral-800/90 p-5 text-neutral-200 shadow-xs dark:bg-[#1A202C] dark:text-neutral-100 ring-1 ring-neutral-700/60">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Invoices</div>
            <div className="mt-2 text-3xl font-bold">{bundle.invoices.length}</div>
            <div className="mt-1 text-xs opacity-80">Linked invoice receipts</div>
          </div>
        </section>

        {banner && (
          <div
            className={`rounded-2xl border px-5 py-3.5 text-xs font-medium ${
              banner.ok
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Section Capsule Tabs */}
        <nav className="flex flex-wrap items-center gap-2">
          {(
            [
              {
                id: "deliverables",
                label: `Deliverables (${bundle.deliverables.length})`,
                Icon: FileText,
              },
              {
                id: "milestones",
                label: `Milestones (${bundle.milestones.length})`,
                Icon: Sparkles,
              },
              {
                id: "invoices",
                label: `Invoices (${bundle.invoices.length})`,
                Icon: Receipt,
              },
              {
                id: "activity",
                label: "Activity Timeline",
                Icon: Activity,
              },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`pill-btn px-5 py-2.5 text-xs sm:text-sm ${
                activeTab === id ? "pill-btn-brand" : "pill-btn-outline"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* TAB 1: DELIVERABLES */}
        {activeTab === "deliverables" && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: "all", label: "All Deliverables" },
                  { id: "in_review", label: "Ready for Review" },
                  { id: "approved", label: "Approved" },
                  { id: "changes_requested", label: "Changes Requested" },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilterStatus(chip.id)}
                  className={`pill-btn px-4 py-1.5 text-xs ${
                    filterStatus === chip.id
                      ? "border border-[var(--brand-accent-border)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"
                      : "pill-btn-outline text-[var(--ink-secondary)]"
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {visibleDeliverables.length === 0 ? (
              <div className="surface-card rounded-3xl p-10 text-center text-sm text-[var(--ink-muted)]">
                No deliverables match this filter right now.
              </div>
            ) : (
              <div className="space-y-5">
                {visibleDeliverables.map((del) => {
                  const activeVersionId =
                    selectedVersions[del.id] ??
                    del.versions[del.versions.length - 1]?.id ??
                    "";
                  const activeVersion =
                    del.versions.find((v) => v.id === activeVersionId) ??
                    del.versions[del.versions.length - 1];
                  const href =
                    activeVersion?.assetUrl || activeVersion?.externalUrl || "#";
                  const isImagePreview =
                    activeVersion?.assetUrl &&
                    /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(activeVersion.assetUrl);

                  return (
                    <article
                      key={del.id}
                      className="surface-card rounded-3xl p-6 sm:p-7 space-y-5"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill status={del.status} />
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-panel)] px-3 py-1 text-xs text-[var(--ink-secondary)]">
                              <KindIcon kind={del.kind} />
                              <span className="capitalize">
                                {del.kind.replace("_", " ")}
                              </span>
                            </span>
                          </div>
                          <h2 className="font-editorial text-3xl font-semibold">
                            {del.title}
                          </h2>
                          <p className="max-w-2xl text-sm text-[var(--ink-secondary)]">
                            {del.summary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="pill-btn pill-btn-outline px-4 py-2.5 text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open Deliverable</span>
                          </a>

                          {del.status === "in_review" && activeVersion && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewModal({
                                    deliverable: del,
                                    versionId: activeVersion.id,
                                    versionNumber: activeVersion.versionNumber,
                                    decision: "changes_requested",
                                  })
                                }
                                className="pill-btn pill-btn-outline px-4 py-2.5 text-xs"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Request Changes</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewModal({
                                    deliverable: del,
                                    versionId: activeVersion.id,
                                    versionNumber: activeVersion.versionNumber,
                                    decision: "approved",
                                  })
                                }
                                className="pill-btn pill-btn-brand px-5 py-2.5 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve Deliverable</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Image Preview when direct asset is an image */}
                      {isImagePreview && activeVersion?.assetUrl && (
                        <div className="overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-panel)]">
                          <img
                            src={activeVersion.assetUrl}
                            alt={del.title}
                            className="max-h-[420px] w-full object-contain"
                          />
                        </div>
                      )}

                      {/* Version Switcher & Release Notes */}
                      <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[var(--surface-panel)] p-4 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {del.versions.map((ver) => (
                            <button
                              key={ver.id}
                              type="button"
                              onClick={() =>
                                setSelectedVersions((prev) => ({
                                  ...prev,
                                  [del.id]: ver.id,
                                }))
                              }
                              className={`pill-btn px-3 py-1 text-xs ${
                                activeVersion?.id === ver.id
                                  ? "pill-btn-brand"
                                  : "pill-btn-outline bg-[var(--surface-card)]"
                              }`}
                            >
                              <span>v{ver.versionNumber}</span>
                            </button>
                          ))}
                        </div>
                        {activeVersion && (
                          <p className="text-xs text-[var(--ink-secondary)]">
                            {activeVersion.releaseNotes} ({activeVersion.createdAt.slice(0, 10)})
                          </p>
                        )}
                      </div>

                      {/* Approval Record Badge */}
                      {del.approvals.length > 0 && (
                        <div className="rounded-2xl border border-[var(--border-hairline)] px-4 py-3 text-xs text-[var(--ink-secondary)]">
                          <strong className="text-[var(--ink-primary)]">
                            Sign-Off Record:
                          </strong>{" "}
                          {del.approvals[0]?.reviewerName}{" "}
                          {del.approvals[0]?.decision === "approved"
                            ? "formally approved"
                            : "requested changes on"}{" "}
                          v{del.approvals[0]?.versionNumber} on{" "}
                          {del.approvals[0]?.decidedAt.slice(0, 10)}
                          {del.approvals[0]?.feedbackNote
                            ? ` — "${del.approvals[0].feedbackNote}"`
                            : ""}
                        </div>
                      )}

                      {/* Contextual Comment Thread */}
                      <div className="border-t border-[var(--border-hairline)] pt-4 space-y-3">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-secondary)]">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Discussion ({del.comments.length})</span>
                        </p>

                        {del.comments.length > 0 && (
                          <ul className="space-y-2">
                            {del.comments.map((cmt) => (
                              <li
                                key={cmt.id}
                                className="rounded-2xl bg-[var(--surface-panel)] px-4 py-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold">
                                    {cmt.authorName}{" "}
                                    <span className="font-normal text-[var(--ink-muted)]">
                                      ({cmt.authorRole === "freelancer" ? "Studio" : "Client"})
                                    </span>
                                  </span>
                                  <span className="text-[11px] text-[var(--ink-muted)]">
                                    {cmt.createdAt.slice(0, 10)}
                                  </span>
                                </div>
                                <p className="mt-1 leading-relaxed text-[var(--ink-secondary)]">
                                  {cmt.body}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}

                        <form
                          onSubmit={(e) => handlePostComment(e, del.id)}
                          className="flex flex-col gap-2 sm:flex-row"
                        >
                          <input
                            type="text"
                            value={commentDrafts[del.id] ?? ""}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [del.id]: e.target.value,
                              }))
                            }
                            placeholder="Leave a note or question on this deliverable..."
                            className="field-input flex-1 rounded-full py-2.5 text-xs"
                          />
                          <button
                            type="submit"
                            disabled={commentPostingId === del.id}
                            className="pill-btn pill-btn-outline px-4 py-2.5 text-xs"
                          >
                            {commentPostingId === del.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            <span>Post Note</span>
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: MILESTONES */}
        {activeTab === "milestones" && (
          <section className="space-y-4">
            {bundle.milestones.map((ms, idx) => (
              <div
                key={ms.id}
                className="surface-card flex flex-col justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
                    style={
                      ms.status === "approved"
                        ? {
                            backgroundColor: "var(--brand-accent)",
                            color: "var(--brand-accent-fg)",
                          }
                        : {
                            backgroundColor: "var(--surface-panel)",
                            color: "var(--ink-primary)",
                          }
                    }
                  >
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-editorial text-2xl font-semibold">{ms.title}</h3>
                    <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                      {ms.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--ink-muted)]">
                      <span className="tabular-nums">{ms.weightPct}% of total scope</span>
                      {ms.dueDate && <span>Target: {ms.dueDate}</span>}
                    </div>
                  </div>
                </div>
                <StatusPill status={ms.status} />
              </div>
            ))}
          </section>
        )}

        {/* TAB 3: INVOICES */}
        {activeTab === "invoices" && (
          <section className="space-y-4">
            {bundle.invoices.length === 0 ? (
              <div className="surface-card rounded-3xl p-10 text-center text-sm text-[var(--ink-muted)]">
                No invoices have been issued for this project yet.
              </div>
            ) : (
              bundle.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="surface-card flex flex-col justify-between gap-5 rounded-3xl p-6 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusPill status={inv.status} />
                      <span className="font-mono text-xs text-[var(--ink-muted)]">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl font-semibold">{inv.title}</h3>
                    <p className="text-xs text-[var(--ink-secondary)]">
                      Issued {inv.issueDate} - Due {inv.dueDate}
                      {inv.paidAt ? ` - Paid ${inv.paidAt.slice(0, 10)}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl font-semibold tabular-nums">
                      {formatCurrencyCents(inv.totalCents, inv.currency)}
                    </span>
                    {inv.stripeHostedUrl && inv.status !== "paid" && (
                      <a
                        href={inv.stripeHostedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="pill-btn pill-btn-brand px-4 py-2.5 text-xs"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay Online</span>
                      </a>
                    )}
                    <a
                      href={`/api/invoices/${inv.id}/pdf`}
                      className="pill-btn pill-btn-outline px-4 py-2.5 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 4: ACTIVITY */}
        {activeTab === "activity" && (
          <section className="surface-card rounded-3xl p-6">
            <ul className="divide-y divide-[var(--border-hairline)]">
              {bundle.activities.map((ev) => (
                <li key={ev.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{ev.actorName}</span> {ev.message}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[var(--ink-muted)]">
                      {ev.actorRole} update
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--ink-muted)]">
                    {ev.createdAt.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Formal Sign-Off / Revision Request Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
          <div className="surface-card w-full max-w-lg rounded-[2rem] p-7 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {reviewModal.decision === "approved"
                    ? "Formal Client Sign-Off"
                    : "Revision Request"}
                </p>
                <h2 className="mt-1 font-editorial text-3xl font-semibold">
                  {reviewModal.deliverable.title} (v{reviewModal.versionNumber})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="pill-btn pill-btn-outline h-9 w-9 p-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDecision} className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                  {reviewModal.decision === "approved"
                    ? "Approval Note (Optional)"
                    : "Describe Requested Revisions"}
                </label>
                <textarea
                  rows={3}
                  required={reviewModal.decision === "changes_requested"}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={
                    reviewModal.decision === "approved"
                      ? "Looks ready for the next phase."
                      : "Please specify what needs to be adjusted for the next version..."
                  }
                  className="field-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="pill-btn pill-btn-outline px-5 py-2.5 text-xs"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="pill-btn pill-btn-brand px-6 py-2.5 text-xs"
                >
                  {submittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : reviewModal.decision === "approved" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {reviewModal.decision === "approved"
                      ? "Confirm Approval"
                      : "Send Revision Notes"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
