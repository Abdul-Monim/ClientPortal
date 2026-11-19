import { buildStudioAnalytics } from "@/domain/analytics";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
} from "@/infrastructure/http/api-response";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  const { freelancer, unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse || !freelancer) return unauthorizedResponse!;

  try {
    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(freelancer.id);
    const [projects, invoices, activities] = await Promise.all([
      repo.listProjects(studio.id),
      repo.listInvoicesForStudio(studio.id),
      repo.listRecentStudioActivities(studio.id, 60),
    ]);

    const bundles = (
      await Promise.all(projects.map((p) => repo.getProjectBundleById(p.id)))
    ).filter((b): b is NonNullable<typeof b> => Boolean(b));

    const analytics = buildStudioAnalytics({
      bundles,
      invoices,
      activities,
    });

    return apiOk(analytics);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not compute studio analytics.",
      500
    );
  }
}
