"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Palette,
  Receipt,
} from "lucide-react";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", Icon: FolderKanban },
  { href: "/dashboard/invoices", label: "Invoices", Icon: Receipt },
  { href: "/dashboard/branding", label: "Branding", Icon: Palette },
];

export function DashboardNav({
  studioName,
  logoUrl,
  samplePortalPath,
  runtimeMode,
}: {
  studioName: string;
  logoUrl: string | null;
  samplePortalPath: string;
  runtimeMode: "cloud" | "sandbox";
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-full px-4 py-2 shadow-sm backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-3 pl-1">
          <BrandAvatar studioName={studioName} logoUrl={logoUrl} size="sm" />
          <div className="leading-tight">
            <span className="block font-ui text-lg font-bold">
              {studioName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              {runtimeMode === "cloud" ? "Live Studio" : "Studio Sandbox"}
            </span>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`pill-btn px-4 py-2 text-xs sm:text-sm ${
                  active
                    ? "pill-btn-brand"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-panel)] hover:text-[var(--ink-primary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={samplePortalPath}
            className="pill-btn pill-btn-outline hidden px-4 py-2 text-xs sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Client View</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
