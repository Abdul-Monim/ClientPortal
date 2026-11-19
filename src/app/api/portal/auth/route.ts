import { NextResponse, type NextRequest } from "next/server";
import { clientPasscodeAuthSchema } from "@/domain/schemas";
import { getPortalRepository } from "@/infrastructure/repositories";
import { verifyPasscode } from "@/infrastructure/security/passcode";
import { portalPasscodeRateLimiter } from "@/infrastructure/security/rate-limit";
import {
  createPortalSessionToken,
  getPortalCookieName,
} from "@/infrastructure/security/session-cookie";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isSecureRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = clientPasscodeAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please enter your portal password." },
        { status: 400 }
      );
    }

    const { studioSlug, projectSlug, passcode } = parsed.data;
    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleBySlugs(studioSlug, projectSlug);
    if (!bundle) {
      return NextResponse.json(
        { error: "We could not find this client portal." },
        { status: 404 }
      );
    }

    const rateKey = `${getClientIp(request)}:${bundle.project.id}`;
    const gate = portalPasscodeRateLimiter.check(rateKey);
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: `Too many incorrect attempts. Please try again in ${Math.ceil(gate.retryAfterSeconds / 60)} minute(s).`,
        },
        { status: 429 }
      );
    }

    const isValid = verifyPasscode(
      passcode,
      bundle.project.passcodeHash,
      bundle.project.passcodeSalt
    );
    if (!isValid) {
      const updated = portalPasscodeRateLimiter.recordFailure(rateKey);
      return NextResponse.json(
        {
          error:
            updated.remaining > 0
              ? `That password did not match. ${updated.remaining} attempt(s) remaining.`
              : "Too many incorrect attempts. Please wait before trying again.",
        },
        { status: 401 }
      );
    }

    portalPasscodeRateLimiter.reset(rateKey);
    const token = createPortalSessionToken({
      projectId: bundle.project.id,
      studioSlug: bundle.studio.slug,
      passcodeVersion: bundle.project.passcodeVersion,
    });

    const response = NextResponse.json({
      ok: true,
      projectId: bundle.project.id,
    });
    response.cookies.set(getPortalCookieName(bundle.project.id), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in to this portal right now." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getPortalCookieName(projectId), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
