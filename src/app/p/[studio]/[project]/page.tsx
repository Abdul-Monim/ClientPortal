import { notFound } from "next/navigation";
import { buildBrandThemeTokens } from "@/domain/theme";
import { ClientPortalHub } from "@/components/portal/ClientPortalHub";
import { PasscodeGate } from "@/components/portal/PasscodeGate";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getVerifiedClientPortalSession, getAuthenticatedFreelancer } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ studio: string; project: string }>;
  searchParams?: Promise<{ passcode?: string; unlock?: string; demo?: string }>;
}) {
  const { studio: studioSlug, project: projectSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const repo = getPortalRepository();
  const bundle = await repo.getProjectBundleBySlugs(studioSlug, projectSlug);

  if (!bundle) {
    notFound();
  }

  const tokens = buildBrandThemeTokens(bundle.studio.accentHex);
  const [session, freelancer] = await Promise.all([
    getVerifiedClientPortalSession(bundle.project.id, bundle.project.passcodeVersion),
    getAuthenticatedFreelancer(),
  ]);

  const demoPasscode = bundle.project.passcodeHint
    ? bundle.project.passcodeHint.replace(/^Demo passcode:\s*/i, "").trim()
    : `${bundle.project.slug.split("-")[0]}2026`;

  const isOwnerViewing = Boolean(freelancer);
  const isQueryUnlocked = Boolean(
    resolvedSearchParams.unlock === "1" ||
      resolvedSearchParams.demo === "1" ||
      (resolvedSearchParams.passcode &&
        resolvedSearchParams.passcode.toLowerCase() === demoPasscode.toLowerCase())
  );

  const brandStyle = {
    "--brand-accent": tokens.accentHex,
    "--brand-accent-fg": tokens.accentForegroundHex,
    "--brand-accent-soft": tokens.accentSoftRgba,
    "--brand-accent-border": tokens.accentBorderRgba,
  } as React.CSSProperties;

  if (!session && !isOwnerViewing && !isQueryUnlocked) {
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
          demoPasscode={demoPasscode}
        />
      </div>
    );
  }

  return (
    <div style={brandStyle}>
      <ClientPortalHub bundle={bundle} isOwnerPreview={isOwnerViewing} />
    </div>
  );
}
