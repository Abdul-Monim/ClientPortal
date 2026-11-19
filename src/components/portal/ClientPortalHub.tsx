"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  Figma,
  FileText,
  Film,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { calculateProjectProgressPct, countCompletedMilestones } from "@/domain/milestones";
import { formatCurrencyCents } from "@/domain/money";
import type { Deliverable, DeliverableStatus, Invoice, MilestoneStatus, ProjectBundle } from "@/domain/types";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusPill } from "@/components/ui/StatusPill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export type PortalTab =
  | "overview"
  | "milestones"
  | "deliverables"
  | "approvals"
  | "invoices"
  | "discussion"
  | "studio";

function KindIcon({ kind, className = "h-4 w-4" }: { kind: Deliverable["kind"]; className?: string }) {
  switch (kind) {
    case "figma":
      return <Figma className={className} />;
    case "loom":
    case "video":
      return <Film className={className} />;
    case "staging_url":
      return <Globe className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "link":
      return <LinkIcon className={className} />;
    default:
      return <FileText className={className} />;
  }
}

function kindBadgeMeta(kind: Deliverable["kind"]) {
  switch (kind) {
    case "figma":
      return { label: "Figma Prototype", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
    case "staging_url":
      return { label: "Staging Preview", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" };
    case "loom":
    case "video":
      return { label: "Loom Walkthrough", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    case "image":
      return { label: "Graphic Asset", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    case "link":
      return { label: "Source Repo", bg: "bg-neutral-800 text-white dark:bg-neutral-700 border-neutral-700" };
    default:
      return { label: "Specification PDF", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  }
}

export function ClientPortalHub({
  bundle,
  isOwnerPreview = false,
}: {
  bundle: ProjectBundle;
  isOwnerPreview?: boolean;
}) {
  const router = useRouter();

  // Navigation & Layout states
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDeliverableStatus, setFilterDeliverableStatus] = useState<"all" | DeliverableStatus>("all");
  const [filterDeliverableKind, setFilterDeliverableKind] = useState<"all" | Deliverable["kind"]>("all");
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

  // Comment composer state
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentPostingId, setCommentPostingId] = useState<string | null>(null);
  const [generalDiscussionDraft, setGeneralDiscussionDraft] = useState("");
  const [generalDiscussionPosting, setGeneralDiscussionPosting] = useState(false);

  // Payment Settlement Modal state
  const [paymentModal, setPaymentModal] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState(false);

  // Asset Lightbox / Inline Preview state
  const [previewDeliverable, setPreviewDeliverable] = useState<{
    title: string;
    kind: Deliverable["kind"];
    url: string;
    notes?: string;
    versionNumber: number;
  } | null>(null);

  // Financial & Progress metrics
  const progressPct = calculateProjectProgressPct(bundle.milestones);
  const milestoneCount = countCompletedMilestones(bundle.milestones);
  const pendingReviewCount = bundle.deliverables.filter((d) => d.status === "in_review").length;
  const approvedDeliverablesCount = bundle.deliverables.filter((d) => d.status === "approved").length;
  const openInvoicesCount = bundle.invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;

  const totalInvoicedCents = bundle.invoices.reduce((s, i) => s + i.totalCents, 0);
  const totalPaidCents = bundle.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalCents, 0);
  const balanceOwedCents = totalInvoicedCents - totalPaidCents;

  // Filtered deliverables
  const filteredDeliverables = useMemo(() => {
    return bundle.deliverables.filter((d) => {
      const matchesStatus = filterDeliverableStatus === "all" || d.status === filterDeliverableStatus;
      const matchesKind = filterDeliverableKind === "all" || d.kind === filterDeliverableKind;
      const matchesSearch =
        searchQuery.trim() === "" ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesKind && matchesSearch;
    });
  }, [bundle.deliverables, filterDeliverableStatus, filterDeliverableKind, searchQuery]);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return bundle.milestones.filter((m) => {
      if (searchQuery.trim() === "") return true;
      return (
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [bundle.milestones, searchQuery]);

  // Navigation Items
  const navItems = [
    {
      id: "overview" as PortalTab,
      label: "Overview",
      sublabel: "Health & KPIs",
      Icon: LayoutDashboard,
      badge: `${progressPct}%`,
      badgeColor: "bg-blue-500/10 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      id: "milestones" as PortalTab,
      label: "Milestones",
      sublabel: "Kanban Pipeline",
      Icon: Sparkles,
      badge: `${bundle.milestones.length}`,
      badgeColor: "bg-neutral-800 text-neutral-300 dark:bg-neutral-800 dark:text-neutral-300",
    },
    {
      id: "deliverables" as PortalTab,
      label: "Deliverables",
      sublabel: "Assets & Versions",
      Icon: FolderKanban,
      badge: `${bundle.deliverables.length}`,
      badgeColor: "bg-neutral-800 text-neutral-300 dark:bg-neutral-800 dark:text-neutral-300",
    },
    {
      id: "approvals" as PortalTab,
      label: "Approvals",
      sublabel: "Sign-Off Queue",
      Icon: CheckCircle2,
      badge: pendingReviewCount > 0 ? `${pendingReviewCount} Action` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-500 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-500/40",
    },
    {
      id: "invoices" as PortalTab,
      label: "Invoices",
      sublabel: "Billing & Ledger",
      Icon: Receipt,
      badge: openInvoicesCount > 0 ? `${openInvoicesCount} Open` : `${bundle.invoices.length}`,
      badgeColor: openInvoicesCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-neutral-800 text-neutral-300",
    },
    {
      id: "discussion" as PortalTab,
      label: "Discussion",
      sublabel: "Feedback Stream",
      Icon: MessageSquare,
      badge: undefined,
      badgeColor: "",
    },
    {
      id: "studio" as PortalTab,
      label: "Studio Details",
      sublabel: "SLA & Security",
      Icon: Building2,
      badge: undefined,
      badgeColor: "",
    },
  ];

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
      const res = await fetch(`/api/portal/deliverables/${reviewModal.deliverable.id}/decision`, {
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
      });
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
            : `Revision request submitted for "${reviewModal.deliverable.title}".`,
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

  async function handlePostGeneralDiscussion(e: React.FormEvent) {
    e.preventDefault();
    const body = generalDiscussionDraft.trim();
    if (!body) return;

    // Pick first deliverable or fallback deliverable for discussion anchor
    const anchorDeliverable = bundle.deliverables[0];
    if (!anchorDeliverable) return;

    setGeneralDiscussionPosting(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/portal/deliverables/${anchorDeliverable.id}/comments`, {
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
        setBanner({ ok: false, text: data.error ?? "Could not submit message." });
        return;
      }
      setGeneralDiscussionDraft("");
      setBanner({ ok: true, text: "Message posted to project stream." });
      router.refresh();
    } catch {
      setBanner({ ok: false, text: "Unable to post message right now." });
    } finally {
      setGeneralDiscussionPosting(false);
    }
  }

  async function handleConfirmPayment(invoiceId: string, useStripe: boolean = false) {
    setPayingInvoice(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/portal/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: bundle.project.id,
          useStripe,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ ok: false, text: data.error || "Unable to settle invoice." });
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setBanner({ ok: true, text: data.message || "Invoice settled successfully!" });
      setPaymentModal(null);
      router.refresh();
    } catch {
      setBanner({ ok: false, text: "Payment request could not be completed." });
    } finally {
      setPayingInvoice(false);
    }
  }

  // Active deliverable awaiting review
  const firstReviewItem = bundle.deliverables.find((d) => d.status === "in_review");

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-neutral-900 dark:bg-[#070A0F] dark:text-neutral-100 flex transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. DESKTOP COLLAPSIBLE LEFT NAVIGATION SIDEBAR                            */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 sticky top-3 h-[calc(100vh-1.5rem)] ml-3 my-3 rounded-[2rem] bg-[#0A0E17] text-neutral-300 p-4 shadow-2xl border border-neutral-800/80 transition-all duration-300 ease-in-out z-30 ${
          sidebarCollapsed ? "w-20 items-center" : "w-64"
        }`}
      >
        <div className="space-y-5 w-full">
          {/* Top Brand Identity & Collapse Toggle */}
          <div className={`flex items-center ${sidebarCollapsed ? "flex-col gap-3 justify-center" : "justify-between"} px-1`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <BrandAvatar studioName={bundle.studio.studioName} logoUrl={bundle.studio.logoUrl} size="sm" />
              {!sidebarCollapsed && (
                <div className="leading-tight truncate">
                  <span className="block font-editorial text-lg font-bold tracking-tight text-white truncate">
                    {bundle.studio.studioName}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium truncate">
                    {bundle.project.clientCompany}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition ring-1 ring-neutral-800"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Project Quick Status Capsule (Expanded View) */}
          {!sidebarCollapsed && (
            <div className="rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-neutral-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400 font-medium">Project Hub</span>
                <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-800/60">
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">{bundle.project.title}</p>
              {bundle.project.targetLaunchDate && (
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <Clock className="h-3 w-3 text-sky-400" />
                  <span>Due: {bundle.project.targetLaunchDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-1">
            {navItems.map(({ id, label, sublabel, Icon, badge, badgeColor }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  title={sidebarCollapsed ? label : undefined}
                  className={`group flex items-center ${
                    sidebarCollapsed ? "justify-center px-0 py-2.5 w-12 mx-auto" : "justify-between px-3.5 py-2.5 w-full"
                  } rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-neutral-800 text-white shadow-xs ring-1 ring-white/10"
                      : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                        active
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "bg-neutral-800/60 text-neutral-400 group-hover:text-white group-hover:bg-neutral-700/60"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left">
                        <span className="block font-medium">{label}</span>
                        <span className="block text-[10px] text-neutral-400 opacity-80">{sublabel}</span>
                      </div>
                    )}
                  </div>

                  {!sidebarCollapsed && badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>{badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Client Identity & Session Security */}
        <div className={`space-y-3 pt-4 border-t border-neutral-800/80 w-full ${sidebarCollapsed ? "flex flex-col items-center" : ""}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between rounded-2xl bg-neutral-900/60 p-2.5 ring-1 ring-neutral-800/60">
              <div className="flex items-center gap-2.5 truncate">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-xs text-white">
                  {bundle.project.clientName.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{bundle.project.clientName}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{bundle.project.clientEmail}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ThemeToggle />
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center w-10 h-10 p-0" : "justify-center gap-2 w-full py-2"
            } rounded-full bg-neutral-800/80 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition ring-1 ring-neutral-700/60`}
            title="Lock Portal"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!sidebarCollapsed && <span>Lock Portal</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE HEADER & SLIDE-OVER DRAWER                                      */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0E17] text-white px-4 py-3 border-b border-neutral-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <BrandAvatar studioName={bundle.studio.studioName} logoUrl={bundle.studio.logoUrl} size="sm" />
          <div className="leading-tight">
            <span className="block font-editorial text-base font-bold text-white">{bundle.studio.studioName}</span>
            <span className="block text-[10px] uppercase tracking-wider text-neutral-400">{bundle.project.clientCompany}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="rounded-full p-2 bg-neutral-800 text-neutral-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0A0E17] text-white p-5 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <BrandAvatar studioName={bundle.studio.studioName} logoUrl={bundle.studio.logoUrl} size="sm" />
                  <span className="font-editorial text-lg font-bold">{bundle.studio.studioName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map(({ id, label, Icon, badge, badgeColor }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setActiveTab(id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-full px-4 py-3 text-xs font-medium transition ${
                        active ? "bg-neutral-800 text-white ring-1 ring-white/10" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      {badge && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>{badge}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="text-xs text-neutral-400">
                <p className="font-semibold text-white">{bundle.project.clientName}</p>
                <p className="text-[10px]">{bundle.project.clientEmail}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Lock Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN PORTAL CONTENT AREA (Strictly <= 5% total side margin)            */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6 w-full max-w-[1760px] mx-auto mt-14 lg:mt-0">
        {/* Studio Owner Preview Notice */}
        {isOwnerPreview && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-blue-500/10 border border-blue-500/25 px-5 py-2.5 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-bold">Studio Owner Preview</span>
              <span className="text-blue-700/80 dark:text-blue-300/80 hidden sm:inline">
                You are previewing this client hub with full owner privileges (passcode gate bypassed).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/dashboard/projects/${bundle.project.id}`}
                className="rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition shadow-xs"
              >
                Manage in Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Top Control Bar: Breadcrumb, Search Filter, Alerts, Action Buttons */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-white dark:bg-[#0A0E17] px-5 py-2.5 shadow-sm border border-neutral-200 dark:border-neutral-800">
          {/* Breadcrumb & Section indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-900 dark:text-white">{bundle.studio.studioName}</span>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-[140px] sm:max-w-[220px]">
              {bundle.project.title}
            </span>
            <span className="text-neutral-400">/</span>
            <span className="rounded-full bg-blue-500/10 dark:bg-blue-900/30 px-2.5 py-0.5 font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
              {activeTab}
            </span>
          </div>

          {/* Search, Review Alert Pill & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Input Capsule */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter deliverables or milestones..."
                className="w-48 sm:w-64 rounded-full bg-neutral-100 dark:bg-neutral-800/80 pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 border border-transparent dark:border-neutral-700/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Review Alert Pill: Prompt action if items require client review */}
            {pendingReviewCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("approvals")}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition shadow-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>{pendingReviewCount} Action Required</span>
              </button>
            )}

            {/* Target Delivery Date Badge */}
            {bundle.project.targetLaunchDate && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>Launch: {bundle.project.targetLaunchDate}</span>
              </span>
            )}

            {/* Direct Studio Contact Pill */}
            <a
              href={`mailto:${bundle.studio.contactEmail}`}
              className="hidden lg:inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <span>Contact</span>
            </a>
          </div>
        </header>

        {/* Global Toast Banner */}
        {banner && (
          <div
            className={`rounded-2xl border px-5 py-3.5 text-xs font-medium flex items-center justify-between shadow-xs ${
              banner.ok
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            <span>{banner.text}</span>
            <button type="button" onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 1: OVERVIEW & KPIS                                                 */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hero Executive Band with Progress Ring */}
            <section className="flex flex-col justify-between gap-8 rounded-[2.5rem] border border-neutral-200/80 bg-white p-7 sm:p-9 shadow-xl lg:flex-row lg:items-center dark:border-neutral-800 dark:bg-[#0E131F]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusPill status={bundle.project.status} />
                  <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-0.5 text-xs font-bold">
                    {bundle.studio.studioName} Private Client Portal
                  </span>
                </div>

                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {bundle.project.title}
                </h1>
                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {bundle.project.summary || bundle.studio.welcomeMessage}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  <span>
                    <strong className="text-neutral-900 dark:text-white">
                      {milestoneCount.completed}/{milestoneCount.total}
                    </strong>{" "}
                    milestones completed
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-neutral-900 dark:text-white">{approvedDeliverablesCount}</strong> signed off
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-neutral-900 dark:text-white">{pendingReviewCount}</strong> awaiting review
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center p-3 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 ring-1 ring-neutral-200/60 dark:ring-neutral-800">
                <ProgressRing percentage={progressPct} size={130} strokeWidth={9} />
              </div>
            </section>

            {/* 4 Hosty Pastel Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs dark:bg-[#162738] dark:text-[#BAE6FD] border border-blue-200/40 dark:border-blue-800/40">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Progress Velocity</div>
                <div className="mt-2 text-3xl font-bold">{progressPct}%</div>
                <div className="mt-1 text-xs opacity-80">{milestoneCount.completed} of {milestoneCount.total} milestones locked</div>
              </div>

              <div className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs dark:bg-[#1A3320] dark:text-[#BBF7D0] border border-emerald-200/40 dark:border-emerald-800/40">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Approved Assets</div>
                <div className="mt-2 text-3xl font-bold">{approvedDeliverablesCount}</div>
                <div className="mt-1 text-xs opacity-80">Full client sign-off confirmed</div>
              </div>

              <div className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-xs dark:bg-[#3D2516] dark:text-[#FED7AA] border border-amber-200/40 dark:border-amber-800/40">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Review Queue</div>
                <div className="mt-2 text-3xl font-bold">{pendingReviewCount}</div>
                <div className="mt-1 text-xs opacity-80">
                  {pendingReviewCount > 0 ? "Awaiting your feedback" : "All assets approved"}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-900 p-5 text-neutral-100 shadow-xs dark:bg-[#111726] dark:text-neutral-100 border border-neutral-800 ring-1 ring-white/10">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Settled</div>
                <div className="mt-2 text-3xl font-bold text-white">{formatCurrencyCents(totalPaidCents)}</div>
                <div className="mt-1 text-xs text-neutral-400">
                  {balanceOwedCents > 0 ? `${formatCurrencyCents(balanceOwedCents)} outstanding` : "Fully settled"}
                </div>
              </div>
            </section>

            {/* Active Action Required Callout Banner */}
            {firstReviewItem && (
              <section className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                      !
                    </span>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Deliverable Ready for Client Sign-Off: {firstReviewItem.title}
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 max-w-2xl">
                    {bundle.studio.studioName} submitted v{firstReviewItem.currentVersion} for formal review. Please inspect the asset and approve or request revisions.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const v = firstReviewItem.versions[firstReviewItem.versions.length - 1];
                      if (!v) return;
                      setReviewModal({
                        deliverable: firstReviewItem,
                        versionId: v.id,
                        versionNumber: v.versionNumber,
                        decision: "approved",
                      });
                    }}
                    className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("approvals")}
                    className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                  >
                    <span>View All Approvals</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </section>
            )}

            {/* Two-Column Grid: Milestone Progress Pipeline + Deliverable Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Milestone Roadmap Card */}
              <div className="rounded-[2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Milestone Roadmap</h3>
                    <p className="text-xs text-neutral-500">Key phases and delivery status</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("milestones")}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full Pipeline</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {bundle.milestones.map((m, idx) => {
                    const isApproved = m.status === "approved";
                    const isReview = m.status === "in_review";
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                          isApproved
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : isReview
                            ? "border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/20"
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              isApproved
                                ? "bg-emerald-500 text-white"
                                : isReview
                                ? "bg-amber-500 text-white"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {isApproved ? "[x]" : idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">{m.title}</p>
                            <p className="text-[11px] text-neutral-500">Due: {m.dueDate}</p>
                          </div>
                        </div>
                        <StatusPill status={m.status} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Deliverables Asset Vault Shortcuts */}
              <div className="rounded-[2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Active Deliverables Vault</h3>
                    <p className="text-xs text-neutral-500">Prototypes, builds, and assets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("deliverables")}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>All Deliverables</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {bundle.deliverables.slice(0, 4).map((d) => {
                    const latest = d.versions[d.versions.length - 1];
                    const meta = kindBadgeMeta(d.kind);
                    return (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${meta.bg}`}>
                            <KindIcon kind={d.kind} className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">{d.title}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">Version v{d.currentVersion}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusPill status={d.status} />
                          {latest?.externalUrl && (
                            <a
                              href={latest.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full p-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
                              title="Launch Link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity Audit Feed */}
            <div className="rounded-[2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Project Updates</h3>
              <div className="space-y-3">
                {bundle.activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-neutral-900 dark:text-neutral-200 font-medium">{act.message}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {act.actorName} ({act.actorRole}) • {new Date(act.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: MILESTONES PIPELINE (KANBAN & ROADMAP)                         */}
        {/* ========================================================================= */}
        {activeTab === "milestones" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Milestone Pipeline</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Phased delivery stages, budget allocation, and sign-off criteria.
                </p>
              </div>
              <div className="text-xs font-mono text-neutral-500">
                {milestoneCount.completed} of {milestoneCount.total} Phases Completed
              </div>
            </div>

            {/* Kanban Columns (Planned, In Progress, In Review, Approved) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {(
                [
                  { status: "planned" as MilestoneStatus, label: "Upcoming / Planned", color: "border-neutral-300 dark:border-neutral-800", count: bundle.milestones.filter((m) => m.status === "planned").length },
                  { status: "in_progress" as MilestoneStatus, label: "In Active Build", color: "border-blue-500/40", count: bundle.milestones.filter((m) => m.status === "in_progress").length },
                  { status: "in_review" as MilestoneStatus, label: "Under Client Review", color: "border-amber-500/40", count: bundle.milestones.filter((m) => m.status === "in_review").length },
                  { status: "approved" as MilestoneStatus, label: "Completed & Approved", color: "border-emerald-500/40", count: bundle.milestones.filter((m) => m.status === "approved").length },
                ] as const
              ).map((col) => {
                const colItems = filteredMilestones.filter((m) => m.status === col.status);
                return (
                  <div key={col.status} className="flex flex-col rounded-[2rem] bg-white dark:bg-[#0E131F] p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{col.label}</span>
                      <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                        {colItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {colItems.map((m) => {
                        const linkedDeliverables = bundle.deliverables.filter((d) => d.milestoneId === m.id);
                        return (
                          <div
                            key={m.id}
                            className={`rounded-2xl p-4 border transition ${col.color} bg-neutral-50 dark:bg-[#111726] space-y-3 shadow-xs`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-neutral-400">Order #{m.sortOrder}</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{m.weightPct}% Weight</span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">{m.title}</h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                {m.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                              <span>Due: {m.dueDate}</span>
                              <span>{linkedDeliverables.length} Deliverable(s)</span>
                            </div>

                            {col.status === "in_review" && (
                              <button
                                type="button"
                                onClick={() => setActiveTab("approvals")}
                                className="w-full pill-btn pill-btn-brand py-2 text-xs"
                              >
                                <span>Inspect Review Queue</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {colItems.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center text-xs text-neutral-400">
                          No milestones in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: DELIVERABLES & ASSET VAULT                                      */}
        {/* ========================================================================= */}
        {activeTab === "deliverables" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Deliverables Vault</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Inspect Figma prototypes, live builds, videos, and specifications.
                </p>
              </div>

              {/* Status and Kind filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "All Assets" },
                      { id: "in_review", label: "In Review" },
                      { id: "approved", label: "Approved" },
                      { id: "changes_requested", label: "Changes" },
                    ] as const
                  ).map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setFilterDeliverableStatus(chip.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        filterDeliverableStatus === chip.id
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                  {(
                    [
                      { id: "all", label: "All Types" },
                      { id: "figma", label: "Figma" },
                      { id: "staging_url", label: "Staging" },
                      { id: "loom", label: "Loom" },
                      { id: "pdf", label: "Documents" },
                    ] as const
                  ).map((kindChip) => (
                    <button
                      key={kindChip.id}
                      type="button"
                      onClick={() => setFilterDeliverableKind(kindChip.id)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        filterDeliverableKind === kindChip.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      {kindChip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deliverables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDeliverables.map((del) => {
                const latest = del.versions[del.versions.length - 1];
                const selectedVerId = selectedVersions[del.id] ?? latest?.id;
                const activeVersion = del.versions.find((v) => v.id === selectedVerId) ?? latest;
                const meta = kindBadgeMeta(del.kind);

                return (
                  <div
                    key={del.id}
                    className="rounded-[2.2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Asset Type badge & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${meta.bg}`}>
                          <KindIcon kind={del.kind} className="h-3.5 w-3.5" />
                          <span>{meta.label}</span>
                        </span>
                        <StatusPill status={del.status} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{del.title}</h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{del.summary}</p>
                      </div>

                      {/* Version Selector & Release Notes */}
                      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 p-3.5 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Version History:</span>
                          <div className="flex items-center gap-1">
                            {del.versions.map((ver) => (
                              <button
                                key={ver.id}
                                type="button"
                                onClick={() => setSelectedVersions((p) => ({ ...p, [del.id]: ver.id }))}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                                  ver.id === activeVersion?.id
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                }`}
                              >
                                v{ver.versionNumber}
                              </button>
                            ))}
                          </div>
                        </div>

                        {activeVersion && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">
                              Release Notes (v{activeVersion.versionNumber}):
                            </p>
                            <p className="text-[11px] italic">{activeVersion.releaseNotes || "Initial iteration."}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row: Launch External, Approve, or Comment */}
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {(activeVersion?.assetUrl || activeVersion?.externalUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetUrl = activeVersion.assetUrl || activeVersion.externalUrl || "";
                                setPreviewDeliverable({
                                  title: del.title,
                                  kind: del.kind,
                                  url: targetUrl,
                                  notes: activeVersion.releaseNotes,
                                  versionNumber: activeVersion.versionNumber,
                                });
                              }}
                              className="pill-btn pill-btn-outline px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Inspect Asset</span>
                            </button>
                          )}
                          {activeVersion?.externalUrl && (
                            <a
                              href={activeVersion.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="pill-btn pill-btn-outline px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>Open External</span>
                            </a>
                          )}
                        </div>

                        {del.status === "in_review" && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!activeVersion) return;
                                setReviewModal({
                                  deliverable: del,
                                  versionId: activeVersion.id,
                                  versionNumber: activeVersion.versionNumber,
                                  decision: "approved",
                                });
                              }}
                              className="pill-btn pill-btn-brand px-3.5 py-2 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!activeVersion) return;
                                setReviewModal({
                                  deliverable: del,
                                  versionId: activeVersion.id,
                                  versionNumber: activeVersion.versionNumber,
                                  decision: "changes_requested",
                                });
                              }}
                              className="rounded-full border border-rose-500/30 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                            >
                              <span>Request Changes</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comment Composer per Deliverable */}
                      <form onSubmit={(e) => handlePostComment(e, del.id)} className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={commentDrafts[del.id] ?? ""}
                          onChange={(e) => setCommentDrafts((p) => ({ ...p, [del.id]: e.target.value }))}
                          placeholder="Leave feedback note on this deliverable..."
                          className="flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-4 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden ring-1 ring-neutral-200 dark:ring-neutral-700/60"
                        />
                        <button
                          type="submit"
                          disabled={commentPostingId === del.id || !(commentDrafts[del.id] ?? "").trim()}
                          className="pill-btn pill-btn-brand p-2 text-xs disabled:opacity-50"
                        >
                          {commentPostingId === del.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </form>

                      {/* Existing Comments List */}
                      {del.comments.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Discussion ({del.comments.length})
                          </p>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {del.comments.map((cmt) => (
                              <div
                                key={cmt.id}
                                className={`rounded-xl p-2.5 text-xs ${
                                  cmt.authorRole === "client"
                                    ? "bg-blue-500/10 text-neutral-800 dark:text-neutral-200"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                                  <span className="font-bold">{cmt.authorName} ({cmt.authorRole})</span>
                                  <span>{new Date(cmt.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p>{cmt.body}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: FORMAL APPROVALS & DECISIONS QUEUE                              */}
        {/* ========================================================================= */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Client Sign-Off Queue</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Official review actions and signed approval records with tamper-evident audit history.
              </p>
            </div>

            {/* Items requiring review */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Pending Your Review ({pendingReviewCount})
              </h3>

              {pendingReviewCount === 0 ? (
                <div className="rounded-[2rem] bg-white dark:bg-[#0E131F] p-8 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">All Deliverables Are Signed Off</p>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    You have reviewed all assets submitted by {bundle.studio.studioName}. Any upcoming milestone phases will appear here when ready.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {bundle.deliverables
                    .filter((d) => d.status === "in_review")
                    .map((d) => {
                      const latest = d.versions[d.versions.length - 1];
                      return (
                        <div
                          key={d.id}
                          className="rounded-[2rem] bg-white dark:bg-[#0E131F] p-6 border border-amber-500/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-0.5 text-xs font-bold">
                                Version v{d.currentVersion} Ready
                              </span>
                              <span className="text-xs text-neutral-400 font-mono">
                                Milestone: {bundle.milestones.find((m) => m.id === d.milestoneId)?.title ?? "General"}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{d.title}</h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl">{d.summary}</p>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {latest?.externalUrl && (
                              <a
                                href={latest.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Preview</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!latest) return;
                                setReviewModal({
                                  deliverable: d,
                                  versionId: latest.id,
                                  versionNumber: latest.versionNumber,
                                  decision: "approved",
                                });
                              }}
                              className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!latest) return;
                                setReviewModal({
                                  deliverable: d,
                                  versionId: latest.id,
                                  versionNumber: latest.versionNumber,
                                  decision: "changes_requested",
                                });
                              }}
                              className="rounded-full border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                            >
                              <span>Request Changes</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Historical Signed Off Records */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Approved Records ({approvedDeliverablesCount})
              </h3>
              <div className="space-y-3">
                {bundle.deliverables
                  .filter((d) => d.status === "approved")
                  .map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl bg-white dark:bg-[#0E131F] p-4 border border-emerald-500/20 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{d.title}</p>
                          <p className="text-[11px] text-neutral-500 font-mono">
                            Approved by {bundle.project.clientName} • Signed at v{d.currentVersion}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
                        Signed Off
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: INVOICES & BILLING LEDGER                                       */}
        {/* ========================================================================= */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Invoices & Financial Ledger</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Itemized project invoices, settlement receipts, and downloadable PDF statements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                  Settled: {formatCurrencyCents(totalPaidCents)} / {formatCurrencyCents(totalInvoicedCents)}
                </span>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="rounded-[2.2rem] bg-white dark:bg-[#0E131F] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Phase / Description</th>
                      <th className="px-6 py-4">Issued</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {bundle.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white max-w-xs truncate">
                          {inv.title}
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{inv.issueDate}</td>
                        <td className="px-6 py-4 text-neutral-500">{inv.dueDate}</td>
                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white font-mono">
                          {formatCurrencyCents(inv.totalCents)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={inv.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={`/api/invoices/${inv.id}/pdf`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                            >
                              <Download className="h-3 w-3" />
                              <span>PDF</span>
                            </a>
                            {inv.status !== "paid" && (
                              <button
                                type="button"
                                onClick={() => setPaymentModal(inv)}
                                className="pill-btn pill-btn-brand px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>Pay Now</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: DISCUSSION & COLLABORATION STREAM                               */}
        {/* ========================================================================= */}
        {activeTab === "discussion" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Project Discussion & Feedback</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Direct channel with {bundle.studio.studioName}. Post revision notes, clarifications, or timeline questions.
              </p>
            </div>

            <div className="rounded-[2.2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              {/* Message Composer */}
              <form onSubmit={handlePostGeneralDiscussion} className="space-y-3">
                <label className="text-xs font-bold text-neutral-900 dark:text-white">
                  Message {bundle.studio.studioName}
                </label>
                <textarea
                  rows={3}
                  value={generalDiscussionDraft}
                  onChange={(e) => setGeneralDiscussionDraft(e.target.value)}
                  placeholder="Share feedback, ask milestone questions, or request refinements..."
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden ring-1 ring-neutral-200 dark:ring-neutral-700"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={generalDiscussionPosting || !generalDiscussionDraft.trim()}
                    className="pill-btn pill-btn-brand px-5 py-2 text-xs disabled:opacity-50"
                  >
                    {generalDiscussionPosting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Aggregated Project Comments Thread */}
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Communication History</h3>
                {bundle.deliverables.flatMap((d) => d.comments).length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No messages in project stream yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bundle.deliverables
                      .flatMap((d) => d.comments)
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map((cmt) => (
                        <div
                          key={cmt.id}
                          className={`rounded-2xl p-4 text-xs space-y-1.5 ${
                            cmt.authorRole === "client"
                              ? "bg-blue-500/10 border border-blue-500/20 text-neutral-900 dark:text-neutral-100"
                              : "bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="font-bold">{cmt.authorName} ({cmt.authorRole})</span>
                            <span className="font-mono">{new Date(cmt.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="leading-relaxed">{cmt.body}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 7: STUDIO & SECURITY DETAILS                                       */}
        {/* ========================================================================= */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Studio Profile & Security</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Official studio contacts, service commitments, and cryptographic access status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Studio Info Card */}
              <div className="rounded-[2.2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <BrandAvatar studioName={bundle.studio.studioName} logoUrl={bundle.studio.logoUrl} size="md" />
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{bundle.studio.studioName}</h3>
                    <p className="text-xs text-neutral-500">{bundle.studio.tagline}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Direct Email:</span>
                    <a href={`mailto:${bundle.studio.contactEmail}`} className="font-semibold text-blue-600 dark:text-blue-400">
                      {bundle.studio.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">Headquarters / Billing:</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 text-right">
                      {bundle.studio.billingAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-neutral-500">SLA Response Time:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Within 24 Hours</span>
                  </div>
                </div>
              </div>

              {/* Security & Access Card */}
              <div className="rounded-[2.2rem] bg-white dark:bg-[#0E131F] p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Security & Cryptographic Access</h3>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <p>
                    This private client portal is secured with scrypt-salted passwordless tokens and HMAC session authentication. No external account or public directory lookup is required.
                  </p>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono space-y-1">
                    <p>Status: Authenticated Client Session</p>
                    <p>Verified Identity: {bundle.project.clientEmail}</p>
                    <p>Passcode Version: v{bundle.project.passcodeVersion}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="pill-btn pill-btn-outline w-full py-2.5 text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Lock Portal Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. FORMAL APPROVAL & REVISION MODAL                                       */}
      {/* ========================================================================= */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-[#0E131F] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Formal Client Action</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {reviewModal.decision === "approved" ? "Approve Deliverable" : "Request Changes & Revisions"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-neutral-900 dark:text-white">{reviewModal.deliverable.title}</p>
              <p className="text-neutral-500">Version v{reviewModal.versionNumber}</p>
            </div>

            <form onSubmit={handleSubmitDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Your Name (Reviewer)
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-full bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs text-neutral-900 dark:text-white ring-1 ring-neutral-200 dark:ring-neutral-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full rounded-full bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-xs text-neutral-900 dark:text-white ring-1 ring-neutral-200 dark:ring-neutral-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {reviewModal.decision === "approved" ? "Approval Note (Optional)" : "Change Request Details (Required)"}
                </label>
                <textarea
                  rows={3}
                  required={reviewModal.decision === "changes_requested"}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={
                    reviewModal.decision === "approved"
                      ? "e.g. Looks great, approved for production."
                      : "e.g. Please adjust font contrast and update the CTA button copy..."
                  }
                  className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-3.5 text-xs text-neutral-900 dark:text-white ring-1 ring-neutral-200 dark:ring-neutral-700 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`pill-btn px-5 py-2 text-xs ${
                    reviewModal.decision === "approved" ? "pill-btn-brand" : "bg-rose-600 text-white hover:bg-rose-500"
                  }`}
                >
                  {submittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : reviewModal.decision === "approved" ? (
                    "Confirm Approval"
                  ) : (
                    "Submit Revision Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVOICE PAYMENT SETTLEMENT MODAL                                       */}
      {/* ========================================================================= */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-[#0E131F] p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Settle Invoice {paymentModal.invoiceNumber}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Prepared for {bundle.project.clientCompany}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 p-4 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Phase Title</span>
                <span className="font-semibold text-neutral-900 dark:text-white max-w-[200px] truncate">
                  {paymentModal.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Due Date</span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {paymentModal.dueDate}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Total Amount Due
                </span>
                <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                  {formatCurrencyCents(paymentModal.totalCents)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                disabled={payingInvoice}
                onClick={() => handleConfirmPayment(paymentModal.id, false)}
                className="w-full pill-btn pill-btn-brand py-3 text-xs flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
              >
                {payingInvoice ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>Instant Card Settlement ({formatCurrencyCents(paymentModal.totalCents)})</span>
              </button>

              {paymentModal.stripeHostedUrl && (
                <button
                  type="button"
                  disabled={payingInvoice}
                  onClick={() => handleConfirmPayment(paymentModal.id, true)}
                  className="w-full pill-btn pill-btn-outline py-2.5 text-xs flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Checkout on Official Stripe Portal</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-neutral-400 pt-1">
              Encrypted 256-bit SSL transaction. A PDF receipt will be available immediately.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELIVERABLE ASSET INLINE LIGHTBOX PREVIEW MODAL                        */}
      {/* ========================================================================= */}
      {previewDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <div className="w-full max-w-4xl rounded-[2.5rem] bg-white dark:bg-[#0E131F] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-3">
                <KindIcon kind={previewDeliverable.kind} className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {previewDeliverable.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Version v{previewDeliverable.versionNumber} • {previewDeliverable.kind.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewDeliverable.url && (
                  <a
                    href={previewDeliverable.url}
                    target="_blank"
                    rel="noreferrer"
                    className="pill-btn pill-btn-outline px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open in New Tab</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDeliverable(null)}
                  className="rounded-full p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                  title="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="flex-1 overflow-auto p-6 bg-neutral-100 dark:bg-black/40 flex items-center justify-center min-h-[320px]">
              {previewDeliverable.kind === "image" ? (
                <img
                  src={previewDeliverable.url}
                  alt={previewDeliverable.title}
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg ring-1 ring-white/10"
                />
              ) : previewDeliverable.url.startsWith("http") ? (
                <iframe
                  src={previewDeliverable.url}
                  title={previewDeliverable.title}
                  className="w-full h-[60vh] rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Document ready for review
                  </p>
                  <p className="text-xs text-neutral-500 font-mono">{previewDeliverable.url}</p>
                </div>
              )}
            </div>

            {/* Release notes footer */}
            {previewDeliverable.notes && (
              <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 shrink-0 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-white">Changelog Notes: </span>
                <span>{previewDeliverable.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
