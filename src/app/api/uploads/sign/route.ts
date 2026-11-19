import { NextResponse, type NextRequest } from "next/server";
import { generateCloudinaryUploadSignature } from "@/infrastructure/media/cloudinary";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export async function POST(request: NextRequest) {
  const freelancer = await getAuthenticatedFreelancer();
  if (!freelancer) {
    return NextResponse.json({ error: "Please sign in to upload files." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const projectSlug =
      typeof body?.projectSlug === "string" && body.projectSlug.trim()
        ? body.projectSlug.trim()
        : "general";

    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(freelancer.id);
    const payload = generateCloudinaryUploadSignature(studio.slug, projectSlug);

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Could not prepare upload signature." },
      { status: 500 }
    );
  }
}
