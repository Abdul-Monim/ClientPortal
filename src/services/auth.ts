import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/infrastructure/config/env";
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

export async function getAuthenticatedFreelancer(): Promise<AuthenticatedFreelancer | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: "sandbox-owner-01",
      email: "hello@ateliervance.studio",
      mode: "sandbox",
    };
  }

  const supabase = await createSupabaseServerSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    mode: "cloud",
  };
}

export async function getVerifiedClientPortalSession(
  projectId: string,
  expectedPasscodeVersion: number
): Promise<PortalSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getPortalCookieName(projectId))?.value;
  return verifyPortalSessionToken(token, projectId, expectedPasscodeVersion);
}
