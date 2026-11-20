"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { CircularLoader } from "@/components/ui/CircularLoader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { freelancerLoginSchema, freelancerSignupSchema } from "@/domain/schemas";

interface AuthModuleProps {
  initialMode?: "login" | "signup";
}

function calculatePasswordStrength(pass: string): {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
} {
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-sky-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

export function AuthModule({ initialMode = "login" }: AuthModuleProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioSlug, setStudioSlug] = useState("");

  // Touched state for progressive validation feedback
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    studioName: false,
  });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isStudioNameValid = studioName.trim().length >= 2;
  const passwordStrength = calculatePasswordStrength(password);

  async function handleFastTrackDevLogin() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "dev@clientportal.local", password: "developer123" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Dev login failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Dev fast-track login error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, studioName: false });

    const parsed = freelancerLoginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || "Invalid credentials.");
      setShakeKey((prev) => prev + 1);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Invalid studio email or password.");
        setShakeKey((prev) => prev + 1);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error during authentication.");
      setShakeKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, studioName: true });

    const payload = {
      email: email.trim(),
      password,
      studioName: studioName.trim(),
      studioSlug: studioSlug.trim() ? studioSlug.trim() : undefined,
    };

    const parsed = freelancerSignupSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || "Please complete all required fields.");
      setShakeKey((prev) => prev + 1);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setConfirmationNotice(null);

      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Unable to register studio hub.");
        setShakeKey((prev) => prev + 1);
        return;
      }

      if (data.data?.requiresEmailConfirmation) {
        setConfirmationNotice(
          data.data.message ||
            "Studio created! Please check your email to confirm your studio address before signing in."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error during registration.");
      setShakeKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[95%] max-w-[1600px] mx-auto min-h-screen py-4 sm:py-8 flex items-center justify-center font-ui text-neutral-900 dark:text-neutral-100">
      <div className="w-full rounded-[2.5rem] border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#0B0F17] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] transition-colors duration-300">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Clean Minimalist Auth Experience (6 Cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Bar: Back to Home + Brand Mark + Theme Toggle */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-800/80">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700/80">
                  <BrandLogo size={20} variant="adaptive" />
                </div>
                <span className="font-ui text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  ClientPortal
                </span>
              </Link>

              <ThemeToggle />
            </div>

            {/* Mode Toggle Capsule (Sign In vs Create Studio) */}
            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex rounded-full bg-neutral-100 p-1 dark:bg-[#131926] ring-1 ring-neutral-200 dark:ring-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                    setConfirmationNotice(null);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-[#1E2536] dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                    setConfirmationNotice(null);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                    mode === "signup"
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-[#1E2536] dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  Create Studio Hub
                </button>
              </div>
            </div>

            {/* Title & Eyebrow */}
            <div className="mt-6 text-center space-y-1.5">
              <h1 className="font-ui text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {mode === "login" ? "Sign in to Studio" : "Launch Your Client Hub"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                {mode === "login"
                  ? "Access client approval pipelines, milestone progress, and branded invoices."
                  : "Give your clients a calm, password-protected hub for deliverables and invoices."}
              </p>
            </div>

            {/* Dev Fast-Track Card (Shown on Login Mode) */}
            {mode === "login" && !confirmationNotice && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Dev & Debugging Fast-Track
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    Local Demo
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                  Fast-track login with pre-populated demo studio (Atelier Vance, 5 client portals, invoices, and deliverables).
                </p>
                <button
                  type="button"
                  onClick={handleFastTrackDevLogin}
                  disabled={loading}
                  className="w-full rounded-full py-2.5 px-4 text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? <CircularLoader size="xs" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                  <span>1-Click Dev Sign-In (dev@clientportal.local)</span>
                </button>
              </div>
            )}

            {mode === "login" && !confirmationNotice && (
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                <span className="absolute bg-white dark:bg-[#0B0F17] px-3 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Or Sign In with Supabase Auth
                </span>
              </div>
            )}

            {/* Confirmation Banner */}
            {confirmationNotice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-300 space-y-2.5"
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Confirmation Link Dispatched</span>
                </div>
                <p className="text-xs leading-relaxed">{confirmationNotice}</p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline pt-1"
                >
                  <span>Switch to Sign In</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}

            {/* Form with Error Shake Animation */}
            {!confirmationNotice && (
              <motion.form
                key={shakeKey}
                animate={shakeKey > 0 ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
                transition={{ duration: 0.35 }}
                onSubmit={mode === "login" ? handleLogin : handleSignup}
                className="mt-6 space-y-4"
              >
                {/* Studio Name (Signup Only) */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Studio or Brand Name
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={studioName}
                        onChange={(e) => {
                          setStudioName(e.target.value);
                          if (!studioSlug) {
                            setStudioSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .slice(0, 40)
                            );
                          }
                        }}
                        onBlur={() => setTouched((p) => ({ ...p, studioName: true }))}
                        placeholder="Atelier Vance"
                        className={`w-full rounded-full border bg-neutral-50 dark:bg-[#111726] pl-11 pr-10 py-3 text-sm text-neutral-900 dark:text-white transition focus:outline-hidden ${
                          touched.studioName && isStudioNameValid
                            ? "border-emerald-500/80 ring-1 ring-emerald-500/30"
                            : "border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                        }`}
                        required
                      />
                      {touched.studioName && isStudioNameValid && (
                        <Check className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Studio Work Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      placeholder="you@yourstudio.com"
                      className={`w-full rounded-full border bg-neutral-50 dark:bg-[#111726] pl-11 pr-10 py-3 text-sm text-neutral-900 dark:text-white transition focus:outline-hidden ${
                        touched.email && isEmailValid
                          ? "border-emerald-500/80 ring-1 ring-emerald-500/30"
                          : touched.email && !isEmailValid
                          ? "border-rose-500/80 ring-1 ring-rose-500/30"
                          : "border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      }`}
                      required
                    />
                    {touched.email && isEmailValid && (
                      <Check className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Studio Password
                    </label>
                    <span className="text-[11px] text-neutral-400">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                      placeholder="••••••••••••"
                      className={`w-full rounded-full border bg-neutral-50 dark:bg-[#111726] pl-11 pr-11 py-3 text-sm text-neutral-900 dark:text-white transition focus:outline-hidden ${
                        touched.password && isPasswordValid
                          ? "border-emerald-500/80 ring-1 ring-emerald-500/30"
                          : "border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Signup Only) */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              idx < passwordStrength.score
                                ? passwordStrength.color
                                : "bg-neutral-200 dark:bg-neutral-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Password strength:</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Submit Action Pill Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full w-full py-3.5 text-sm font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <CircularLoader size="sm" tone={mode === "login" ? "white" : "white"} />
                      <span>{mode === "login" ? "Verifying..." : "Creating Studio..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Sign In to Studio" : "Launch Studio Hub"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </div>

          {/* Quick Direct Sandbox Access */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center space-y-2 mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full w-full py-2.5 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Instant Studio Sandbox (Zero Login Required)</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Cinematic Space Artistic Visual (6/7 Cols) */}
        {/* ========================================================= */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 p-4 sm:p-5">
          <div className="relative h-full min-h-[640px] w-full rounded-[2rem] overflow-hidden bg-[#0A0D14] flex flex-col justify-between p-8 text-white shadow-inner">
            {/* Background Cinematic Space Art */}
            <Image
              src="/hero-cosmic.jpg"
              alt="Freelancer floating across iridescent spacetime"
              fill
              priority
              className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            />

            {/* Gradient Overlays for Readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

            {/* Floating Top Pill Badges with Micro-motion */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white border border-white/15 shadow-xl"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>94.2% Approval Velocity</span>
              </motion.div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-neutral-300 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                <span>Encrypted Client Gate</span>
              </div>
            </div>

            {/* Floating Bottom Glassmorphic Feature Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-6 shadow-2xl max-w-lg space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
                  <Zap className="h-4 w-4" />
                </span>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sky-400">
                  White-Label Hub Invariant
                </span>
              </div>

              <blockquote className="font-ui text-xl sm:text-2xl font-bold leading-snug text-white">
                &ldquo;Give every client an unforgettable review experience. Close deliverables
                twice as fast with zero back-and-forth.&rdquo;
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-neutral-300">
                <span className="font-semibold text-white">ClientPortal Platform</span>
                <span className="text-neutral-400">Built for Freelancers & Independent Studios</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
