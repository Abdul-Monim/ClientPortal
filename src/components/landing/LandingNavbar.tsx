"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface LandingNavbarProps {
  samplePortalHref: string;
}

export function LandingNavbar({ samplePortalHref }: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="relative flex items-center justify-between pb-8 sm:pb-12 border-b border-neutral-100 dark:border-neutral-800/80">
        {/* Brand Logo & Editorial Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900 transition-transform group-hover:scale-105">
            <BrandLogo size={24} variant="adaptive" className="text-white dark:text-neutral-900" />
          </div>
          <span className="font-ui text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            ClientPortal
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-300 md:flex"
        >
          <a
            href="#about"
            className="hover:text-neutral-950 dark:hover:text-white transition"
          >
            About
          </a>
          <a
            href="#features"
            className="hover:text-neutral-950 dark:hover:text-white transition"
          >
            Features
          </a>
          <a
            href="#showcase"
            className="hover:text-neutral-950 dark:hover:text-white transition"
          >
            Interactive Tour
          </a>
          <a
            href="#pricing"
            className="hover:text-neutral-950 dark:hover:text-white transition"
          >
            Pricing
          </a>
          <Link
            href={samplePortalHref}
            className="hover:text-neutral-950 dark:hover:text-white transition inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            <span>Live Demo</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </nav>

        {/* Desktop Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Desktop Sign In / Get Started */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition px-3 py-2"
          >
            Sign in
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition items-center gap-2"
          >
            <span>Get started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile Hamburger Pill Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer with Animated Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-[#0E131C] p-6 shadow-2xl flex flex-col justify-between md:hidden border-l border-neutral-200 dark:border-neutral-800"
            >
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                      <BrandLogo size={18} variant="adaptive" className="text-white dark:text-neutral-900" />
                    </div>
                    <span className="font-ui text-lg font-bold text-neutral-900 dark:text-white">
                      ClientPortal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Navigation Jump Links */}
                <nav className="mt-6 flex flex-col gap-2">
                  <a
                    href="#about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                  >
                    <HelpCircle className="h-4 w-4 text-neutral-400" />
                    <span>About FreelanceOS</span>
                  </a>

                  <a
                    href="#features"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                  >
                    <Layers className="h-4 w-4 text-neutral-400" />
                    <span>Core Features</span>
                  </a>

                  <a
                    href="#showcase"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>Interactive Product Tour</span>
                  </a>

                  <a
                    href="#pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                  >
                    <CreditCard className="h-4 w-4 text-neutral-400" />
                    <span>Simple Pricing</span>
                  </a>

                  <Link
                    href={samplePortalHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-base font-medium text-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Client Portal Demo</span>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-full py-3 text-center text-sm font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition block"
                >
                  Sign In to Studio
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-full py-3.5 text-center text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Launch Free Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-neutral-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>14-day free trial &bull; No card required</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
