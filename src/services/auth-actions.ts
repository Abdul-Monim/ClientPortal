"use server";

import { redirect } from "next/navigation";
import { freelancerLoginSchema, freelancerSignupSchema } from "@/domain/schemas";
import { loginFreelancer, logoutFreelancer, signupFreelancer } from "./auth-service";

export interface FormActionState {
  ok: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  requiresEmailConfirmation?: boolean;
}

export async function loginFreelancerAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = freelancerLoginSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstError = parsed.error.issues[0]?.message || "Invalid credentials.";
    return {
      ok: false,
      error: firstError,
      fieldErrors: errorMap,
    };
  }

  const result = await loginFreelancer(parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || "Unable to sign in.",
    };
  }

  redirect("/dashboard");
}

export async function signupFreelancerAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    studioName: formData.get("studioName"),
    studioSlug: formData.get("studioSlug") || undefined,
  };

  const parsed = freelancerSignupSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    const firstError = parsed.error.issues[0]?.message || "Invalid registration form.";
    return {
      ok: false,
      error: firstError,
      fieldErrors: errorMap,
    };
  }

  const result = await signupFreelancer(parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || "Unable to create studio account.",
    };
  }

  if (result.requiresEmailConfirmation) {
    return {
      ok: true,
      requiresEmailConfirmation: true,
      message:
        "Account created! Please check your email to confirm your studio address before signing in.",
    };
  }

  redirect("/dashboard");
}

export async function logoutFreelancerAction(): Promise<void> {
  await logoutFreelancer();
  redirect("/login");
}
