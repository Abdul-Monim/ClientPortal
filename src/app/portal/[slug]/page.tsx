import { notFound, redirect } from "next/navigation";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export default async function LegacyPortalSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner();

  // Try direct lookup with default studio slug first
  const directBundle = await repo.getProjectBundleBySlugs(studio.slug, slug);
  if (directBundle) {
    redirect(`/p/${studio.slug}/${directBundle.project.slug}`);
  }

  // Fallback: list all projects across studio
  const allProjects = await repo.listProjects(studio.id);
  const matched = allProjects.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase()
  );

  if (matched) {
    redirect(`/p/${studio.slug}/${matched.slug}`);
  }

  notFound();
}
