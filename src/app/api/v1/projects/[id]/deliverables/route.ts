import type { NextRequest } from "next/server";
import {
  createDeliverableSchema,
  publishDeliverableVersionSchema,
} from "@/domain/schemas";
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
    const parsed = createDeliverableSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid deliverable payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const deliverable = await repo.createDeliverable({
      projectId,
      milestoneId: parsed.data.milestoneId || null,
      title: parsed.data.title,
      summary: parsed.data.summary,
      kind: parsed.data.kind,
      assetUrl: parsed.data.assetUrl || null,
      assetPublicId: parsed.data.assetPublicId || null,
      externalUrl: parsed.data.externalUrl || null,
      releaseNotes: parsed.data.releaseNotes,
      fileSizeBytes: parsed.data.fileSizeBytes ?? null,
    });
    return apiOk(deliverable, 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not publish deliverable.",
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
    const parsed = publishDeliverableVersionSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid deliverable revision payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const updated = await repo.publishDeliverableVersion({
      projectId,
      deliverableId: parsed.data.deliverableId,
      assetUrl: parsed.data.assetUrl || null,
      assetPublicId: parsed.data.assetPublicId || null,
      externalUrl: parsed.data.externalUrl || null,
      releaseNotes: parsed.data.releaseNotes,
      fileSizeBytes: parsed.data.fileSizeBytes ?? null,
    });
    return apiOk(updated);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not publish version.",
      400
    );
  }
}
