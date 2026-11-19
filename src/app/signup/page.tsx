"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Lock, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard/branding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-canvas)] px-4 py-12">
      <div className="mb-8 flex w-full max-w-md items-center justify-between">
        <Link href="/" className="pill-btn pill-btn-outline px-4 py-2 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="surface-card w-full max-w-md rounded-[2rem] p-8 shadow-sm">
        <p className="eyebrow">Create Your Hub</p>
        <h1 className="mt-2 font-editorial text-4xl font-semibold">
          Launch your client portal
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          Set up your white-label studio identity in under two minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Studio or Freelance Brand Name
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Atelier Vance"
                className="field-input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Work Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@yourstudio.com"
                className="field-input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--ink-secondary)]">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="field-input pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" className="pill-btn pill-btn-brand w-full py-3 text-sm">
            <span>Create Studio Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--ink-muted)]">
          Already have a studio?{" "}
          <Link href="/login" className="font-medium text-[var(--ink-primary)] underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
