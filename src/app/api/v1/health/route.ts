import {
  getRuntimeMode,
  isCloudinaryConfigured,
  isResendConfigured,
  isStripeConfigured,
  isSupabaseConfigured,
} from "@/infrastructure/config/env";
import { apiOk } from "@/infrastructure/http/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiOk({
    service: "clientportal-api",
    version: "v1",
    status: "operational",
    runtimeMode: getRuntimeMode(),
    integrations: {
      supabase: isSupabaseConfigured(),
      cloudinary: isCloudinaryConfigured(),
      stripe: isStripeConfigured(),
      resend: isResendConfigured(),
    },
    endpoints: [
      "GET /api/v1/health",
      "GET /api/v1/studio",
      "PATCH /api/v1/studio",
      "GET /api/v1/analytics",
      "GET /api/v1/projects",
      "POST /api/v1/projects",
      "GET /api/v1/projects/:id",
      "POST /api/v1/projects/:id/passcode",
      "POST /api/v1/projects/:id/milestones",
      "PATCH /api/v1/projects/:id/milestones",
      "POST /api/v1/projects/:id/deliverables",
      "PATCH /api/v1/projects/:id/deliverables",
      "GET /api/v1/invoices",
      "POST /api/v1/invoices",
      "PATCH /api/v1/invoices",
      "GET /api/invoices/:id/pdf",
      "POST /api/portal/auth",
      "POST /api/portal/deliverables/:id/decision",
      "POST /api/portal/deliverables/:id/comments",
      "POST /api/uploads/sign",
      "POST /api/webhooks/stripe",
    ],
  });
}
