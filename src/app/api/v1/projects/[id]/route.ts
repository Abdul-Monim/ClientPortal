import type { NextRequest } from "next/server";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
  sanitizeProjectBundle,
} from "@/infrastructure/http/api-response";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const { id } = await context.params;
    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleById(id);
    if (!bundle) {
      return apiError("Project not found.", 404);
    }
    return apiOk(sanitizeProjectBundle(bundle));
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not load project details.",
      500
    );
  }
}
