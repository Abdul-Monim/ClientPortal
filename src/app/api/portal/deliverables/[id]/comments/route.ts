import { NextResponse, type NextRequest } from "next/server";
import { deliverableCommentSchema } from "@/domain/schemas";
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
    const requestedRole = body?.authorRole === "freelancer" ? "freelancer" : "client";

    if (!projectId) {
      return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
    }

    const parsed = deliverableCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid comment." },
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
        { error: "Please unlock this portal to post feedback." },
        { status: 401 }
      );
    }

    const authorRole = requestedRole === "freelancer" && freelancer ? "freelancer" : "client";
    const comment = await repo.addDeliverableComment({
      projectId: bundle.project.id,
      deliverableId,
      authorRole,
      authorName: parsed.data.authorName,
      body: parsed.data.body,
    });

    return NextResponse.json({ ok: true, comment });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not post your comment." },
      { status: 500 }
    );
  }
}
