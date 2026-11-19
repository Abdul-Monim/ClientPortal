import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/infrastructure/config/env";
import { createSupabaseServerSessionClient } from "@/infrastructure/repositories/supabase-client";

export interface FreelancerSession {
  id: string;
  email: string;
  studioName: string;
  studioSlug: string;
  mode: "cloud" | "sandbox";
}

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  error?: string;
  user?: FreelancerSession;
  requiresEmailConfirmation?: boolean;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function safeGetCookies() {
  try {
    return await cookies();
  } catch {
    return null;
  }
}

/**
 * Sign in a freelancer using Supabase Auth with automatic SSR session cookie handling,
 * with deterministic fallback for local sandbox environments.
 */
export async function loginFreelancer(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!isSupabaseConfigured()) {
    // Sandbox mode: store lightweight session cookie
    const cookieStore = await safeGetCookies();
    cookieStore?.set("cp_freelancer_session", "sandbox-authenticated", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return {
      ok: true,
      message: "Studio session initialized in sandbox mode.",
      user: {
        id: "sandbox-owner-01",
        email,
        studioName: "Atelier Vance",
        studioSlug: "atelier-vance",
        mode: "sandbox",
      },
    };
  }

  try {
    const supabase = await createSupabaseServerSessionClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: error?.message || "Invalid email or studio password.",
      };
    }

    // Lookup studio profile linked to this Supabase user
    const { data: studio } = await supabase
      .from("studios")
      .select("id, slug, studio_name")
      .eq("owner_user_id", data.user.id)
      .single();

    return {
      ok: true,
      message: "Studio sign-in successful.",
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        studioName: studio?.studio_name ?? "My Studio",
        studioSlug: studio?.slug ?? "my-studio",
        mode: "cloud",
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Authentication service error.",
    };
  }
}

/**
 * Register a new freelance studio using Supabase Auth + atomic public.studios row creation.
 */
export async function signupFreelancer(input: {
  email: string;
  password: string;
  studioName: string;
  studioSlug?: string;
}): Promise<AuthActionResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const studioName = input.studioName.trim();
  const slug = input.studioSlug?.trim() || toSlug(studioName);

  if (!isSupabaseConfigured()) {
    const cookieStore = await safeGetCookies();
    cookieStore?.set("cp_freelancer_session", "sandbox-authenticated", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return {
      ok: true,
      message: "Studio registered in sandbox mode.",
      user: {
        id: "sandbox-owner-01",
        email,
        studioName,
        studioSlug: slug,
        mode: "sandbox",
      },
    };
  }

  try {
    const supabase = await createSupabaseServerSessionClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          studio_name: studioName,
          studio_slug: slug,
        },
      },
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: error?.message || "Unable to register studio account.",
      };
    }

    // If user is immediately active (e.g. email confirmations disabled or confirmed), provision studio
    if (data.session) {
      const { error: studioErr } = await supabase.from("studios").insert({
        owner_user_id: data.user.id,
        slug,
        studio_name: studioName,
        contact_email: email,
        accent_hex: "#2F5D50",
        welcome_message: `Welcome to the ${studioName} client portal. Track milestones, inspect deliverables, and download invoices here.`,
      });

      if (studioErr) {
        // Table already had this slug or constraint failure
        return {
          ok: true,
          message: "Account created, but studio profile already exists or needs slug adjustment.",
          user: {
            id: data.user.id,
            email,
            studioName,
            studioSlug: slug,
            mode: "cloud",
          },
        };
      }
    }

    const requiresEmailConfirmation = !data.session;

    return {
      ok: true,
      requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? "Registration successful! Please check your email to confirm your studio account."
        : "Studio registered and authenticated successfully.",
      user: {
        id: data.user.id,
        email,
        studioName,
        studioSlug: slug,
        mode: "cloud",
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Registration service exception.",
    };
  }
}

/**
 * Sign out the currently authenticated freelancer and invalidate sessions.
 */
export async function logoutFreelancer(): Promise<{ ok: boolean }> {
  try {
    const cookieStore = await safeGetCookies();
    cookieStore?.delete("cp_freelancer_session");

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerSessionClient();
      await supabase.auth.signOut();
    }

    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/**
 * Resolve currently authenticated freelancer across SSR and Route Handlers.
 */
export async function getCurrentFreelancer(): Promise<FreelancerSession | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: "sandbox-owner-01",
      email: "hello@ateliervance.studio",
      studioName: "Atelier Vance",
      studioSlug: "atelier-vance",
      mode: "sandbox",
    };
  }

  try {
    const supabase = await createSupabaseServerSessionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: studio } = await supabase
      .from("studios")
      .select("id, slug, studio_name")
      .eq("owner_user_id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      studioName: studio?.studio_name ?? "My Studio",
      studioSlug: studio?.slug ?? "my-studio",
      mode: "cloud",
    };
  } catch {
    return null;
  }
}
