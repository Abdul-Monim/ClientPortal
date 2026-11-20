import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FolderKanban,
  Palette,
  Receipt,
} from "lucide-react";
import { buildStudioAnalytics } from "@/domain/analytics";
import { calculateProjectProgressPct } from "@/domain/milestones";
import { HostyAnalyticsView } from "@/components/dashboard/HostyAnalyticsView";
import { FreshStartOnboarding } from "@/components/dashboard/FreshStartOnboarding";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export const dynamic = "force-dynamic";

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
    <div className="w-full space-y-8">
      {/* 1. Hosty Analytics Engine View */}
      <section>
        <HostyAnalyticsView initialData={analyticsPayload} studioName={studio.studioName} />
      </section>

      {/* 2. Unified Studio Portals & Projects Stream (Hosty Aesthetic) */}
      <section className="rounded-[2.5rem] border border-neutral-800 bg-[#0B0F17] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-neutral-800/80">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Client Engagements
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Client Portals & Deliverables
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/branding"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#151C2A] px-4 py-2 text-xs font-semibold text-neutral-300 ring-1 ring-neutral-700/60 hover:bg-[#1E2738] hover:text-white transition"
            >
              <Palette className="h-3.5 w-3.5 text-neutral-400" />
              <span>Branding</span>
            </Link>
            <Link
              href="/dashboard/invoices"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#151C2A] px-4 py-2 text-xs font-semibold text-neutral-300 ring-1 ring-neutral-700/60 hover:bg-[#1E2738] hover:text-white transition"
            >
              <Receipt className="h-3.5 w-3.5 text-neutral-400" />
              <span>Ledger</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-xs"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>All Projects</span>
            </Link>
          </div>
        </div>

        {bundles.length === 0 ? (
          <div className="mt-6">
            <FreshStartOnboarding studioName={studio.studioName} studioSlug={studio.slug} />
          </div>
        ) : (
          /* Portals Cards Grid */
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {bundles.map(({ project, milestones, deliverables }) => {
              const pct = calculateProjectProgressPct(milestones);
              const pendingCount = deliverables.filter(
                (d) => d.status === "in_review"
              ).length;
              const approvedCount = deliverables.filter(
                (d) => d.status === "approved"
              ).length;

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-[#111726] p-5 ring-1 ring-neutral-800/80 transition hover:ring-neutral-700 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-400">
                        {project.clientCompany}
                      </span>
                      <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-800/60">
                        Active
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                        {project.summary || "Client portal hub with milestone tracking."}
                      </p>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs text-neutral-300">
                        <span className="font-semibold">{pct}% Complete</span>
                        <span className="text-neutral-400 text-[11px]">
                          {approvedCount}/{deliverables.length} Approved • {pendingCount} in review
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/60">
                    <Link
                      href={`/p/${studio.slug}/${project.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1A2234] px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#232D44] transition"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Client View</span>
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition"
                    >
                      <span>Manage Hub</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
