import { redirect } from "next/navigation";
import { buildBrandThemeTokens } from "@/domain/theme";
import { HostySidebar } from "@/components/dashboard/HostySidebar";
import { getRuntimeMode } from "@/infrastructure/config/env";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export const dynamic = "force-dynamic";

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
      className="min-h-screen bg-[#F3F4F6] text-neutral-900 dark:bg-[#070A0F] dark:text-neutral-100 transition-colors duration-200"
      style={
        {
          "--brand-accent": tokens.accentHex,
          "--brand-accent-fg": tokens.accentForegroundHex,
          "--brand-accent-soft": tokens.accentSoftRgba,
          "--brand-accent-border": tokens.accentBorderRgba,
        } as React.CSSProperties
      }
    >
      {/* 95% Viewport Width Container strictly enforcing <= 5% total side margin */}
      <div className="w-[95%] max-w-[1760px] mx-auto py-3 sm:py-5">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <HostySidebar
            studioName={studio.studioName}
            logoUrl={studio.logoUrl}
            samplePortalPath={samplePortalPath}
            runtimeMode={getRuntimeMode()}
          />
          <main className="w-full flex-1 min-w-0 pb-16">{children}</main>
        </div>
      </div>
    </div>
  );
}
