import { redirect } from "next/navigation";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export default async function PortalIndexPage() {
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner();
  const projects = await repo.listProjects(studio.id);

  if (projects.length > 0 && projects[0]) {
    redirect(`/p/${studio.slug}/${projects[0].slug}`);
  }

  redirect("/dashboard");
}
