"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Layers,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
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
  studioName?: string;
}

const DEFAULT_SPLINE_DATA = [
  { time: "8 AM", primary: 720, secondary: 980, label: "08:00 AM" },
  { time: "10 AM", primary: 850, secondary: 1100, label: "10:00 AM" },
  { time: "12 PM", primary: 680, secondary: 920, label: "12:00 PM" },
  { time: "2 PM", primary: 1056, secondary: 689, label: "02:00 PM" },
  { time: "4 PM", primary: 940, secondary: 1180, label: "04:00 PM" },
  { time: "6 PM", primary: 1220, secondary: 840, label: "06:00 PM" },
  { time: "8 PM", primary: 1110, secondary: 1020, label: "08:00 PM" },
];

const GAUGE_SEGMENTS = [
  { name: "200 Approved", value: 3580, pct: "22.5%", color: "#A3E635" }, // Lime
  { name: "300 In Review", value: 4160, pct: "27.2%", color: "#38BDF8" }, // Sky
  { name: "400 Changes", value: 3820, pct: "24.0%", color: "#FB923C" }, // Peach / Orange
  { name: "500 Draft", value: 4360, pct: "26.3%", color: "#64748B" }, // Slate
];

const FILTER_TABS = [
  { id: "Resources", label: "Resources" },
  { id: "CDN Usage", label: "CDN Usage" },
  { id: "Response", label: "Response" },
  { id: "Cache", label: "Cache" },
  { id: "Geo & IP", label: "Geo & IP" },
] as const;

export function HostyAnalyticsView({ initialData, studioName }: HostyAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<string>("Response");
  const [viewMode, setViewMode] = useState<"dark" | "light" | "split">("dark");

  const chartData = initialData?.activitySpline?.length
    ? initialData.activitySpline.map((p: SplineSeriesPoint, idx: number) => ({
        time: p.label,
        primary: p.primaryValue * 400 + 650 + (idx % 2 === 0 ? 150 : -100),
        secondary: p.secondaryValue * 350 + 720 + (idx % 3 === 0 ? 200 : -150),
        label: p.label,
      }))
    : DEFAULT_SPLINE_DATA;

  const totalGaugeValue = GAUGE_SEGMENTS.reduce((sum, s) => sum + s.value, 0);

  const isDark = viewMode === "dark";
  const isSplit = viewMode === "split";

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Studio Badge & Theme Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {studioName ? `${studioName} Portal Hub` : "FreelanceOS Hub"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live client interactions, approval telemetry, and milestone velocity.
            </p>
          </div>
        </div>

        {/* View mode toggle (Dark / Split View / Light) */}
        <div className="flex items-center gap-1 rounded-full bg-neutral-200/70 p-1 dark:bg-[#111622] ring-1 ring-neutral-300 dark:ring-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode("dark")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              viewMode === "dark"
                ? "bg-[#1E2536] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Moon className="inline-block h-3.5 w-3.5 mr-1 text-blue-400" />
            Dark Mode
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              viewMode === "split"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Split Showcase
          </button>
          <button
            type="button"
            onClick={() => setViewMode("light")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              viewMode === "light"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Sun className="inline-block h-3.5 w-3.5 mr-1 text-amber-500" />
            Light
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN HOSTY ANALYTICS BOARD                                              */}
      {/* ========================================================================= */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 shadow-2xl ${
          isDark
            ? "border-neutral-800 bg-[#0B0F17] text-white"
            : isSplit
            ? "border-neutral-700/80 bg-neutral-900"
            : "border-neutral-200 bg-white text-neutral-900"
        }`}
      >
        {/* Split Divider when in Split Showcase mode */}
        {isSplit && (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden -translate-x-1/2 lg:flex flex-col items-center justify-center">
            <div className="h-full w-[2px] bg-blue-500 shadow-sm" />
            <div className="absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-[#0B0F17]">
              <Moon className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TOP BAR: Title, Filter Pills, and Search/Bell/Avatar Orbs                */}
        {/* ======================================================================= */}
        <div
          className={`flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
            isDark
              ? "border-neutral-800/80 bg-[#0B0F17]"
              : isSplit
              ? "border-neutral-800 bg-[#0E131F]"
              : "border-neutral-200/80 bg-white"
          }`}
        >
          {/* Left Title and Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#D9F1FD] text-[#0369A1] ring-1 ring-sky-300 dark:bg-[#1E3A5F] dark:text-[#7DD3FC] dark:ring-sky-500/50"
                        : isDark || isSplit
                        ? "bg-[#151C2A] text-neutral-300 hover:bg-[#1E2738] ring-1 ring-neutral-700/60"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 ring-1 ring-neutral-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Orbs: Search, Notification Bell, User Avatar */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              aria-label="Search"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                isDark || isSplit
                  ? "bg-[#151C2A] text-neutral-400 hover:bg-[#1E2738] hover:text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${
                isDark || isSplit
                  ? "bg-[#151C2A] text-neutral-400 hover:bg-[#1E2738] hover:text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>

            {/* Stylized User Avatar matching the orange illustrated avatar in reference */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 text-white font-bold text-xs ring-2 ring-neutral-700 shadow-xs">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* DASHBOARD CONTENT BODY                                                  */}
        {/* ======================================================================= */}
        <div className="p-6 sm:p-8 space-y-7">
          {/* Eyebrow Label */}
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Response stats
          </div>

          {/* ===================================================================== */}
          {/* 4 PASTEL KPI CARDS ROW WITH MOTION LIFT                              */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Pastel Sky Blue */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs transition hover:shadow-md dark:bg-[#132A3E] dark:text-[#BAE6FD]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-200/70 text-[#133E53] dark:bg-sky-800/50 dark:text-sky-200">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-800 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  +5.78%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">45,940</div>
              <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Redirects
              </div>
            </motion.div>

            {/* Card 2: Pastel Lime Green */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs transition hover:shadow-md dark:bg-[#1A3320] dark:text-[#BBF7D0]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200/70 text-[#1F4E24] dark:bg-emerald-800/50 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-800 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  +3.85%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">56.1%</div>
              <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Success rate
              </div>
            </motion.div>

            {/* Card 3: Pastel Peach / Apricot */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="rounded-2xl bg-[#FED7AA] p-5 text-[#7C2D12] shadow-xs transition hover:shadow-md dark:bg-[#3D2516] dark:text-[#FED7AA]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/70 text-[#7C2D12] dark:bg-amber-800/50 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  <ArrowUpRight className="h-3 w-3 text-amber-600" />
                  +1.64%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">3,100</div>
              <div className="mt-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Errors
              </div>
            </motion.div>

            {/* Card 4: Dark Slate / Neutral Slate */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="rounded-2xl bg-[#2B3037] p-5 text-neutral-100 shadow-xs transition hover:shadow-md ring-1 ring-neutral-700/60 dark:bg-[#18202F] dark:text-neutral-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-700/80 text-neutral-200">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-700 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  <ArrowUpRight className="h-3 w-3 text-sky-400" />
                  +3.26%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">36.2%</div>
              <div className="mt-1 text-xs font-semibold text-neutral-300">
                Error ratio
              </div>
            </motion.div>
          </div>

          {/* ===================================================================== */}
          {/* 2-COLUMN MAIN CHARTS ROW (Spline Wave & Gauge Donut)                   */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT CHART: Response Velocity Wave Curve (7 cols) */}
            <div
              className={`rounded-3xl p-6 shadow-sm ring-1 lg:col-span-7 ${
                isDark || isSplit
                  ? "bg-[#111726] ring-neutral-800 text-white"
                  : "bg-neutral-50/80 ring-neutral-200 text-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold">Response</span>
                <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white ring-1 ring-neutral-400" />
                    Error
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-lime-400" />
                    Breakdown
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hostySplineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
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
                            <div className="rounded-xl border border-neutral-700 bg-[#0F1420] p-3 text-xs text-white shadow-2xl min-w-[140px]">
                              <p className="font-bold text-neutral-300 mb-1.5 pb-1 border-b border-neutral-800">
                                Aug 4 • 22
                              </p>
                              <div className="space-y-1">
                                <p className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-1.5 text-neutral-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    Error
                                  </span>
                                  <span className="font-bold text-white">{p.primary}</span>
                                </p>
                                <p className="flex items-center justify-between gap-3 text-lime-400">
                                  <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                                    Breakdown
                                  </span>
                                  <span className="font-bold">{p.secondary}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="primary"
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                      fill="url(#hostySplineGrad)"
                      dot={{ r: 4, stroke: "#0B0F17", strokeWidth: 2, fill: "#FFFFFF" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="secondary"
                      stroke="#A3E635"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT CHART: Response Code Breakdown Semi-Circular Gauge (5 cols) */}
            <div
              className={`rounded-3xl p-6 shadow-sm ring-1 lg:col-span-5 flex flex-col justify-between ${
                isDark || isSplit
                  ? "bg-[#111726] ring-neutral-800 text-white"
                  : "bg-neutral-50/80 ring-neutral-200 text-neutral-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold">Response code breakdown</span>
                </div>
                <p className="text-xs text-neutral-400">Status code distribution</p>
              </div>

              {/* Semi-Circular Donut Gauge */}
              <div className="relative flex flex-col items-center justify-center my-auto py-2">
                <div className="h-44 w-full max-w-[280px]">
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
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {GAUGE_SEGMENTS.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Centered Total Callout inside the Arc */}
                <div className="absolute bottom-4 flex flex-col items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Total
                  </span>
                  <span className="text-3xl font-extrabold tracking-tight">
                    {totalGaugeValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 2-Column Legend with Status Dots & Percentages */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800/80 text-xs">
                {GAUGE_SEGMENTS.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold truncate">{seg.name.split(" ")[0]}</span>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {seg.value} ({seg.pct})
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
