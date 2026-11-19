import { notFound } from "next/navigation";
import { buildBrandThemeTokens } from "@/domain/theme";
import { ClientPortalHub } from "@/components/portal/ClientPortalHub";
import { PasscodeGate } from "@/components/portal/PasscodeGate";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getVerifiedClientPortalSession } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ studio: string; project: string }>;
}) {
  const { studio: studioSlug, project: projectSlug } = await params;
  const repo = getPortalRepository();
  const bundle = await repo.getProjectBundleBySlugs(studioSlug, projectSlug);

  if (!bundle) {
    notFound();
  }

  const tokens = buildBrandThemeTokens(bundle.studio.accentHex);
  const session = await getVerifiedClientPortalSession(
    bundle.project.id,
    bundle.project.passcodeVersion
  );

  const brandStyle = {
    "--brand-accent": tokens.accentHex,
    "--brand-accent-fg": tokens.accentForegroundHex,
    "--brand-accent-soft": tokens.accentSoftRgba,
    "--brand-accent-border": tokens.accentBorderRgba,
  } as React.CSSProperties;

  if (!session) {
    return (
      <div style={brandStyle}>
        <PasscodeGate
          studioName={bundle.studio.studioName}
          studioSlug={bundle.studio.slug}
          studioLogoUrl={bundle.studio.logoUrl}
          welcomeMessage={bundle.studio.welcomeMessage}
          contactEmail={bundle.studio.contactEmail}
          projectSlug={bundle.project.slug}
          projectTitle={bundle.project.title}
          clientCompany={bundle.project.clientCompany}
          passcodeHint={bundle.project.passcodeHint}
        />
      </div>
    );
  }

  return (
    <div style={brandStyle}>
      <ClientPortalHub bundle={bundle} />
    </div>
  );
}
