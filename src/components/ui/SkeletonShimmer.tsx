"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SkeletonShimmer({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/60",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#0C1017]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SkeletonText({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          className={cn(
            "h-3.5 rounded-full",
            i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonMetricsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121824] space-y-3"
        >
          <div className="flex items-center justify-between">
            <SkeletonShimmer className="h-8 w-8 rounded-lg" />
            <SkeletonShimmer className="h-5 w-14 rounded-full" />
          </div>
          <SkeletonShimmer className="h-8 w-24 rounded-lg mt-2" />
          <SkeletonShimmer className="h-3 w-32 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-3xl p-6 border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111726] space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonShimmer className="h-5 w-28 rounded-full" />
        <SkeletonShimmer className="h-4 w-36 rounded-full" />
      </div>
      <SkeletonShimmer className="h-56 w-full rounded-2xl" />
    </div>
  );
}
