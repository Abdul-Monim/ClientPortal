import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "@/infrastructure/config/env";
import { createSupabaseServerSessionClient } from "@/infrastructure/repositories/supabase-client";
import {
  getPortalCookieName,
  verifyPortalSessionToken,
  type PortalSessionPayload,
} from "@/infrastructure/security/session-cookie";

export interface AuthenticatedFreelancer {
  id: string;
  email: string;
  mode: "cloud" | "sandbox";
}

async function safeGetCookies() {
  try {
    return await cookies();
  } catch {
    return null;
  }
}

export async function getAuthenticatedFreelancer(): Promise<AuthenticatedFreelancer | null> {
  if (isSupabaseAuthConfigured()) {
    try {
      const supabase = await createSupabaseServerSessionClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return {
          id: user.id,
          email: user.email ?? "",
          mode: "cloud",
        };
      }
    } catch {
      // Supabase network or session fallback
    }
  }

  // Check lightweight sandbox or fallback cookie
  const cookieStore = await safeGetCookies();
  const sessionCookie = cookieStore?.get("cp_freelancer_session")?.value;

  if (sessionCookie || process.env.NODE_ENV === "test") {
    return {
      id: sessionCookie?.startsWith("cloud:") ? sessionCookie.replace("cloud:", "") : "sandbox-owner-01",
      email: "hello@ateliervance.studio",
      mode: sessionCookie?.startsWith("cloud:") ? "cloud" : "sandbox",
    };
  }

  // If running in dedicated offline sandbox mode
  if (process.env.PORTAL_STORAGE_MODE === "sandbox") {
    return {
      id: "sandbox-owner-01",
      email: "hello@ateliervance.studio",
      mode: "sandbox",
    };
  }

  return null;
}

export async function getVerifiedClientPortalSession(
  projectId: string,
  expectedPasscodeVersion: number
): Promise<PortalSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getPortalCookieName(projectId))?.value;
  return verifyPortalSessionToken(token, projectId, expectedPasscodeVersion);
}
