"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FilePlus2,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import { auditMilestoneWeights, calculateProjectProgressPct } from "@/domain/milestones";
import { formatCurrencyCents } from "@/domain/money";
import { inferDeliverableKindFromUrl } from "@/domain/theme";
import type { DeliverableKind, MilestoneStatus, ProjectBundle } from "@/domain/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  createDeliverableAction,
  createMilestoneAction,
  publishDeliverableVersionAction,
  rotateProjectPasscodeAction,
  updateMilestoneStatusAction,
} from "@/services/studio-actions";

const MILESTONE_STATUSES: Array<{ value: MilestoneStatus; label: string }> = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
];

export function ProjectWorkbench({
  bundle,
  portalUrl,
}: {
  bundle: ProjectBundle;
  portalUrl: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Passcode rotation state
  const [newPasscode, setNewPasscode] = useState("");
  const [passcodeHint, setPasscodeHint] = useState(bundle.project.passcodeHint ?? "");

  // New milestone state
  const [msTitle, setMsTitle] = useState("");
  const [msDesc, setMsDesc] = useState("");
  const [msWeight, setMsWeight] = useState("20");
  const [msDue, setMsDue] = useState("");

  // New deliverable state
  const [delTitle, setDelTitle] = useState("");
  const [delSummary, setDelSummary] = useState("");
  const [delKind, setDelKind] = useState<DeliverableKind>("figma");
  const [delMilestoneId, setDelMilestoneId] = useState(bundle.milestones[0]?.id ?? "");
  const [delExternalUrl, setDelExternalUrl] = useState("");
  const [delAssetUrl, setDelAssetUrl] = useState("");
  const [delAssetPublicId, setDelAssetPublicId] = useState("");
  const [delNotes, setDelNotes] = useState("Ready for your review.");
  const [uploading, setUploading] = useState(false);

  // Version publish inline state
  const [versionTargetId, setVersionTargetId] = useState<string | null>(null);
  const [versionUrl, setVersionUrl] = useState("");
  const [versionNotes, setVersionNotes] = useState("");

  const progressPct = calculateProjectProgressPct(bundle.milestones);
  const weightAudit = auditMilestoneWeights(bundle.milestones);

  async function copyPortalUrl() {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setBanner({ ok: false, text: "Copy the portal URL directly from the link pill." });
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setBanner(null);
    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: bundle.project.slug }),
      });
      const sign = await signRes.json();

      if (sign.mode === "cloudinary" && sign.cloudName && sign.signature) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sign.apiKey);
        formData.append("timestamp", String(sign.timestamp));
        formData.append("signature", sign.signature);
        formData.append("folder", sign.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
          { method: "POST", body: formData }
        );
        const uploaded = await uploadRes.json();
        if (!uploadRes.ok || !uploaded.secure_url) {
          throw new Error(uploaded.error?.message ?? "Cloudinary upload failed.");
        }
        setDelAssetUrl(uploaded.secure_url);
        setDelAssetPublicId(uploaded.public_id ?? "");
        setDelKind(inferDeliverableKindFromUrl(uploaded.secure_url));
        setBanner({ ok: true, text: `Uploaded "${file.name}" to Cloudinary.` });
      } else {
        setBanner({
          ok: true,
          text: "Cloudinary keys are not configured yet. Paste any public image, PDF, Figma, Vercel, or Loom link below to publish immediately.",
        });
      }
    } catch (error) {
      setBanner({
        ok: false,
        text: error instanceof Error ? error.message : "File upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleRotatePasscode(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await rotateProjectPasscodeAction({
        projectId: bundle.project.id,
        newPasscode,
        passcodeHint,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) {
        setNewPasscode("");
        router.refresh();
      }
    });
  }

  function handleCreateMilestone(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createMilestoneAction({
        projectId: bundle.project.id,
        title: msTitle,
        description: msDesc,
        weightPct: Number(msWeight),
        dueDate: msDue,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) {
        setMsTitle("");
        setMsDesc("");
        setMsDue("");
        router.refresh();
      }
    });
  }

  function handleMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
    startTransition(async () => {
      const res = await updateMilestoneStatusAction({
        projectId: bundle.project.id,
        milestoneId,
        status,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  function handleCreateDeliverable(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createDeliverableAction({
        projectId: bundle.project.id,
        milestoneId: delMilestoneId,
        title: delTitle,
        summary: delSummary,
        kind: delKind,
        assetUrl: delAssetUrl,
        assetPublicId: delAssetPublicId,
        externalUrl: delExternalUrl,
        releaseNotes: delNotes,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) {
        setDelTitle("");
        setDelSummary("");
        setDelExternalUrl("");
        setDelAssetUrl("");
        setDelAssetPublicId("");
        router.refresh();
      }
    });
  }

  function handlePublishVersion(e: React.FormEvent, deliverableId: string) {
    e.preventDefault();
    startTransition(async () => {
      const res = await publishDeliverableVersionAction({
        projectId: bundle.project.id,
        deliverableId,
        externalUrl: versionUrl,
        releaseNotes: versionNotes,
      });
      setBanner({ ok: res.ok, text: res.message });
      if (res.ok) {
        setVersionTargetId(null);
        setVersionUrl("");
        setVersionNotes("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Project Header Band */}
      <section className="surface-card flex flex-col justify-between gap-6 rounded-[2rem] p-7 lg:flex-row lg:items-center">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPill status={bundle.project.status} />
            <span className="text-xs text-[var(--ink-muted)]">
              {bundle.project.clientCompany} - {bundle.project.clientName}
            </span>
          </div>
          <h1 className="font-editorial text-4xl font-semibold tracking-tight">
            {bundle.project.title}
          </h1>
          <p className="max-w-2xl text-sm text-[var(--ink-secondary)]">
            {bundle.project.summary}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={copyPortalUrl}
              className="pill-btn pill-btn-outline px-4 py-2 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Portal Link Copied" : "Copy Client Portal Link"}</span>
            </button>
            <Link
              href={`/p/${bundle.studio.slug}/${bundle.project.slug}`}
              className="pill-btn pill-btn-brand px-4 py-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Live Client Hub</span>
            </Link>
          </div>
        </div>

        <ProgressRing percentage={progressPct} size={116} />
      </section>

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

      {/* Milestones + Security Grid */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Weighted Roadmap</p>
              <h2 className="mt-1 font-editorial text-3xl font-semibold">Milestones</h2>
            </div>
            <span
              className={`rounded-full border px-3.5 py-1 text-xs font-medium tabular-nums ${
                weightAudit.isBalanced
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
              }`}
            >
              Weight Allocated: {weightAudit.totalWeightPct}% / 100%
            </span>
          </div>

          <div className="space-y-3">
            {bundle.milestones.map((ms) => (
              <div
                key={ms.id}
                className="surface-card flex flex-col justify-between gap-4 rounded-3xl p-5 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--surface-panel)] px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                      {ms.weightPct}%
                    </span>
                    <h3 className="font-medium">{ms.title}</h3>
                    {ms.dueDate && (
                      <span className="text-xs text-[var(--ink-muted)]">
                        Due {ms.dueDate}
                      </span>
                    )}
                  </div>
                  {ms.description && (
                    <p className="text-xs text-[var(--ink-secondary)]">{ms.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {MILESTONE_STATUSES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleMilestoneStatus(ms.id, opt.value)}
                      className={`pill-btn px-3 py-1.5 text-[11px] ${
                        ms.status === opt.value
                          ? "pill-btn-brand"
                          : "pill-btn-outline text-[var(--ink-secondary)]"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Milestone Form */}
          <form
            onSubmit={handleCreateMilestone}
            className="surface-panel rounded-3xl p-5 space-y-3"
          >
            <p className="text-xs font-semibold">Add Milestone</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <input
                type="text"
                required
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                placeholder="Phase title"
                className="field-input sm:col-span-2"
              />
              <input
                type="number"
                required
                min={1}
                max={100}
                value={msWeight}
                onChange={(e) => setMsWeight(e.target.value)}
                placeholder="Weight %"
                className="field-input tabular-nums"
              />
              <input
                type="date"
                value={msDue}
                onChange={(e) => setMsDue(e.target.value)}
                className="field-input"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={msDesc}
                onChange={(e) => setMsDesc(e.target.value)}
                placeholder="Short scope note (optional)"
                className="field-input flex-1"
              />
              <button
                type="submit"
                disabled={isPending}
                className="pill-btn pill-btn-brand px-5 py-2.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>
          </form>
        </div>

        {/* Portal Security & Access Gate Card */}
        <aside className="space-y-4 lg:col-span-4">
          <div>
            <p className="eyebrow">Access Control</p>
            <h2 className="mt-1 font-editorial text-3xl font-semibold">Portal Password</h2>
          </div>

          <form
            onSubmit={handleRotatePasscode}
            className="surface-card rounded-3xl p-6 space-y-4"
          >
            <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
              Updating the portal password immediately signs out older client sessions so
              only people with the new password can enter.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                New Portal Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
                <input
                  type="text"
                  required
                  minLength={4}
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new password"
                  className="field-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                Optional Password Hint
              </label>
              <input
                type="text"
                value={passcodeHint}
                onChange={(e) => setPasscodeHint(e.target.value)}
                placeholder="e.g. Company name + 2026"
                className="field-input"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="pill-btn pill-btn-brand w-full py-2.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Rotate Portal Password</span>
            </button>
            <p className="text-[11px] text-[var(--ink-muted)]">
              Active password version: v{bundle.project.passcodeVersion}
            </p>
          </form>

          {/* Project Invoices Summary */}
          <div className="surface-card rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-2xl font-semibold">Project Invoices</h3>
              <Link
                href="/dashboard/invoices"
                className="pill-btn pill-btn-outline px-3 py-1 text-[11px]"
              >
                <span>New Invoice</span>
              </Link>
            </div>
            {bundle.invoices.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No invoices issued yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {bundle.invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--surface-panel)] px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-semibold">{inv.invoiceNumber}</p>
                      <p className="text-xs tabular-nums text-[var(--ink-secondary)]">
                        {formatCurrencyCents(inv.totalCents, inv.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={inv.status} />
                      <a
                        href={`/api/invoices/${inv.id}/pdf`}
                        className="pill-btn pill-btn-outline h-8 w-8 p-0"
                        title="Download Branded PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      {/* Deliverables Manager */}
      <section className="space-y-5">
        <div>
          <p className="eyebrow">Files & Design Links</p>
          <h2 className="mt-1 font-editorial text-3xl font-semibold">
            Deliverables & Version History
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Existing Deliverables */}
          <div className="space-y-4 lg:col-span-7">
            {bundle.deliverables.map((del) => {
              const latest = del.versions[del.versions.length - 1];
              const linkHref = latest?.assetUrl || latest?.externalUrl || "#";
              return (
                <article
                  key={del.id}
                  className="surface-card rounded-3xl p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={del.status} />
                        <span className="rounded-full bg-[var(--surface-panel)] px-2.5 py-0.5 text-xs font-medium">
                          v{del.currentVersion}
                        </span>
                        <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                          {del.kind.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="mt-2 font-editorial text-2xl font-semibold">
                        {del.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                        {del.summary}
                      </p>
                    </div>
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className="pill-btn pill-btn-outline px-3.5 py-2 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Latest</span>
                    </a>
                  </div>

                  {latest?.releaseNotes && (
                    <p className="rounded-2xl bg-[var(--surface-panel)] px-4 py-2.5 text-xs text-[var(--ink-secondary)]">
                      Latest note (v{latest.versionNumber}): {latest.releaseNotes}
                    </p>
                  )}

                  {del.approvals[0] && (
                    <p className="text-xs text-[var(--ink-secondary)]">
                      Last client response by{" "}
                      <span className="font-semibold">{del.approvals[0].reviewerName}</span>
                      : &ldquo;{del.approvals[0].feedbackNote || del.approvals[0].decision}&rdquo;
                    </p>
                  )}

                  {del.status !== "approved" && (
                    <div className="border-t border-[var(--border-hairline)] pt-3">
                      {versionTargetId === del.id ? (
                        <form
                          onSubmit={(e) => handlePublishVersion(e, del.id)}
                          className="space-y-3"
                        >
                          <input
                            type="url"
                            required
                            value={versionUrl}
                            onChange={(e) => setVersionUrl(e.target.value)}
                            placeholder="Updated Figma, Vercel, Loom, or asset URL"
                            className="field-input"
                          />
                          <input
                            type="text"
                            required
                            value={versionNotes}
                            onChange={(e) => setVersionNotes(e.target.value)}
                            placeholder="What changed in this revision?"
                            className="field-input"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={isPending}
                              className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                            >
                              <FilePlus2 className="h-3.5 w-3.5" />
                              <span>Publish v{del.currentVersion + 1}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setVersionTargetId(null)}
                              className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                            >
                              <span>Cancel</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setVersionTargetId(del.id)}
                          className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                        >
                          <FilePlus2 className="h-3.5 w-3.5" />
                          <span>Upload Revision (v{del.currentVersion + 1})</span>
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Publish New Deliverable Composer */}
          <form
            onSubmit={handleCreateDeliverable}
            className="surface-card h-fit rounded-3xl p-6 space-y-4 lg:col-span-5"
          >
            <div>
              <p className="eyebrow">Publish to Client Hub</p>
              <h3 className="mt-1 font-editorial text-2xl font-semibold">
                Add Deliverable or Design Link
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                Deliverable Title
              </label>
              <input
                type="text"
                required
                value={delTitle}
                onChange={(e) => setDelTitle(e.target.value)}
                placeholder="Homepage Responsive Prototype"
                className="field-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                  Type
                </label>
                <select
                  value={delKind}
                  onChange={(e) => setDelKind(e.target.value as DeliverableKind)}
                  className="field-input"
                >
                  <option value="figma">Figma Design</option>
                  <option value="staging_url">Staging Website</option>
                  <option value="loom">Loom Video</option>
                  <option value="image">Image Asset</option>
                  <option value="pdf">PDF Document</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                  Milestone
                </label>
                <select
                  value={delMilestoneId}
                  onChange={(e) => setDelMilestoneId(e.target.value)}
                  className="field-input"
                >
                  <option value="">General</option>
                  {bundle.milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                Design or Staging URL
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
                <input
                  type="url"
                  value={delExternalUrl}
                  onChange={(e) => {
                    setDelExternalUrl(e.target.value);
                    if (e.target.value) {
                      setDelKind(inferDeliverableKindFromUrl(e.target.value));
                    }
                  }}
                  placeholder="https://figma.com/design/... or https://preview.vercel.app"
                  className="field-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                Or Upload File (Cloudinary)
              </label>
              <label className="pill-btn pill-btn-outline w-full cursor-pointer py-2.5 text-xs">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>
                  {uploading
                    ? "Uploading to Cloudinary..."
                    : delAssetUrl
                      ? "File Attached (Click to Replace)"
                      : "Choose Image, PDF, or Video"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileUpload(file);
                  }}
                />
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
                Summary & Release Notes
              </label>
              <textarea
                rows={2}
                value={delSummary}
                onChange={(e) => setDelSummary(e.target.value)}
                placeholder="Context for the client before they approve."
                className="field-input"
              />
            </div>

            <input
              type="text"
              value={delNotes}
              onChange={(e) => setDelNotes(e.target.value)}
              placeholder="v1 release notes"
              className="field-input"
            />

            <button
              type="submit"
              disabled={isPending || uploading}
              className="pill-btn pill-btn-brand w-full py-3 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Deliverable</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
