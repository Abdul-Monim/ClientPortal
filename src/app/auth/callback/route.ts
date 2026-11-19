import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/infrastructure/config/env";
import { createSupabaseServerSessionClient } from "@/infrastructure/repositories/supabase-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerSessionClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // If code exchange failed or wasn't provided, redirect to login with note
  return NextResponse.redirect(
    new URL(`/login?error=email-verification-failed`, requestUrl.origin)
  );
}
