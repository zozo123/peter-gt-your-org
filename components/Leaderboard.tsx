"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getLeaderboardRows, PETER_BASELINE } from "@/lib/mockSnapshots";
import { confidenceLabel } from "@/lib/peterMath";
import type { RankedOrg, RankingMetric } from "@/lib/types";

type Props = {
  activeOrg: string;
};

const TABS: { metric: RankingMetric; label: string; hint: string }[] = [
  {
    metric: "totalPeters",
    label: "Total Peters",
    hint: "Raw org scale, best for bragging.",
  },
  {
    metric: "densityPeters",
    label: "Peter Density",
    hint: "Fairness lens per active contributor.",
  },
  {
    metric: "momentumPeters",
    label: "YTD Pace",
    hint: "2026 YTD run-rate projected against Peter, still anchored to Jan 1.",
  },
];

export function Leaderboard({ activeOrg }: Props) {
  const [metric, setMetric] = useState<RankingMetric>("totalPeters");
  const rows = useMemo(() => getLeaderboardRows(metric), [metric]);
  const activeTab = TABS.find((tab) => tab.metric === metric) ?? TABS[0];

  return (
    <section
      id="leaderboard"
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"
    >
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/75 font-semibold">
              Public R&D ranking
            </p>
            <h3 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.05em] text-white">
              Top orgs by Peters
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Switch the metric: raw 2026 YTD bragging rights, fairness per contributor,
              or YTD run-rate. Rankings are org-level, public-data-first, and intentionally imperfect.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/25 p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.metric}
                type="button"
                onClick={() => setMetric(tab.metric)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  metric === tab.metric
                    ? "bg-amber-300 text-black"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-500">{activeTab.hint}</p>
      </div>

      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <LeaderboardRow
            key={row.org}
            row={row}
            metric={metric}
            isActive={row.org === activeOrg}
          />
        ))}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 sm:px-6 bg-white/[0.025]">
          <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-400">
            base
          </div>
          <div>
            <p className="text-sm font-semibold text-white">@steipete</p>
            <p className="text-xs text-zinc-500">Benchmark unit, not an org ranking</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums text-zinc-200">
              {PETER_BASELINE.totalPeters.toFixed(2)}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Peter
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeaderboardRow({
  row,
  metric,
  isActive,
}: {
  row: RankedOrg;
  metric: RankingMetric;
  isActive: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr] gap-4 px-5 py-4 transition-colors sm:grid-cols-[auto_1fr_auto] sm:px-6 ${
        isActive ? "bg-amber-300/[0.075]" : "hover:bg-white/[0.025]"
      }`}
    >
      <div
        className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${
          isActive ? "bg-amber-300 text-black" : "bg-white/[0.06] text-zinc-300"
        }`}
      >
        #{row.selectedRank}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">{row.orgDisplayName}</p>
          <Badge>{row.cohort.label}</Badge>
          <Badge>{row.cohort.sizeBand}</Badge>
          <Badge tone={row.visibility.confidence}>{confidenceLabel(row.visibility.confidence)}</Badge>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {row.visibility.completeness === 0
            ? "Needs verified GitHub org slug"
            : `${row.activeContributors.toLocaleString()} active contributors · ${(row.visibility.completeness * 100).toFixed(0)}% public coverage estimate`}
        </p>
      </div>

      <div className="col-span-2 grid grid-cols-3 gap-3 sm:col-span-1 sm:min-w-[310px]">
        <Metric
          label="Total"
          value={row.visibility.completeness === 0 ? "—" : row.totalPeters.toFixed(2)}
          active={metric === "totalPeters"}
        />
        <Metric
          label="Density"
          value={row.visibility.completeness === 0 ? "—" : row.densityPeters.toFixed(3)}
          active={metric === "densityPeters"}
        />
        <Metric
          label="Pace"
          value={row.visibility.completeness === 0 ? "—" : row.momentumPeters.toFixed(2)}
          active={metric === "momentumPeters"}
        />
      </div>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "high" | "medium" | "low";
}) {
  const color =
    tone === "high"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
      : tone === "medium"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
        : tone === "low"
          ? "border-rose-300/20 bg-rose-300/10 text-rose-200"
          : "border-white/10 bg-white/[0.04] text-zinc-400";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${color}`}>
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? "border-amber-300/30 bg-amber-300/10" : "border-white/10 bg-black/20"}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}
