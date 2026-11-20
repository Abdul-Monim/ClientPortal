"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Globe, Loader2, Lock, Palette, Save } from "lucide-react";
import { buildBrandThemeTokens } from "@/domain/theme";
import type { Studio } from "@/domain/types";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { updateStudioBrandingAction } from "@/services/studio-actions";

const PRESET_ACCENTS = [
  { label: "Botanical Pine", hex: "#2F5D50" },
  { label: "Obsidian Ink", hex: "#1F2421" },
  { label: "Editorial Terracotta", hex: "#9A4B35" },
  { label: "Deep Indigo", hex: "#2A3D66" },
  { label: "Burgundy Plum", hex: "#6B2D3C" },
  { label: "Warm Bronze", hex: "#7A5932" },
];

export function BrandingStudio({ studio }: { studio: Studio }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [studioName, setStudioName] = useState(studio.studioName);
  const [slug, setSlug] = useState(studio.slug);
  const [customDomain, setCustomDomain] = useState(studio.customDomain ?? "");
  const [tagline, setTagline] = useState(studio.tagline);
  const [logoUrl, setLogoUrl] = useState(studio.logoUrl ?? "");
  const [accentHex, setAccentHex] = useState(studio.accentHex);
  const [welcomeMessage, setWelcomeMessage] = useState(studio.welcomeMessage);
  const [contactEmail, setContactEmail] = useState(studio.contactEmail);
  const [billingAddress, setBillingAddress] = useState(studio.billingAddress);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const tokens = buildBrandThemeTokens(accentHex);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await updateStudioBrandingAction({
        studioName,
        slug,
        customDomain,
        tagline,
        logoUrl,
        accentHex,
        welcomeMessage,
        contactEmail,
        billingAddress,
      });
      setFeedback({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleSave}
        className="surface-card space-y-5 rounded-3xl p-6 lg:col-span-7"
      >
        <div>
          <p className="eyebrow">White-Label Configuration</p>
          <h2 className="mt-1 font-ui text-2xl font-bold tracking-tight">
            Studio Identity & Domain
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Studio Name
            </label>
            <input
              type="text"
              required
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Studio URL Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="field-input font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="block text-xs font-medium text-[var(--ink-secondary)]">
                Custom Domain (Optional)
              </label>
              <InfoTooltip
                title="Custom CNAME Domain"
                content="Map your own domain e.g. client.yourstudio.com so all portals are served directly under your agency brand."
              />
            </div>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="client.yourname.com"
                className="field-input has-leading-icon"
              />
            </div>
            <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
              Point a CNAME record to cname.vercel-dns.com to serve portals on your own domain.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Logo Image URL (Cloudinary or HTTPS)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Studio Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="field-input"
          />
        </div>

        {/* Brand Accent Color Picker */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-[var(--ink-secondary)]">
                Brand Accent Color
              </label>
              <InfoTooltip
                title="Brand Accent Palette"
                content="Sets primary buttons, progress rings, and PDF accents across all your client portals."
              />
            </div>
            <span className="rounded-full border border-[var(--border-hairline)] bg-[var(--surface-panel)] px-3 py-1 text-[11px] font-medium">
              Button Readability: {tokens.meetsWcagAa ? "WCAG AA Verified" : "Low Contrast"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_ACCENTS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setAccentHex(preset.hex)}
                className={`pill-btn px-3 py-1.5 text-xs ${
                  accentHex.toUpperCase() === preset.hex
                    ? "border-2 border-[var(--ink-primary)] bg-[var(--surface-panel)]"
                    : "pill-btn-outline"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={tokens.accentHex}
              onChange={(e) => setAccentHex(e.target.value.toUpperCase())}
              className="h-10 w-14 cursor-pointer rounded-full border border-[var(--border-hairline)] bg-transparent p-1"
            />
            <input
              type="text"
              value={accentHex}
              onChange={(e) => setAccentHex(e.target.value)}
              className="field-input max-w-[160px] font-mono text-xs uppercase"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
            Client Portal Welcome Message
          </label>
          <textarea
            rows={3}
            required
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="field-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Contact Email (Shown on Portals & Invoices)
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Invoice Billing Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
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
            className="pill-btn pill-btn-brand px-6 py-3 text-sm"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isPending ? "Saving..." : "Save Branding"}</span>
          </button>
        </div>
      </form>

      {/* Live Split-Screen White-Label Preview */}
      <aside className="space-y-4 lg:col-span-5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[var(--brand-accent)]" />
          <p className="eyebrow">Live Client Portal Preview</p>
        </div>

        <div
          className="surface-card rounded-[2rem] p-7 shadow-sm space-y-6"
          style={
            {
              "--brand-accent": tokens.accentHex,
              "--brand-accent-fg": tokens.accentForegroundHex,
              "--brand-accent-soft": tokens.accentSoftRgba,
              "--brand-accent-border": tokens.accentBorderRgba,
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-5">
            <div className="flex items-center gap-3">
              <BrandAvatar studioName={studioName} logoUrl={logoUrl || null} size="md" />
              <div>
                <h3 className="font-ui text-xl font-bold tracking-tight">{studioName}</h3>
                <p className="text-xs text-[var(--ink-muted)]">
                  {customDomain || `clientportal.app/p/${slug}`}
                </p>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: tokens.accentSoftRgba,
                color: tokens.accentHex,
              }}
            >
              <Lock className="h-3 w-3" />
              <span>Private Hub</span>
            </span>
          </div>

          <div className="space-y-2">
            <p className="eyebrow">Client Greeting</p>
            <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
              {welcomeMessage}
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--surface-panel)] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Sample Milestone Progress</span>
              <span className="font-semibold tabular-nums">76%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
              <div
                className="h-full w-3/4 rounded-full"
                style={{ backgroundColor: tokens.accentHex }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="pill-btn px-5 py-2.5 text-xs"
              style={{
                backgroundColor: tokens.accentHex,
                color: tokens.accentForegroundHex,
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Approve Deliverable</span>
            </span>
            <span className="pill-btn pill-btn-outline px-4 py-2.5 text-xs">
              <span>Download PDF Invoice</span>
            </span>
          </div>

          <p className="border-t border-[var(--border-hairline)] pt-4 text-[11px] text-[var(--ink-muted)]">
            Footer contact: {contactEmail}
          </p>
        </div>
      </aside>
    </div>
  );
}
