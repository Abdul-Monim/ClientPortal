"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FolderPlus, KeyRound, Loader2 } from "lucide-react";
import { createProjectAction } from "@/services/studio-actions";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function CreateProjectForm({ studioSlug }: { studioSlug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [passcodeHint, setPasscodeHint] = useState("");
  const [targetLaunchDate, setTargetLaunchDate] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function handleTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) {
      setSlug(toSlug(next));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await createProjectAction({
        title,
        slug,
        summary,
        clientName,
        clientCompany,
        clientEmail,
        passcode,
        passcodeHint,
        targetLaunchDate,
      });
      setFeedback({ ok: res.ok, text: res.message });
      if (res.ok && res.data?.projectId) {
        router.push(`/dashboard/projects/${res.data.projectId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-3xl p-6 space-y-5">
      <div>
        <p className="eyebrow">New Client Portal</p>
        <h2 className="mt-1 font-ui text-2xl font-bold tracking-tight">
          Launch a dedicated project hub
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Project Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Solstice Web Redesign"
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Portal URL Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(toSlug(e.target.value));
            }}
            placeholder="solstice-web-redesign"
            className="field-input font-mono text-xs"
          />
          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
            Link: /p/{studioSlug}/{slug || "your-project"}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
          Project Summary
        </label>
        <textarea
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief overview visible to the client inside their hub."
          className="field-input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Client Contact Name
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nadia Patel"
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Company Name
          </label>
          <input
            type="text"
            required
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
            placeholder="Solstice Labs"
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Client Email
          </label>
          <input
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="nadia@solsticelabs.co"
            className="field-input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Portal Password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
            <input
              type="text"
              required
              minLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="solstice2026"
              className="field-input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Optional Hint
          </label>
          <input
            type="text"
            value={passcodeHint}
            onChange={(e) => setPasscodeHint(e.target.value)}
            placeholder="Shared in kickoff email"
            className="field-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Target Launch Date
          </label>
          <input
            type="date"
            value={targetLaunchDate}
            onChange={(e) => setTargetLaunchDate(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      {feedback && (
        <p
          className={`rounded-2xl border px-4 py-2.5 text-xs ${
            feedback.ok
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="pill-btn pill-btn-brand px-6 py-3 text-sm disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          <span>{isPending ? "Creating Portal..." : "Create Client Portal"}</span>
        </button>
      </div>
    </form>
  );
}
