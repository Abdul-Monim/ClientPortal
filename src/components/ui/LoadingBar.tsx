"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LoadingBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => {
      setActive(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] pointer-events-none transition-all duration-300 animate-pulse"
    />
  );
}
