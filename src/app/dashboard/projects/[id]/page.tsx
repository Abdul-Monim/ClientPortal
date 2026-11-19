import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectWorkbench } from "@/components/dashboard/ProjectWorkbench";
import { getAppUrl } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = getPortalRepository();
  const bundle = await repo.getProjectBundleById(id);

  if (!bundle) {
    notFound();
  }

  const portalUrl = bundle.studio.customDomain
    ? `https://${bundle.studio.customDomain}/${bundle.project.slug}`
    : `${getAppUrl()}/p/${bundle.studio.slug}/${bundle.project.slug}`;

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/projects"
        className="pill-btn pill-btn-outline px-4 py-2 text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>All Projects</span>
      </Link>
      <ProjectWorkbench bundle={bundle} portalUrl={portalUrl} />
    </div>
  );
}
