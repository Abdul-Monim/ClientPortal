import type { NextRequest } from "next/server";
import { updateStudioSchema } from "@/domain/schemas";
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
    return apiOk(studio);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not load studio profile.",
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { freelancer, unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse || !freelancer) return unauthorizedResponse!;

  try {
    const body = await request.json();
    const parsed = updateStudioSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid studio settings.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const current = await repo.getStudioForOwner(freelancer.id);
    const updated = await repo.updateStudio(current.id, {
      studioName: parsed.data.studioName,
      slug: parsed.data.slug,
      customDomain: parsed.data.customDomain || null,
      tagline: parsed.data.tagline,
      logoUrl: parsed.data.logoUrl || null,
      accentHex: parsed.data.accentHex,
      welcomeMessage: parsed.data.welcomeMessage,
      contactEmail: parsed.data.contactEmail,
      billingAddress: parsed.data.billingAddress,
    });
    return apiOk(updated);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not update studio settings.",
      500
    );
  }
}
