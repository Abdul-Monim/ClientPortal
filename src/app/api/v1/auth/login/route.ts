import { freelancerLoginSchema } from "@/domain/schemas";
import { apiError, apiOk } from "@/infrastructure/http/api-response";
import { loginFreelancer } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return apiError("Invalid JSON payload.", 400);
    }

    const parsed = freelancerLoginSchema.safeParse(json);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid login credentials.";
      return apiError(issue, 422, parsed.error.flatten());
    }

    const result = await loginFreelancer(parsed.data);
    if (!result.ok) {
      return apiError(result.error || "Authentication failed.", 401);
    }

    return apiOk(
      {
        message: result.message,
        user: result.user,
      },
      200
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal login server error.",
      500
    );
  }
}
