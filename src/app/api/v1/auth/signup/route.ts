import { freelancerSignupSchema } from "@/domain/schemas";
import { apiError, apiOk } from "@/infrastructure/http/api-response";
import { signupFreelancer } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return apiError("Invalid JSON payload.", 400);
    }

    const parsed = freelancerSignupSchema.safeParse(json);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid registration input.";
      return apiError(issue, 422, parsed.error.flatten());
    }

    const result = await signupFreelancer(parsed.data);
    if (!result.ok) {
      return apiError(result.error || "Failed to create account.", 400);
    }

    return apiOk(
      {
        message: result.message,
        user: result.user,
        requiresEmailConfirmation: result.requiresEmailConfirmation,
      },
      201
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal auth server error.",
      500
    );
  }
}
