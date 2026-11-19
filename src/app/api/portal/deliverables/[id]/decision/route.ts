import { NextResponse, type NextRequest } from "next/server";
import { deliverableDecisionSchema } from "@/domain/schemas";
import { InvalidStateTransitionError } from "@/domain/state-machines";
import { getPortalRepository } from "@/infrastructure/repositories";
import {
  getAuthenticatedFreelancer,
  getVerifiedClientPortalSession,
} from "@/services/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliverableId } = await context.params;
    const body = await request.json();
    const projectId = typeof body?.projectId === "string" ? body.projectId : "";
    if (!projectId) {
      return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
    }

    const parsed = deliverableDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review details." },
        { status: 400 }
      );
    }

    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleById(projectId);
    if (!bundle) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [clientSession, freelancer] = await Promise.all([
      getVerifiedClientPortalSession(bundle.project.id, bundle.project.passcodeVersion),
      getAuthenticatedFreelancer(),
    ]);
    if (!clientSession && !freelancer) {
      return NextResponse.json(
        { error: "Please unlock this client portal before submitting an approval." },
        { status: 401 }
      );
    }

    const updated = await repo.submitDeliverableDecision({
      projectId: bundle.project.id,
      deliverableId,
      deliverableVersionId: parsed.data.deliverableVersionId,
      decision: parsed.data.decision,
      reviewerName: parsed.data.reviewerName,
      reviewerEmail: parsed.data.reviewerEmail || null,
      feedbackNote: parsed.data.feedbackNote,
    });

    return NextResponse.json({ ok: true, deliverable: updated });
  } catch (error) {
    if (error instanceof InvalidStateTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not record your review." },
      { status: 500 }
    );
  }
}
