import type { NextRequest } from "next/server";
import { calculateProjectProgressPct } from "@/domain/milestones";
import { createProjectSchema } from "@/domain/schemas";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
  sanitizeProject,
} from "@/infrastructure/http/api-response";
import { getPortalRepository } from "@/infrastructure/repositories";
import { hashPasscode } from "@/infrastructure/security/passcode";

export const dynamic = "force-dynamic";

export async function GET() {
  const { freelancer, unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse || !freelancer) return unauthorizedResponse!;

  try {
    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(freelancer.id);
    const projects = await repo.listProjects(studio.id);
    const hydrated = await Promise.all(
      projects.map(async (project) => {
        const bundle = await repo.getProjectBundleById(project.id);
        return {
          ...sanitizeProject(project),
          progressPct: bundle ? calculateProjectProgressPct(bundle.milestones) : 0,
          milestoneCount: bundle?.milestones.length ?? 0,
          deliverableCount: bundle?.deliverables.length ?? 0,
          pendingReviewCount:
            bundle?.deliverables.filter((d) => d.status === "in_review").length ?? 0,
        };
      })
    );
    return apiOk(hydrated);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not load projects.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const { freelancer, unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse || !freelancer) return unauthorizedResponse!;

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid project payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(freelancer.id);
    const { hash, salt } = hashPasscode(parsed.data.passcode);

    const project = await repo.createProject(studio.id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      summary: parsed.data.summary,
      clientName: parsed.data.clientName,
      clientCompany: parsed.data.clientCompany,
      clientEmail: parsed.data.clientEmail,
      passcodeHash: hash,
      passcodeSalt: salt,
      passcodeHint: parsed.data.passcodeHint || null,
      targetLaunchDate: parsed.data.targetLaunchDate || null,
    });

    return apiOk(sanitizeProject(project), 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not create project.",
      400
    );
  }
}
