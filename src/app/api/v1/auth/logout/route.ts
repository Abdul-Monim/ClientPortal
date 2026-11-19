import { apiError, apiOk } from "@/infrastructure/http/api-response";
import { logoutFreelancer } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await logoutFreelancer();
    return apiOk({ loggedOut: true, message: "Logged out successfully." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to sign out.",
      500
    );
  }
}
