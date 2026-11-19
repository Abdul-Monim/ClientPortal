import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const RESERVED_PREFIXES = ["/_next", "/api", "/p", "/dashboard", "/login", "/signup", "/favicon"];

function normalizeHost(rawHost: string | null): string {
  return (rawHost ?? "").trim().toLowerCase();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = normalizeHost(request.headers.get("host"));
  const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000").toLowerCase();

  // 1. White-label custom domain or studio subdomain rewriting
  const hostnameOnly = host.split(":")[0] ?? "";
  const appHostnameOnly = appDomain.split(":")[0] ?? "";
  const isPrimaryHost =
    !host ||
    host === appDomain ||
    hostnameOnly === appHostnameOnly ||
    hostnameOnly === "localhost" ||
    hostnameOnly === "127.0.0.1" ||
    hostnameOnly.endsWith(".vercel.app");

  const isReservedPath = RESERVED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isPrimaryHost && !isReservedPath) {
    const url = request.nextUrl.clone();
    const cleanedPath = pathname === "/" ? "" : pathname;
    url.pathname = `/p/_domain/${encodeURIComponent(host)}${cleanedPath}`;
    return NextResponse.rewrite(url);
  }

  // 2. Supabase Auth session refresh when cloud credentials are active
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>
      ) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Network or token refresh exception
  }

  const hasSandboxSession = Boolean(
    request.cookies.get("cp_freelancer_session")?.value ||
      process.env.PORTAL_STORAGE_MODE === "sandbox"
  );

  if (!user && !hasSandboxSession && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
