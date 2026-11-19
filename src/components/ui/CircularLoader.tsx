"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CircularLoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  tone?: "brand" | "white" | "sky" | "emerald";
}

const SIZE_MAP = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[2.5px]",
  lg: "h-8 w-8 border-3",
};

const TONE_MAP = {
  brand: "border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white",
  white: "border-white/30 border-t-white",
  sky: "border-sky-200 border-t-sky-500 dark:border-sky-900/60 dark:border-t-sky-400",
  emerald: "border-emerald-200 border-t-emerald-500 dark:border-emerald-900/60 dark:border-t-emerald-400",
};

export function CircularLoader({
  size = "md",
  tone = "brand",
  className,
}: CircularLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full animate-spin transition-colors duration-150",
        SIZE_MAP[size],
        TONE_MAP[tone],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
