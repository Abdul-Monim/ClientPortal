import { apiError, apiOk } from "@/infrastructure/http/api-response";
import { getCurrentFreelancer } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentFreelancer();
    if (!session) {
      return apiOk({ session: null, authenticated: false });
    }

    return apiOk({ session, authenticated: true });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to retrieve session.",
      500
    );
  }
}
