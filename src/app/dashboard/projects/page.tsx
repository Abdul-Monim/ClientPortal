import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  ExternalLink,
  FolderKanban,
  Layers,
  Receipt,
} from "lucide-react";
import { calculateProjectProgressPct } from "@/domain/milestones";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { StatusPill } from "@/components/ui/StatusPill";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const freelancer = await getAuthenticatedFreelancer();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer?.id);
  const projects = await repo.listProjects(studio.id);
  const bundles = (
    await Promise.all(projects.map((p) => repo.getProjectBundleById(p.id)))
  ).filter((b): b is NonNullable<typeof b> => Boolean(b));

  const totalDeliverables = bundles.reduce(
    (sum, b) => sum + b.deliverables.length,
    0
  );
  const awaitingReviewCount = bundles.reduce(
    (sum, b) =>
      sum + b.deliverables.filter((d) => d.status === "in_review").length,
    0
  );
  const totalInvoices = bundles.reduce((sum, b) => sum + b.invoices.length, 0);

  return (
    <div className="w-full space-y-8">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB */}
      {/* ========================================================= */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400">
            <span>Workspaces</span>
            <span>&bull;</span>
            <span className="text-neutral-900 dark:text-white">Client Portals</span>
          </div>
          <h1 className="mt-1 font-editorial text-4xl font-semibold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            Client Workspaces
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Each project has a dedicated, password-protected hub under{" "}
            <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {studio.customDomain ? studio.customDomain : `/p/${studio.slug}/[project]`}
            </span>{" "}
            where clients inspect Figma designs, Loom videos, staging links, and sign off.
          </p>
        </div>

        {/* Filter Pills matching Hosty style */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800 px-4 py-1.5 text-xs font-medium">
            All Portals ({projects.length})
          </span>
          <span className="rounded-full bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-700 px-4 py-1.5 text-xs font-medium">
            Active ({projects.filter((p) => p.status === "active").length})
          </span>
          <span className="rounded-full bg-white text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-700 px-4 py-1.5 text-xs font-medium">
            In Review ({awaitingReviewCount})
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FOUR PASTEL KPI STATS CARDS (Hosty Aesthetic) */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sky Card */}
        <div className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs dark:bg-[#162738] dark:text-[#BAE6FD]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-200/60 text-[#133E53] dark:bg-sky-900/50 dark:text-sky-300">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              100% Live
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">{projects.length}</div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Active Client Portals
          </div>
        </div>

        {/* Lime Card */}
        <div className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs dark:bg-[#1A3320] dark:text-[#BBF7D0]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200/60 text-[#1F4E24] dark:bg-emerald-900/50 dark:text-emerald-300">
              <Layers className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              Published
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">{totalDeliverables}</div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Deliverable Revisions
          </div>
        </div>

        {/* Peach Card */}
        <div className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-xs dark:bg-[#3D2516] dark:text-[#FED7AA]">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/60 text-[#7C2D12] dark:bg-amber-900/50 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200">
              Pending
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">{awaitingReviewCount}</div>
          <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Awaiting Client Sign-Off
          </div>
        </div>

        {/* Dark Slate Card */}
        <div className="rounded-2xl bg-neutral-800/90 p-5 text-neutral-200 shadow-xs dark:bg-[#1A202C] dark:text-neutral-100 ring-1 ring-neutral-700/60">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-700/80 text-neutral-200">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-700 px-2 py-0.5 text-[11px] font-semibold text-white">
              Billing
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight">{totalInvoices}</div>
          <div className="mt-1 text-xs font-medium text-neutral-400">
            Linked Invoices
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. PORTAL CARDS GRID */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map(({ project, milestones, deliverables, invoices }) => {
          const pct = calculateProjectProgressPct(milestones);
          const portalPath = `/p/${studio.slug}/${project.slug}`;

          return (
            <article
              key={project.id}
              className="flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-[#0E131F]"
            >
              <div>
                {/* Status + Target Launch Row */}
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={project.status} />
                  {project.targetLaunchDate && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Target: {project.targetLaunchDate}</span>
                    </span>
                  )}
                </div>

                {/* Project Title & Client Details */}
                <h2 className="mt-4 font-editorial text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                  {project.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {project.clientCompany}
                  </span>
                  <span>&bull;</span>
                  <span>{project.clientName}</span>
                </div>

                {project.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {project.summary}
                  </p>
                )}

                {/* Milestone Progress Bar */}
                <div className="mt-6 space-y-2 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 p-4 ring-1 ring-neutral-200/60 dark:ring-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-500 dark:text-neutral-400">
                      Milestone Completion
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                    <span>{milestones.length} milestones</span>
                    <span>{deliverables.length} deliverables</span>
                    <span>{invoices.length} invoices</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row with 50% radius pills */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                <Link
                  href={portalPath}
                  target="_blank"
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Client View</span>
                </Link>

                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="rounded-full bg-neutral-950 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center gap-2 shadow-sm"
                >
                  <span>Open Workbench</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* 4. NEW CLIENT HUB CREATION FORM */}
      {/* ========================================================= */}
      <section className="pt-4">
        <CreateProjectForm studioSlug={studio.slug} />
      </section>
    </div>
  );
}
