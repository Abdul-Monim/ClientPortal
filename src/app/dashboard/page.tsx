import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FolderKanban,
  Palette,
  Receipt,
  Sparkles,
} from "lucide-react";
import { buildStudioAnalytics } from "@/domain/analytics";
import { calculateProjectProgressPct } from "@/domain/milestones";
import { HostyAnalyticsView } from "@/components/dashboard/HostyAnalyticsView";
import { StatusPill } from "@/components/ui/StatusPill";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export default async function DashboardOverviewPage() {
  const freelancer = await getAuthenticatedFreelancer();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer?.id);
  const [projects, invoices, activities] = await Promise.all([
    repo.listProjects(studio.id),
    repo.listInvoicesForStudio(studio.id),
    repo.listRecentStudioActivities(studio.id, 8),
  ]);

  const bundles = (
    await Promise.all(projects.map((p) => repo.getProjectBundleById(p.id)))
  ).filter((b): b is NonNullable<typeof b> => Boolean(b));

  const analyticsPayload = buildStudioAnalytics({
    bundles,
    invoices,
    activities,
  });

  return (
    <div className="space-y-10">
      {/* Header Row */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Studio Workbench</p>
          <h1 className="mt-1 font-editorial text-4xl font-semibold tracking-tight sm:text-5xl">
            Good day, {studio.studioName}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">
            Live client hub analytics, approval velocities, and project tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/branding"
            className="pill-btn pill-btn-outline px-5 py-2.5 text-sm"
          >
            <Palette className="h-4 w-4" />
            <span>Customize Branding</span>
          </Link>
          <Link
            href="/dashboard/projects"
            className="pill-btn pill-btn-brand px-5 py-2.5 text-sm"
          >
            <FolderKanban className="h-4 w-4" />
            <span>Manage Projects</span>
          </Link>
        </div>
      </section>

      {/* Hosty Analytics Dashboard Recreation */}
      <section>
        <HostyAnalyticsView initialData={analyticsPayload} />
      </section>

      {/* Main Asymmetric Split */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Active Client Projects */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-3xl font-semibold">Client Portals</h2>
            <Link
              href="/dashboard/projects"
              className="pill-btn pill-btn-outline px-4 py-1.5 text-xs"
            >
              <span>All Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {bundles.map(({ project, milestones, deliverables }) => {
              const pct = calculateProjectProgressPct(milestones);
              const pendingCount = deliverables.filter(
                (d) => d.status === "in_review"
              ).length;
              return (
                <div
                  key={project.id}
                  className="surface-card flex flex-col justify-between gap-5 rounded-3xl p-6 sm:flex-row sm:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusPill status={project.status} />
                      <span className="text-xs text-[var(--ink-muted)]">
                        {project.clientCompany}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl font-semibold">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-secondary)]">
                      <span className="tabular-nums font-medium">{pct}% progress</span>
                      <span>{deliverables.length} deliverable(s)</span>
                      <span>{pendingCount} awaiting sign-off</span>
                    </div>
                    <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--surface-panel)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--brand-accent)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/p/${studio.slug}/${project.slug}`}
                      className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Portal</span>
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-3xl font-semibold">Recent Activity</h2>
            <Link
              href="/dashboard/invoices"
              className="pill-btn pill-btn-outline px-3.5 py-1.5 text-xs"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Ledger</span>
            </Link>
          </div>

          <div className="surface-card rounded-3xl p-5">
            <ul className="divide-y divide-[var(--border-hairline)]">
              {activities.map((item) => (
                <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed text-[var(--ink-primary)]">
                        <span className="font-semibold">{item.actorName}</span>{" "}
                        {item.message}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                        <Clock className="h-3 w-3" />
                        <span>{item.createdAt.slice(0, 10)}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
