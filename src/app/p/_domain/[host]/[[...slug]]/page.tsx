import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { buildBrandThemeTokens } from "@/domain/theme";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

export default async function CustomDomainPortalResolver({
  params,
}: {
  params: Promise<{ host: string; slug?: string[] }>;
}) {
  const { host, slug } = await params;
  const decodedHost = decodeURIComponent(host).split(":")[0] ?? host;
  const repo = getPortalRepository();
  const studio = await repo.getStudioByCustomDomain(decodedHost);

  if (!studio) {
    notFound();
  }

  const projectSlug = slug?.[0];
  if (projectSlug) {
    redirect(`/p/${studio.slug}/${projectSlug}`);
  }

  const projects = await repo.listProjects(studio.id);
  const tokens = buildBrandThemeTokens(studio.accentHex);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-canvas)] px-4 py-14"
      style={
        {
          "--brand-accent": tokens.accentHex,
          "--brand-accent-fg": tokens.accentForegroundHex,
          "--brand-accent-soft": tokens.accentSoftRgba,
          "--brand-accent-border": tokens.accentBorderRgba,
        } as React.CSSProperties
      }
    >
      <div className="surface-card w-full max-w-xl space-y-6 rounded-[2rem] p-8">
        <div className="flex items-center gap-3">
          <BrandAvatar
            studioName={studio.studioName}
            logoUrl={studio.logoUrl}
            size="lg"
          />
          <div>
            <p className="eyebrow">Client Directory</p>
            <h1 className="font-editorial text-4xl font-semibold">{studio.studioName}</h1>
          </div>
        </div>
        <p className="text-sm text-[var(--ink-secondary)]">{studio.welcomeMessage}</p>

        <div className="space-y-3">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/p/${studio.slug}/${proj.slug}`}
              className="surface-panel flex items-center justify-between gap-4 rounded-2xl p-4 transition hover:border-[var(--brand-accent)]"
            >
              <div>
                <p className="font-medium">{proj.title}</p>
                <p className="text-xs text-[var(--ink-muted)]">{proj.clientCompany}</p>
              </div>
              <span className="pill-btn pill-btn-brand px-4 py-2 text-xs">
                <Lock className="h-3.5 w-3.5" />
                <span>Enter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
