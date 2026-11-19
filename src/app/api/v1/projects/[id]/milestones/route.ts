import type { NextRequest } from "next/server";
import { createMilestoneSchema, updateMilestoneStatusSchema } from "@/domain/schemas";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
} from "@/infrastructure/http/api-response";
import { getPortalRepository } from "@/infrastructure/repositories";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const parsed = createMilestoneSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid milestone payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const milestone = await repo.createMilestone({
      projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      weightPct: parsed.data.weightPct,
      dueDate: parsed.data.dueDate || null,
    });
    return apiOk(milestone, 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not create milestone.",
      400
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const parsed = updateMilestoneStatusSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid milestone update.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const updated = await repo.updateMilestoneStatus(
      projectId,
      parsed.data.milestoneId,
      parsed.data.status
    );
    return apiOk(updated);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not update milestone.",
      400
    );
  }
}
