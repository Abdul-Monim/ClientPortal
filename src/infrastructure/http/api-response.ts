import { NextResponse } from "next/server";
import type { Project, ProjectBundle } from "@/domain/types";
import { getAuthenticatedFreelancer } from "@/services/auth";

export type PublicProjectDTO = Omit<Project, "passcodeHash" | "passcodeSalt">;

export type PublicProjectBundleDTO = Omit<ProjectBundle, "project"> & {
  project: PublicProjectDTO;
};

export function sanitizeProject(project: Project): PublicProjectDTO {
  const { passcodeHash: _h, passcodeSalt: _s, ...safe } = project;
  void _h;
  void _s;
  return safe;
}

export function sanitizeProjectBundle(bundle: ProjectBundle): PublicProjectBundleDTO {
  return {
    ...bundle,
    project: sanitizeProject(bundle.project),
  };
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export async function requireApiFreelancer() {
  const freelancer = await getAuthenticatedFreelancer();
  if (!freelancer) {
    return {
      freelancer: null,
      unauthorizedResponse: apiError("Authentication required.", 401),
    };
  }
  return { freelancer, unauthorizedResponse: null };
}
