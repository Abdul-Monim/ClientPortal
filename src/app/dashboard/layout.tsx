import { redirect } from "next/navigation";
import { buildBrandThemeTokens } from "@/domain/theme";

export const dynamic = "force-dynamic";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getRuntimeMode } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const freelancer = await getAuthenticatedFreelancer();
  if (!freelancer) {
    redirect("/login");
  }

  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer.id);
  const projects = await repo.listProjects(studio.id);
  const samplePortalPath = projects[0]
    ? `/p/${studio.slug}/${projects[0].slug}`
    : "/dashboard/projects";

  const tokens = buildBrandThemeTokens(studio.accentHex);

  return (
    <div
      className="min-h-screen bg-[var(--surface-canvas)] text-[var(--ink-primary)] pb-20"
      style={
        {
          "--brand-accent": tokens.accentHex,
          "--brand-accent-fg": tokens.accentForegroundHex,
          "--brand-accent-soft": tokens.accentSoftRgba,
          "--brand-accent-border": tokens.accentBorderRgba,
        } as React.CSSProperties
      }
    >
      <DashboardNav
        studioName={studio.studioName}
        logoUrl={studio.logoUrl}
        samplePortalPath={samplePortalPath}
        runtimeMode={getRuntimeMode()}
      />
      <main className="mx-auto max-w-6xl px-4 pt-8">{children}</main>
    </div>
  );
}
