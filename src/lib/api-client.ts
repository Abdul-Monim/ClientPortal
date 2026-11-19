import type { StudioAnalyticsPayload } from "@/domain/analytics";
import type { Invoice, Studio } from "@/domain/types";
import type {
  PublicProjectBundleDTO,
  PublicProjectDTO,
} from "@/infrastructure/http/api-response";

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? `Request failed (${response.status}).`);
  }
  return payload.data;
}

export const clientPortalApi = {
  getHealth: () =>
    requestJson<{
      status: string;
      runtimeMode: "cloud" | "sandbox";
      integrations: Record<string, boolean>;
    }>("/api/v1/health"),

  getStudio: () => requestJson<Studio>("/api/v1/studio"),

  updateStudio: (body: Record<string, unknown>) =>
    requestJson<Studio>("/api/v1/studio", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getAnalytics: () => requestJson<StudioAnalyticsPayload>("/api/v1/analytics"),

  listProjects: () =>
    requestJson<Array<PublicProjectDTO & { progressPct: number }>>("/api/v1/projects"),

  getProject: (projectId: string) =>
    requestJson<PublicProjectBundleDTO>(`/api/v1/projects/${projectId}`),

  createProject: (body: Record<string, unknown>) =>
    requestJson<PublicProjectDTO>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listInvoices: () =>
    requestJson<{
      invoices: Array<Invoice & { projectTitle: string; clientCompany: string }>;
      summary: {
        totalBilledCents: number;
        totalPaidCents: number;
        totalOutstandingCents: number;
        totalOverdueCents: number;
      };
    }>("/api/v1/invoices"),
};
