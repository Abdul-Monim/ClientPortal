"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SplineSeriesPoint, StudioAnalyticsPayload } from "@/domain/analytics";

interface HostyAnalyticsViewProps {
  initialData?: StudioAnalyticsPayload;
}

// Fallback high-fidelity sample data matching the reference comp
const DEFAULT_SPLINE_DATA = [
  { time: "8 AM", primary: 720, secondary: 980, label: "08:00" },
  { time: "10 AM", primary: 850, secondary: 1100, label: "10:00" },
  { time: "12 PM", primary: 680, secondary: 920, label: "12:00" },
  { time: "2 PM", primary: 1056, secondary: 689, label: "14:00" },
  { time: "4 PM", primary: 940, secondary: 1180, label: "16:00" },
  { time: "6 PM", primary: 1220, secondary: 840, label: "18:00" },
  { time: "8 PM", primary: 1110, secondary: 1020, label: "20:00" },
];

const GAUGE_SEGMENTS = [
  { name: "200 Approved", value: 3580, pct: "22.5%", color: "#A3E635" }, // Lime
  { name: "300 In Review", value: 4160, pct: "27.2%", color: "#38BDF8" }, // Sky
  { name: "400 Changes", value: 3820, pct: "24.0%", color: "#FB923C" }, // Peach / Orange
  { name: "500 Draft", value: 4360, pct: "26.3%", color: "#64748B" }, // Slate
];

const FILTER_TABS = [
  "Resources",
  "CDN Usage",
  "Response",
  "Cache",
  "Geo & IP",
] as const;

export function HostyAnalyticsView({ initialData }: HostyAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<string>("Response");
  const [activeThemeMode, setActiveThemeMode] = useState<"light" | "dark" | "split">("split");

  // Format spline series from initialData or fallback
  const chartData = initialData?.activitySpline?.length
    ? initialData.activitySpline.map((p: SplineSeriesPoint, idx: number) => ({
        time: p.label,
        primary: p.primaryValue * 400 + 650 + (idx % 2 === 0 ? 150 : -100),
        secondary: p.secondaryValue * 350 + 720 + (idx % 3 === 0 ? 200 : -150),
        label: p.label,
      }))
    : DEFAULT_SPLINE_DATA;

  const totalGaugeValue = GAUGE_SEGMENTS.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="w-full space-y-6">
      {/* Viewport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time client hub responses, approval velocities, and deliverable health.
          </p>
        </div>

        {/* Split / Theme Selector Orb */}
        <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => setActiveThemeMode("light")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeThemeMode === "light"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Sun className="inline-block h-3.5 w-3.5 mr-1" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setActiveThemeMode("split")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeThemeMode === "split"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setActiveThemeMode("dark")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeThemeMode === "dark"
                ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Moon className="inline-block h-3.5 w-3.5 mr-1" />
            Dark
          </button>
        </div>
      </div>

      {/* Main Container with Optional Split Layout */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] border border-neutral-200/80 bg-white shadow-xl transition-colors duration-300 dark:border-neutral-800 dark:bg-[#0B0F17] ${
          activeThemeMode === "dark" ? "dark bg-[#0B0F17]" : ""
        }`}
      >
        {/* Split View Divider Element (When Split View is Active) */}
        {activeThemeMode === "split" && (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden -translate-x-1/2 lg:flex flex-col items-center justify-center">
            <div className="h-full w-[2px] bg-blue-500/80" />
            <div className="absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white dark:ring-neutral-900">
              <Moon className="h-4 w-4" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ========================================================= */}
          {/* LEFT HALF (Light Aesthetic or Full Light) */}
          {/* ========================================================= */}
          <div
            className={`p-6 sm:p-8 space-y-6 ${
              activeThemeMode === "dark" ? "bg-[#0B0F17] text-white" : "bg-[#FAFBFD] text-neutral-900"
            }`}
          >
            {/* Header Filter Pill Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_TABS.slice(0, 4).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:text-white ring-1 ring-neutral-200 dark:ring-neutral-700/60"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Response stats
            </div>

            {/* 2 Pastel KPI Cards on Left (Sky & Lime) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Soft Sky Blue Pastel */}
              <div className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-sm transition hover:shadow-md dark:bg-[#162738] dark:text-[#BAE6FD]">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-200/60 text-[#133E53] dark:bg-sky-900/50 dark:text-sky-300">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    +5.78%
                  </span>
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight">45,940</div>
                <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Redirects & Hub Hits
                </div>
              </div>

              {/* Card 2: Soft Mint Lime Pastel */}
              <div className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-sm transition hover:shadow-md dark:bg-[#1A3320] dark:text-[#BBF7D0]">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200/60 text-[#1F4E24] dark:bg-emerald-900/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    +3.85%
                  </span>
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight">56.1%</div>
                <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Success rate
                </div>
              </div>
            </div>

            {/* Left Chart View: Response Velocity Line Spline */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 dark:bg-[#121824] dark:ring-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Response
                </span>
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />
                    Primary
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-lime-500" />
                    Breakdown
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="primaryLightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E293B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1E293B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[300, 1500]}
                      ticks={[300, 600, 900, 1200, 1500]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length && payload[0]?.payload) {
                          const p = payload[0].payload as { label: string; primary: number; secondary: number };
                          return (
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs text-white shadow-xl">
                              <p className="font-semibold text-neutral-300 mb-1">{p.label}</p>
                              <p className="flex items-center justify-between gap-3 text-white">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                  Primary:
                                </span>
                                <span className="font-bold">{p.primary}</span>
                              </p>
                              <p className="flex items-center justify-between gap-3 text-lime-400">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                                  Breakdown:
                                </span>
                                <span className="font-bold">{p.secondary}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="primary"
                      stroke="#1E293B"
                      strokeWidth={2.5}
                      fill="url(#primaryLightGrad)"
                      dot={{ r: 4, stroke: "#1E293B", strokeWidth: 2, fill: "#FFFFFF" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="secondary"
                      stroke="#84CC16"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT HALF (Dark Obsidian Aesthetic or Full Dark) */}
          {/* ========================================================= */}
          <div
            className={`p-6 sm:p-8 space-y-6 ${
              activeThemeMode === "light"
                ? "bg-white text-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-200"
                : "bg-[#0E131F] text-white"
            }`}
          >
            {/* Top Right Header with Pill Filter & Search Orb */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-full bg-neutral-800/70 px-4 py-1.5 text-xs font-medium text-neutral-300 ring-1 ring-neutral-700/60 hover:bg-neutral-700"
              >
                Geo & IP
              </button>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:text-white">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 ring-2 ring-neutral-700" />
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              System health & errors
            </div>

            {/* 2 Pastel KPI Cards on Right (Peach & Dark Slate) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 3: Soft Peach / Warm Apricot */}
              <div className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-sm transition hover:shadow-md dark:bg-[#3D2516] dark:text-[#FED7AA]">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/60 text-[#7C2D12] dark:bg-amber-900/50 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    <ArrowUpRight className="h-3 w-3 text-amber-600" />
                    +1.64%
                  </span>
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight">3,100</div>
                <div className="mt-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Errors & Exceptions
                </div>
              </div>

              {/* Card 4: Dark Slate / Neutral Slate */}
              <div className="rounded-2xl bg-neutral-800/90 p-5 text-neutral-200 shadow-sm transition hover:shadow-md dark:bg-[#1A202C] dark:text-neutral-100 ring-1 ring-neutral-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-700/80 text-neutral-200">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-700 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                    <ArrowUpRight className="h-3 w-3 text-sky-400" />
                    +3.26%
                  </span>
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight">36.2%</div>
                <div className="mt-1 text-xs font-medium text-neutral-400">
                  Error ratio
                </div>
              </div>
            </div>

            {/* Right Chart View: Response Code Breakdown Gauge */}
            <div className="rounded-2xl bg-neutral-900/80 p-5 shadow-sm ring-1 ring-neutral-800 dark:bg-[#121824]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">
                  Response code breakdown
                </span>
                <span className="text-xs text-neutral-400">Active distribution</span>
              </div>

              {/* Semi-Circular Donut Gauge */}
              <div className="relative flex flex-col items-center justify-center pt-2">
                <div className="h-40 w-full max-w-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={GAUGE_SEGMENTS}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="95%"
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {GAUGE_SEGMENTS.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Center Callout inside the Arc */}
                <div className="absolute bottom-5 flex flex-col items-center">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {totalGaugeValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 2-Column Legend Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800 text-xs">
                {GAUGE_SEGMENTS.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-neutral-300 font-medium truncate">{seg.name}</span>
                    </div>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {seg.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
