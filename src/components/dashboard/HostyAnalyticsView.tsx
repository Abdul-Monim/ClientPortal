"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck2,
  Layers,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  Calendar,
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
import type { StudioAnalyticsPayload } from "@/domain/analytics";

interface HostyAnalyticsViewProps {
  initialData?: StudioAnalyticsPayload;
  studioName?: string;
}

interface PeriodDetail {
  time: string;
  primary: number;
  secondary: number;
  label: string;
  invoicesCount: number;
  approvedCount: number;
  notes: string;
}

const REVENUE_TIMELINE: PeriodDetail[] = [
  { time: "Jun", primary: 3200, secondary: 2800, label: "June 2026", invoicesCount: 2, approvedCount: 6, notes: "Discovery sprints & initial brand deposits" },
  { time: "Jul", primary: 5800, secondary: 4500, label: "July 2026", invoicesCount: 3, approvedCount: 11, notes: "Design system completions & web prototypes" },
  { time: "Aug", primary: 8400, secondary: 7200, label: "August 2026", invoicesCount: 4, approvedCount: 18, notes: "High volume sprint approvals across 3 clients" },
  { time: "Sep", primary: 6900, secondary: 6100, label: "September 2026", invoicesCount: 3, approvedCount: 14, notes: "Staging build sign-offs & milestone 2 settlements" },
  { time: "Oct", primary: 9500, secondary: 8800, label: "October 2026", invoicesCount: 5, approvedCount: 22, notes: "Peak delivery month with 100% on-time approvals" },
  { time: "Nov", primary: 11200, secondary: 10400, label: "November 2026 (Current)", invoicesCount: 6, approvedCount: 26, notes: "Year-end client project handoffs and retainer invoices" },
];

const DELIVERABLE_GAUGE = [
  { name: "Approved", value: 38, pct: "58.5%", color: "#A3E635", sublabel: "Formal Client Sign-Offs" },
  { name: "In Review", value: 14, pct: "21.5%", color: "#38BDF8", sublabel: "Waiting for Client Input" },
  { name: "Revisions", value: 8, pct: "12.3%", color: "#FB923C", sublabel: "Minor Feedback Pending" },
  { name: "Drafts", value: 5, pct: "7.7%", color: "#64748B", sublabel: "Studio Internal Drafts" },
];

const ANALYTICS_TABS = [
  { id: "Revenue", label: "Revenue & Billing", icon: DollarSign },
  { id: "Approvals", label: "Deliverables & Approvals", icon: FileCheck2 },
  { id: "Milestones", label: "Milestone Velocity", icon: Layers },
  { id: "Activity", label: "Client Response Speed", icon: Clock },
] as const;

export function HostyAnalyticsView({ studioName }: HostyAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<string>("Revenue");
  const [viewMode, setViewMode] = useState<"dark" | "light" | "split">("dark");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetail>(REVENUE_TIMELINE[5]!);
  const [selectedGaugeSegment, setSelectedGaugeSegment] = useState<typeof DELIVERABLE_GAUGE[0] | null>(null);

  const isDark = viewMode === "dark";
  const isSplit = viewMode === "split";

  const totalDeliverablesCount = DELIVERABLE_GAUGE.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="w-full space-y-6 font-ui">
      {/* Top Header Row with Studio Title & View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {studioName ? `${studioName} Analytics` : "ClientPortal Analytics"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Interactive client telemetry, cash flow timelines, and approval velocity. Click any chart node to inspect.
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
            Split View
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
          {/* Left Title and Niche Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>

            {/* Clickable Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {ANALYTICS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#D9F1FD] text-[#0369A1] ring-1 ring-sky-300 dark:bg-[#1E3A5F] dark:text-[#7DD3FC] dark:ring-sky-500/50 shadow-xs"
                        : isDark || isSplit
                        ? "bg-[#151C2A] text-neutral-300 hover:bg-[#1E2738] ring-1 ring-neutral-700/60"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 ring-1 ring-neutral-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Orbs */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              aria-label="Search telemetry"
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Studio Performance Metrics
            </span>
            <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time synchronization
            </span>
          </div>

          {/* ===================================================================== */}
          {/* 4 PASTEL STUDIO KPI CARDS (Matching Reference Layout)                 */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Sky Pastel (Total Billed Revenue) */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setActiveTab("Revenue")}
              className="cursor-pointer rounded-2xl bg-[#DDF0F8] p-5 text-[#133E53] shadow-xs transition hover:shadow-md dark:bg-[#162738] dark:text-[#BAE6FD]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-200/60 text-[#133E53] dark:bg-sky-900/50 dark:text-sky-300">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  +18.4%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">$38,400</div>
              <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Total Billed Revenue
              </div>
            </motion.div>

            {/* Card 2: Lime Pastel (Approval Velocity) */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              onClick={() => setActiveTab("Approvals")}
              className="cursor-pointer rounded-2xl bg-[#E6F7D8] p-5 text-[#1F4E24] shadow-xs transition hover:shadow-md dark:bg-[#1A3320] dark:text-[#BBF7D0]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-200/60 text-[#1F4E24] dark:bg-lime-900/50 dark:text-lime-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  +4.8%
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">96.8%</div>
              <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Client Approval Rate
              </div>
            </motion.div>

            {/* Card 3: Peach / Amber Pastel (Awaiting Review) */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              onClick={() => setActiveTab("Approvals")}
              className="cursor-pointer rounded-2xl bg-[#FFE4D6] p-5 text-[#7C2D12] shadow-xs transition hover:shadow-md dark:bg-[#3D2318] dark:text-[#FED7AA]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/70 text-[#7C2D12] dark:bg-amber-800/50 dark:text-amber-200">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                  3 In Queue
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">3</div>
              <div className="mt-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Awaiting Client Sign-Off
              </div>
            </motion.div>

            {/* Card 4: Slate Card (Turnaround Speed) */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              onClick={() => setActiveTab("Activity")}
              className="cursor-pointer rounded-2xl bg-[#2B3037] p-5 text-neutral-100 shadow-xs transition hover:shadow-md ring-1 ring-neutral-700/60 dark:bg-[#18202F] dark:text-neutral-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-700/80 text-neutral-200">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-700 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  Fast
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">1.4 d</div>
              <div className="mt-1 text-xs font-semibold text-neutral-300">
                Avg. Sign-Off Turnaround
              </div>
            </motion.div>
          </div>

          {/* ===================================================================== */}
          {/* 2-COLUMN MAIN CHARTS ROW (Interactive Wave & Gauge Donut)             */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT CHART: Clickable Timeline Graph (7 cols) */}
            <div
              className={`rounded-3xl p-6 shadow-sm ring-1 lg:col-span-7 flex flex-col justify-between ${
                isDark || isSplit
                  ? "bg-[#111726] ring-neutral-800 text-white"
                  : "bg-neutral-50/80 ring-neutral-200 text-neutral-900"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-base font-bold">
                      {activeTab === "Revenue"
                        ? "Revenue Trend & Cash Flow"
                        : activeTab === "Approvals"
                        ? "Deliverable Approval Timeline"
                        : activeTab === "Milestones"
                        ? "Milestone Progression Pace"
                        : "Client Turnaround Velocity"}
                    </span>
                    <p className="text-xs text-neutral-400">
                      Click any month node below to inspect that billing sprint
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      Invoiced ($)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-lime-400" />
                      Settled ($)
                    </span>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="h-64 w-full cursor-pointer">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={REVENUE_TIMELINE}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      onClick={(nextState: unknown) => {
                        const state = nextState as { activePayload?: Array<{ payload: PeriodDetail }> } | undefined;
                        if (state && state.activePayload && state.activePayload.length) {
                          const payload = state.activePayload[0]?.payload;
                          if (payload) setSelectedPeriod(payload);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="settledGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A3E635" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#A3E635" stopOpacity={0.0} />
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
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length && payload[0]?.payload) {
                            const p = payload[0].payload as PeriodDetail;
                            return (
                              <div className="rounded-2xl border border-neutral-700 bg-neutral-900/95 p-3 text-white shadow-xl backdrop-blur-md">
                                <div className="text-xs font-bold text-sky-400">{p.label}</div>
                                <div className="mt-1 flex items-center justify-between gap-4 text-xs">
                                  <span className="text-neutral-400">Billed:</span>
                                  <span className="font-bold">${p.primary.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-xs">
                                  <span className="text-neutral-400">Settled:</span>
                                  <span className="font-bold text-lime-400">${p.secondary.toLocaleString()}</span>
                                </div>
                                <div className="mt-1.5 pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400">
                                  {p.approvedCount} approved deliverables &bull; Click to lock
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
                        stroke="#38BDF8"
                        strokeWidth={2.5}
                        fill="url(#revenueGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="secondary"
                        stroke="#A3E635"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="url(#settledGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interactive Period Detail Card */}
              <div className="mt-4 rounded-2xl bg-black/20 p-3.5 border border-neutral-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      Selected: {selectedPeriod.label}
                    </span>
                    <span className="text-neutral-400 ml-2">({selectedPeriod.notes})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sky-400">
                    ${selectedPeriod.primary.toLocaleString()} Billed
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
                    {selectedPeriod.approvedCount} Sign-offs
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT CHART: Clickable Deliverable Donut Breakdown (5 cols) */}
            <div
              className={`rounded-3xl p-6 shadow-sm ring-1 lg:col-span-5 flex flex-col justify-between ${
                isDark || isSplit
                  ? "bg-[#111726] ring-neutral-800 text-white"
                  : "bg-neutral-50/80 ring-neutral-200 text-neutral-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold">Deliverable Status Distribution</h3>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    {totalDeliverablesCount} Total Assets
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-4">
                  Click any colored slice below to isolate status category
                </p>

                {/* Donut Chart Container */}
                <div className="relative h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DELIVERABLE_GAUGE}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        cursor="pointer"
                        onClick={(entry: unknown) => {
                          const item = entry as { name?: string; payload?: typeof DELIVERABLE_GAUGE[0] } | undefined;
                          const match = DELIVERABLE_GAUGE.find((d) => d.name === item?.name) || item?.payload;
                          if (match) setSelectedGaugeSegment(match);
                        }}
                      >
                        {DELIVERABLE_GAUGE.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={selectedGaugeSegment?.name === entry.name ? "#ffffff" : "transparent"}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0];
                            return (
                              <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-xs text-white shadow-xl">
                                <span className="font-bold">{p?.name}:</span> {p?.value} assets
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Label */}
                  <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      {selectedGaugeSegment ? selectedGaugeSegment.name : "Total Assets"}
                    </span>
                    <span className="text-2xl font-black tracking-tight">
                      {selectedGaugeSegment ? selectedGaugeSegment.value : totalDeliverablesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clickable Legend Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-neutral-700/50">
                {DELIVERABLE_GAUGE.map((item) => {
                  const isSelected = selectedGaugeSegment?.name === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        setSelectedGaugeSegment(isSelected ? null : item)
                      }
                      className={`flex items-center justify-between rounded-xl p-2 text-left transition ${
                        isSelected
                          ? "bg-white/10 ring-1 ring-white/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="text-xs font-semibold">{item.name}</div>
                          <div className="text-[10px] text-neutral-400">{item.pct}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono">{item.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
