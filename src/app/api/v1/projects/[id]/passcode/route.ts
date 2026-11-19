import type { NextRequest } from "next/server";
import { rotatePasscodeSchema } from "@/domain/schemas";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
  sanitizeProject,
} from "@/infrastructure/http/api-response";
import { getPortalRepository } from "@/infrastructure/repositories";
import { hashPasscode } from "@/infrastructure/security/passcode";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const parsed = rotatePasscodeSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid passcode payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const { hash, salt } = hashPasscode(parsed.data.newPasscode);
    const updated = await repo.rotateProjectPasscode(
      projectId,
      hash,
      salt,
      parsed.data.passcodeHint || null
    );
    return apiOk(sanitizeProject(updated));
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not rotate portal passcode.",
      400
    );
  }
}
