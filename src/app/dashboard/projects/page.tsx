import Link from "next/link";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { calculateProjectProgressPct } from "@/domain/milestones";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { StatusPill } from "@/components/ui/StatusPill";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export default async function ProjectsPage() {
  const freelancer = await getAuthenticatedFreelancer();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer?.id);
  const projects = await repo.listProjects(studio.id);
  const bundles = (
    await Promise.all(projects.map((p) => repo.getProjectBundleById(p.id)))
  ).filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Client Hubs</p>
        <h1 className="mt-1 font-editorial text-4xl font-semibold sm:text-5xl">
          Projects & Portals
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Each project automatically gets a dedicated password-protected client hub under{" "}
          <span className="font-mono text-xs text-[var(--ink-primary)]">
            {studio.customDomain ? studio.customDomain : `/p/${studio.slug}/...`}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {bundles.map(({ project, milestones, deliverables, invoices }) => {
          const pct = calculateProjectProgressPct(milestones);
          return (
            <article
              key={project.id}
              className="surface-card flex flex-col justify-between rounded-3xl p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={project.status} />
                  {project.targetLaunchDate && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Target {project.targetLaunchDate}</span>
                    </span>
                  )}
                </div>

                <h2 className="mt-4 font-editorial text-3xl font-semibold">
                  {project.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-[var(--ink-secondary)]">
                  {project.clientCompany} - {project.clientName}
                </p>
                {project.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {project.summary}
                  </p>
                )}

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink-muted)]">Milestone Progress</span>
                    <span className="font-semibold tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-panel)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: "var(--brand-accent)",
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1 text-xs text-[var(--ink-muted)]">
                    <span>{milestones.length} milestones</span>
                    <span>{deliverables.length} deliverables</span>
                    <span>{invoices.length} invoices</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-4">
                <Link
                  href={`/p/${studio.slug}/${project.slug}`}
                  className="pill-btn pill-btn-outline px-4 py-2 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Client Portal</span>
                </Link>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="pill-btn pill-btn-brand px-4 py-2 text-xs"
                >
                  <span>Open Workbench</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <CreateProjectForm studioSlug={studio.slug} />
    </div>
  );
}
