import { describe, expect, it } from "vitest";
import { buildStudioAnalytics } from "@/domain/analytics";
import { SandboxPortalRepository } from "@/infrastructure/repositories/sandbox-repository";

describe("studio analytics telemetry engine", () => {
  it("computes KPI cards, 7-point spline series, and segmented breakdown arcs", async () => {
    const repo = new SandboxPortalRepository(":memory:");
    const studio = await repo.getStudioForOwner();
    const projects = await repo.listProjects(studio.id);
    const bundles = (
      await Promise.all(projects.map((p) => repo.getProjectBundleById(p.id)))
    ).filter((b): b is NonNullable<typeof b> => Boolean(b));
    const invoices = await repo.listInvoicesForStudio(studio.id);
    const activities = await repo.listRecentStudioActivities(studio.id, 30);

    const analytics = buildStudioAnalytics({
      bundles,
      invoices,
      activities,
      referenceDate: new Date("2026-11-19T12:00:00.000Z"),
    });

    expect(analytics.kpis).toHaveLength(4);
    expect(analytics.kpis[0]?.numericValue).toBe(2);
    expect(analytics.activitySpline).toHaveLength(7);
    expect(analytics.deliverableBreakdown.total).toBe(4);
    expect(analytics.deliverableBreakdown.segments).toHaveLength(4);
    expect(analytics.invoiceBreakdown.total).toBe(3);
    expect(analytics.invoiceBreakdown.totalBilledCents).toBe(1_108_000);
    expect(analytics.projectProgressSummary).toHaveLength(2);
  });

  it("handles empty studio data gracefully without divide-by-zero", () => {
    const analytics = buildStudioAnalytics({
      bundles: [],
      invoices: [],
      activities: [],
      referenceDate: new Date("2026-11-19T12:00:00.000Z"),
    });

    expect(analytics.kpis[0]?.numericValue).toBe(0);
    expect(analytics.kpis[1]?.numericValue).toBe(100);
    expect(analytics.deliverableBreakdown.total).toBe(0);
    expect(analytics.invoiceBreakdown.total).toBe(0);
    expect(analytics.activitySpline).toHaveLength(7);
  });
});
