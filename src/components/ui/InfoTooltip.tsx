"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface InfoTooltipProps {
  title: string;
  content: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  align?: "left" | "right" | "center";
  className?: string;
}

export function InfoTooltip({
  title,
  content,
  learnMoreHref,
  learnMoreLabel = "Learn more",
  align = "right",
  className = "",
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses =
    align === "left"
      ? "left-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Help: ${title}`}
        title={`Help: ${title}`}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white transition focus:outline-hidden ring-1 ring-neutral-200 dark:ring-neutral-700"
      >
        <HelpCircle className="h-3 w-3" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute top-full mt-2 z-50 w-72 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-[#111726] ${alignmentClasses} animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
              {title}
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white transition"
              aria-label="Close tooltip"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            {content}
          </p>

          {learnMoreHref && (
            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <Link
                href={learnMoreHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>{learnMoreLabel}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
