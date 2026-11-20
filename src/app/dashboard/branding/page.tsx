import { BrandingStudio } from "@/components/dashboard/BrandingStudio";
import { getPortalRepository } from "@/infrastructure/repositories";
import { getAuthenticatedFreelancer } from "@/services/auth";

export default async function BrandingPage() {
  const freelancer = await getAuthenticatedFreelancer();
  const repo = getPortalRepository();
  const studio = await repo.getStudioForOwner(freelancer?.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">White-Label Experience</p>
        <h1 className="mt-1 font-ui text-3xl font-bold sm:text-4xl tracking-tight">
          Branding & Custom Domain
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Customize how your studio appears across every password-protected client portal
          and downloadable PDF invoice.
        </p>
      </div>

      <BrandingStudio studio={studio} />
    </div>
  );
}
