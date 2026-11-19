import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  Palette,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getRuntimeMode } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const mode = getRuntimeMode();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner();
  const projects = await repo.listProjects(studio.id);
  const featuredProject = projects[0];
  const samplePortalHref = featuredProject
    ? `/p/${studio.slug}/${featuredProject.slug}`
    : "/dashboard";

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--ink-primary)]">
      {/* Floating Material You Capsule Header */}
      <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
        <div className="surface-card flex items-center justify-between rounded-full px-5 py-2.5 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full font-editorial text-base font-semibold"
              style={{
                backgroundColor: "var(--brand-accent)",
                color: "var(--brand-accent-fg)",
              }}
            >
              CP
            </span>
            <span className="font-editorial text-2xl font-semibold tracking-tight">
              ClientPortal
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="#capabilities"
              className="pill-btn px-4 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-panel)] hover:text-[var(--ink-primary)]"
            >
              Capabilities
            </Link>
            <Link
              href={samplePortalHref}
              className="pill-btn px-4 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-panel)] hover:text-[var(--ink-primary)]"
            >
              Live Client Hub
            </Link>
            <Link
              href="/dashboard"
              className="pill-btn px-4 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-panel)] hover:text-[var(--ink-primary)]"
            >
              Studio Workbench
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="pill-btn pill-btn-brand px-5 py-2.5 text-sm"
            >
              <span>Open Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-14 md:pt-20">
        {/* Editorial Hero */}
        <section className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-panel)] px-4 py-1.5 text-xs font-medium text-[var(--ink-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
              <span className="tracking-[0.14em] uppercase">
                White-Label Freelance Operations
              </span>
            </div>

            <h1 className="font-editorial text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
              Replace messy email chains with a calm, branded client hub.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
              Give every client their own password-protected portal under your studio name
              and brand color. Share live milestone progress, versioned deliverables,
              formal approvals, and downloadable invoices in one composed space.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="pill-btn pill-btn-brand px-6 py-3.5 text-sm"
              >
                <Layers className="h-4 w-4" />
                <span>Launch Studio Workbench</span>
              </Link>
              <Link
                href={samplePortalHref}
                className="pill-btn pill-btn-outline px-6 py-3.5 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Preview Client Portal</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>Password-protected portals</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>Stripe + branded PDF invoices</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>Custom domain ready</span>
              </span>
            </div>
          </div>

          {/* Live Portal Preview Card */}
          <div className="lg:col-span-5">
            <div className="surface-card rounded-[2rem] p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-5">
                <div>
                  <p className="eyebrow">Live White-Label Demo</p>
                  <h2 className="mt-1 font-editorial text-3xl font-semibold">
                    {studio.studioName}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--brand-accent)]">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Protected</span>
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[var(--surface-panel)] p-4">
                  <p className="text-xs text-[var(--ink-muted)]">Active Client Portal</p>
                  <p className="mt-1 font-medium">
                    {featuredProject?.title ?? "Meridian Brand Identity & Marketing Site"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                    Client: {featuredProject?.clientCompany ?? "Meridian Climate Labs"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--border-hairline)] p-4">
                    <p className="text-xs text-[var(--ink-muted)]">Portal URL</p>
                    <p className="mt-1 truncate text-xs font-medium">
                      /p/{studio.slug}/{featuredProject?.slug ?? "meridian-rebrand"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-hairline)] p-4">
                    <p className="text-xs text-[var(--ink-muted)]">Demo Password</p>
                    <p className="mt-1 font-mono text-xs font-semibold">meridian2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[var(--ink-muted)]">
                    Runtime: {mode === "cloud" ? "Live Supabase Cloud" : "Interactive Studio Sandbox"}
                  </span>
                  <Link
                    href={samplePortalHref}
                    className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                  >
                    <span>Try Client View</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Flat Bento Capabilities Section */}
        <section id="capabilities" className="mt-24 space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Built for Independent Studios</p>
              <h2 className="mt-2 font-editorial text-4xl font-medium tracking-tight">
                Everything a client needs. Nothing to lose in email.
              </h2>
            </div>
            <Link
              href="/dashboard/branding"
              className="pill-btn pill-btn-outline self-start px-5 py-2.5 text-sm"
            >
              <Palette className="h-4 w-4" />
              <span>Explore White-Label Studio</span>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="surface-card rounded-3xl p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-editorial text-2xl font-semibold">
                Live Milestone Clarity
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Assign percentage weights to every phase so clients always see exact
                project progress without asking for status updates.
              </p>
            </article>

            <article className="surface-card rounded-3xl p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-editorial text-2xl font-semibold">
                Versioned Deliverables & Sign-Off
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Pair Cloudinary file uploads with Figma, Vercel, and Loom links. Track v1
                to v2 revisions and lock formal approvals with timestamped sign-off records.
              </p>
            </article>

            <article className="surface-card rounded-3xl p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-editorial text-2xl font-semibold">
                Branded Invoices & Stripe Sync
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                Issue exact itemized invoices synced with Stripe Invoicing or settle offline,
                with instant white-labeled PDF downloads tailored to your studio palette.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
