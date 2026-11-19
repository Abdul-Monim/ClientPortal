export type RuntimeMode = "cloud" | "sandbox";

export function isSupabaseConfigured(): boolean {
  if (process.env.PORTAL_STORAGE_MODE === "sandbox") {
    return false;
  }
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getRuntimeMode(): RuntimeMode {
  return isSupabaseConfigured() ? "cloud" : "sandbox";
}

export function getAppDomain(): string {
  return (process.env.NEXT_PUBLIC_APP_DOMAIN?.trim() || "localhost:3000").toLowerCase();
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

export function getPortalSessionSecret(): string {
  const configured = process.env.PORTAL_SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  return "clientportal-local-dev-session-secret-change-in-production";
}
