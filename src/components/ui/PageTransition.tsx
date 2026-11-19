"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MotionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
