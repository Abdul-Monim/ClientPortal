"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Sparkles,
  X,
} from "lucide-react";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HostySidebarProps {
  studioName: string;
  logoUrl: string | null;
  samplePortalPath: string;
  runtimeMode: "cloud" | "sandbox";
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    sublabel: "Overview & Analytics",
    Icon: LayoutDashboard,
  },
  {
    href: "/dashboard/projects",
    label: "Portals",
    sublabel: "Client Workspaces",
    Icon: FolderKanban,
  },
  {
    href: "/dashboard/invoices",
    label: "Invoices",
    sublabel: "Billing & Settlement",
    Icon: Receipt,
  },
  {
    href: "/dashboard/branding",
    label: "Branding",
    sublabel: "White-Label Studio",
    Icon: Palette,
  },
];

export function HostySidebar({
  studioName,
  logoUrl,
  samplePortalPath,
  runtimeMode,
}: HostySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP PERPETUAL SIDEBAR (Collapsible)               */}
      {/* ========================================================= */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col justify-between rounded-[2rem] bg-[#0A0E17] text-neutral-300 p-4 shadow-2xl border border-neutral-800/80 sticky top-4 h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out ${
          collapsed ? "w-20 items-center" : "w-64"
        }`}
      >
        <div className="space-y-6 w-full">
          {/* Logo & Brand Identity matching Hosty aesthetic */}
          <div className={`flex items-center ${collapsed ? "flex-col gap-3 justify-center" : "justify-between"} px-1`}>
            <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 text-white shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform">
                <Globe className="h-5 w-5 text-sky-400" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="block font-editorial text-2xl font-bold tracking-tight text-white truncate">
                    ClientPortal.
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium truncate">
                    {runtimeMode === "cloud" ? "Live Cloud" : "Studio Sandbox"}
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition ring-1 ring-neutral-800 shrink-0"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 pt-2">
            {NAV_ITEMS.map(({ href, label, sublabel, Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`group flex items-center ${
                    collapsed ? "justify-center px-0 py-2.5 w-12 mx-auto" : "gap-3 px-3.5 py-2.5"
                  } rounded-2xl text-xs font-medium transition-all ${
                    active
                      ? "bg-neutral-800/90 text-white shadow-sm ring-1 ring-white/10"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                      active
                        ? "bg-white text-neutral-950 shadow-xs"
                        : "bg-neutral-800/60 text-neutral-400 group-hover:text-white group-hover:bg-neutral-700/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!collapsed && (
                    <div className="truncate">
                      <span className="block font-medium truncate">{label}</span>
                      <span className="block text-[10px] text-neutral-400 opacity-80 truncate">
                        {sublabel}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Studio Profile & Quick Actions */}
        <div className={`space-y-3 pt-4 border-t border-neutral-800/80 w-full ${collapsed ? "flex flex-col items-center" : ""}`}>
          {/* Quick Client View Capsule */}
          {!collapsed ? (
            <Link
              href={samplePortalPath}
              target="_blank"
              className="flex items-center justify-between rounded-full bg-neutral-800/60 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition ring-1 ring-neutral-700/50"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Live Client Hub</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
            </Link>
          ) : (
            <Link
              href={samplePortalPath}
              target="_blank"
              title="Live Client Hub"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/60 text-neutral-300 hover:text-white transition ring-1 ring-neutral-700/50"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
            </Link>
          )}

          {/* Freelancer Studio Card */}
          {!collapsed ? (
            <div className="flex items-center justify-between rounded-2xl bg-neutral-900/90 p-3 ring-1 ring-neutral-800">
              <div className="flex items-center gap-2.5 truncate">
                <BrandAvatar studioName={studioName} logoUrl={logoUrl} size="sm" />
                <div className="truncate">
                  <span className="block text-xs font-semibold text-white truncate">
                    {studioName}
                  </span>
                  <span className="block text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 pl-1">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  aria-label="Sign out"
                  title="Sign out of studio"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/80 transition disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Sign out"
                title="Sign out of studio"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/80 transition disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE HEADER & NAVIGATION (Visible on <lg screens) */}
      {/* ========================================================= */}
      <div className="lg:hidden sticky top-3 z-40 mb-6">
        <div className="flex items-center justify-between rounded-full bg-[#0A0E17] text-white px-5 py-2.5 shadow-xl border border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-sky-400" />
            <span className="font-editorial text-xl font-bold tracking-tight">
              ClientPortal.
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-3xl bg-[#0A0E17] border border-neutral-800 p-4 shadow-2xl space-y-2">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-neutral-800 text-white ring-1 ring-white/10"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-neutral-800">
              <Link
                href={samplePortalPath}
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-neutral-800/60 px-4 py-2.5 text-xs text-neutral-300"
              >
                <span>Live Client View</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
