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
  Search,
  Sparkles,
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
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { AppArchitectureModal } from "@/components/dashboard/AppArchitectureModal";

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
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetail>(REVENUE_TIMELINE[5]!);
  const [selectedGaugeSegment, setSelectedGaugeSegment] = useState<typeof DELIVERABLE_GAUGE[0] | null>(null);

  const totalDeliverablesCount = DELIVERABLE_GAUGE.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="w-full space-y-6 font-ui">
      {/* Top Header Row with Studio Title, Architecture Modal & 1-Click Theme Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {studioName ? `${studioName} Analytics` : "ClientPortal Analytics"}
              </h1>
              <InfoTooltip
                title="Studio Telemetry"
                content="Interactive performance overview tracking billed revenue, client approval pace, and deliverable review queues."
                align="left"
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Interactive client telemetry, cash flow timelines, and approval velocity. Click any chart node to inspect.
            </p>
          </div>
        </div>

        {/* Action Controls: Platform Guide & 1-Click Theme Toggle Button */}
        <div className="flex items-center gap-2.5">
          <AppArchitectureModal />
          <ThemeToggle />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN HOSTY ANALYTICS BOARD                                              */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200/90 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-[#0B0F17] dark:text-white shadow-xl transition-colors duration-200">
        {/* ======================================================================= */}
        {/* TOP BAR: Title, Filter Pills, and Search/Bell/Avatar Orbs                */}
        {/* ======================================================================= */}
        <div className="flex flex-col gap-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#0E131F] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          {/* Left Title and Niche Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Overview</h2>
              <InfoTooltip
                title="Telemetry Views"
                content="Filter between cash flow trends, deliverable approval velocity, milestone speed, and response metrics."
                align="left"
              />
            </div>

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
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700/80 dark:hover:text-white ring-1 ring-neutral-200 dark:ring-neutral-700/60"
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white transition"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 text-white font-bold text-xs ring-2 ring-neutral-200 dark:ring-neutral-700 shadow-xs">
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
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    +18.4%
                  </span>
                  <InfoTooltip
                    title="Total Billed Revenue"
                    content="Cumulative project invoicing issued across all client portals, including deposits and milestone settlements."
                  />
                </div>
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
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                    +4.8%
                  </span>
                  <InfoTooltip
                    title="Client Approval Rate"
                    content="Proportion of deliverable drafts signed off directly without requiring major revisions."
                  />
                </div>
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
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    3 In Queue
                  </span>
                  <InfoTooltip
                    title="Awaiting Sign-Off"
                    content="Deliverables currently published to clients that have not yet received formal approval or change requests."
                  />
                </div>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">3</div>
              <div className="mt-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Awaiting Client Sign-Off
              </div>
            </motion.div>

            {/* Card 4: Lavender / Purple Pastel (Turnaround Speed) */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              onClick={() => setActiveTab("Activity")}
              className="cursor-pointer rounded-2xl bg-[#F1EEFE] p-5 text-[#4C1D95] shadow-xs transition hover:shadow-md dark:bg-[#251D3A] dark:text-[#DDD6FE]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-200/70 text-[#4C1D95] dark:bg-purple-900/60 dark:text-purple-300">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-200">
                    Fast
                  </span>
                  <InfoTooltip
                    title="Avg. Sign-Off Turnaround"
                    content="Average duration between publishing a deliverable version and client sign-off."
                  />
                </div>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">1.4 d</div>
              <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Avg. Sign-Off Turnaround
              </div>
            </motion.div>
          </div>

          {/* ===================================================================== */}
          {/* 2-COLUMN MAIN CHARTS ROW (Interactive Wave & Gauge Donut)             */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT CHART: Clickable Timeline Graph (7 cols) */}
            <div className="rounded-3xl p-6 shadow-sm border border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-800 dark:bg-[#111726] text-neutral-900 dark:text-white lg:col-span-7 flex flex-col justify-between">
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
              <div className="mt-4 rounded-2xl bg-neutral-100/90 dark:bg-black/30 p-3.5 border border-neutral-200 dark:border-neutral-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      Selected: {selectedPeriod.label}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-2">({selectedPeriod.notes})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    ${selectedPeriod.primary.toLocaleString()} Billed
                  </span>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                    {selectedPeriod.approvedCount} Sign-offs
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT CHART: Clickable Deliverable Donut Breakdown (5 cols) */}
            <div className="rounded-3xl p-6 shadow-sm border border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-800 dark:bg-[#111726] text-neutral-900 dark:text-white lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Deliverable Distribution</h3>
                    <InfoTooltip
                      title="Deliverable Distribution"
                      content="Interactive asset status breakdown. Click any color wedge or legend category to isolate."
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    {totalDeliverablesCount} Total Assets
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
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
                              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-xs text-neutral-900 dark:text-white shadow-xl">
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
                    <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                      {selectedGaugeSegment ? selectedGaugeSegment.name : "Total Assets"}
                    </span>
                    <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                      {selectedGaugeSegment ? selectedGaugeSegment.value : totalDeliverablesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clickable Legend Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700/50">
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
                          ? "bg-neutral-200/80 dark:bg-white/10 ring-1 ring-neutral-300 dark:ring-white/30"
                          : "hover:bg-neutral-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white">{item.name}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{item.pct}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-neutral-800 dark:text-neutral-200">{item.value}</span>
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
