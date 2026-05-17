import Image from "next/image";
import type { Snapshot } from "@/lib/types";
import {
  densityTierLabel,
  orgTierLabel,
} from "@/lib/peterMath";
import { PETER_AVATAR_URL } from "@/lib/mockSnapshots";

type Props = {
  snapshot: Snapshot;
  cohortMedianPeters?: number;
};

export function ComparisonStrip({ snapshot, cohortMedianPeters }: Props) {
  const orgTier = orgTierLabel(snapshot.scores.peterIndex);
  const densityTier = densityTierLabel(snapshot.scores.peterDensity);
  const needsConnection = snapshot.visibility.completeness === 0;
  const hasContributorCount = snapshot.orgMeta.activeContributors > 0;
  const orgBar = Math.min(100, Math.max(18, snapshot.scores.peterIndex * 62));
  const peterBar = Math.min(100, Math.max(18, (1 / Math.max(snapshot.scores.peterIndex, 1)) * 62));
  const cohortBar = Math.min(100, Math.max(18, (cohortMedianPeters ?? 0.7) * 62));
  const gapSigned =
    snapshot.scores.gap >= 0
      ? `+${snapshot.scores.gap.toLocaleString()}`
      : snapshot.scores.gap.toLocaleString();

  if (needsConnection) {
    return (
      <section className="relative overflow-hidden rounded-[2.25rem] border border-amber-300/20 bg-[linear-gradient(145deg,rgba(251,191,36,0.11),rgba(255,255,255,0.035))] p-5 sm:p-8 shadow-[0_36px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80 font-semibold">
              Verification needed
            </p>
            <h2 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-[-0.06em] leading-[0.9] text-white">
              {snapshot.orgDisplayName} needs the real GitHub org.
            </h2>
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-300">
              {snapshot.visibility.note} This is the right product behavior: do not invent a
              Peter score when the org identity is unknown or the token cannot read it.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 font-semibold">
              What we need
            </p>
            <div className="mt-4 grid gap-3">
              <VerifyStep number="1" title="GitHub org slug" text="Example: supabase, microsoft, awslabs." />
              <VerifyStep number="2" title="Org family mapping" text="For Google/AWS-scale orgs, define which public orgs count." />
              <VerifyStep number="3" title="Read-only install later" text="Private repos and reviews require authenticated collection." />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.035))] p-5 sm:p-8 shadow-[0_36px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="space-y-7">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 font-semibold">
              [{snapshot.orgDisplayName}] vs [@{snapshot.benchmarkUser}]
            </p>
            <h2 className="mt-3 text-4xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-[-0.065em] leading-[0.88]">
              {needsConnection ? (
                <>
                  {snapshot.orgDisplayName} needs a verified GitHub org.
                </>
              ) : (
                <>
                  {snapshot.orgDisplayName} R&D is{" "}
                  <span className="text-amber-300">{snapshot.scores.peterIndex.toFixed(2)}</span>{" "}
                  Peters.
                </>
              )}
            </h2>
            <p className="mt-5 max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed">
              {needsConnection ? (
                <>
                  I could not verify a public GitHub org at <span className="text-white">@{snapshot.org}</span>.
                  Connect the real org or provide the slug to calculate a real 2026 YTD Peter score.
                </>
              ) : (
                <>
                  {snapshot.scores.gap >= 0
                    ? `That is ${gapSigned} GitHub-visible contributions ahead of Peter since Jan 1, 2026.`
                    : `That is ${gapSigned} GitHub-visible contributions behind Peter since Jan 1, 2026.`}{" "}
                  Current pace projects to{" "}
                  <span className="text-white font-medium">
                    {snapshot.scores.projectedYearEndIndex.toFixed(2)} Peters
                  </span>{" "}
                  by Dec 31.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill label="Rank" value={`#${snapshot.scores.totalRank ?? "?"} Total Peters`} />
            <Pill label="Density rank" value={`#${snapshot.scores.densityRank ?? "?"}`} />
            <Pill label="YTD pace" value={`#${snapshot.scores.momentumRank ?? "?"}`} />
            <Pill label="Tier" value={orgTier} />
            <Pill label="Cohort" value={snapshot.cohort.label} />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 font-semibold">
                Benchmark race
              </p>
              <p className="mt-1 text-sm text-zinc-400">Visible motion since Jan 1, 2026</p>
            </div>
            <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200 capitalize">
              {snapshot.visibility.confidence} confidence
            </span>
          </div>

          <div className="mt-8 space-y-6">
            <RaceBar
              label={snapshot.orgDisplayName}
              value={`${snapshot.scores.peterIndex.toFixed(2)} Peters`}
              width={orgBar}
              tone="bg-amber-300"
            />
            <RaceBar
              label="Peter"
              value="1.00 Peter"
              width={peterBar}
              tone="bg-zinc-200"
              avatarUrl={PETER_AVATAR_URL}
            />
            <RaceBar
              label={`${snapshot.cohort.label} median`}
              value={`${(cohortMedianPeters ?? 0).toFixed(2)} Peters`}
              width={cohortBar}
              tone="bg-sky-200"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <MiniMetric label="Projection" value={`${snapshot.scores.projectedYearEndIndex.toFixed(2)}×`} />
            <MiniMetric label="YTD Pace" value={`${snapshot.scores.momentumPeters.toFixed(2)}×`} />
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Org activity"
          value={snapshot.orgYtd.total.toLocaleString()}
          hint="GitHub-visible contributions since Jan 1, 2026"
          accent="amber"
        />
        <MetricCard
          label="Peter benchmark"
          value={snapshot.peterYtd.total.toLocaleString()}
          hint="1.00 Peter baseline since Jan 1, 2026"
          accent="zinc"
        />
        <MetricCard
          label="Gap"
          value={gapSigned}
          hint={
            snapshot.scores.gap >= 0
              ? "The scoreboard favors the org"
              : "Peter still has the lead"
          }
          accent={snapshot.scores.gap >= 0 ? "emerald" : "rose"}
        />
        <MetricCard
          label="Peter Density"
          value={hasContributorCount ? snapshot.scores.peterDensity.toFixed(3) : "Add headcount"}
          hint={
            hasContributorCount
              ? `${snapshot.orgMeta.activeContributors.toLocaleString()} active contributors`
              : "Set GITHUB_ORG_ACTIVE_CONTRIBUTORS"
          }
          accent="zinc"
        />
      </div>

      <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
            Year-end pace
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {snapshot.scores.projectedYearEndIndex.toFixed(2)} Peters by Dec 31
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Snapshot forecast, not a promise that anyone should gamify.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
            Peter Density (per active contributor)
          </p>
          <p className="text-lg font-semibold text-white">
            {hasContributorCount
              ? `${snapshot.scores.peterDensity.toFixed(3)} Peters / engineer`
              : "Needs contributor count"}
          </p>
          <p className="text-sm text-zinc-400">
            {hasContributorCount
              ? `${snapshot.orgMeta.activeContributors.toLocaleString()} active contributors · `
              : "Set GITHUB_ORG_ACTIVE_CONTRIBUTORS · "}
            {snapshot.orgMeta.repositories.toLocaleString()} repos ·{" "}
            {snapshot.orgMeta.privateReposIncluded ? "includes private" : "public snapshot"}
            {hasContributorCount ? ` · ${densityTier}` : ""}
          </p>
        </div>
      </div>

      {snapshot.scores.requiredDailyPaceToCatchPeter != null && (
        <p className="relative mt-6 text-sm text-rose-200/90 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-3">
          Catch-up pace: ship ~{" "}
          <span className="font-semibold">
            {snapshot.scores.requiredDailyPaceToCatchPeter.toLocaleString()}
          </span>{" "}
          contributions/day from here to match Peter&apos;s projected finish.
        </p>
      )}
    </section>
  );
}

function Pill(props: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-zinc-300">
      <span className="text-zinc-500">{props.label}:</span>{" "}
      <span className="font-medium text-white">{props.value}</span>
    </div>
  );
}

function VerifyStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-300 text-xs font-semibold text-black">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function RaceBar(props: {
  label: string;
  value: string;
  width: number;
  tone: string;
  avatarUrl?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-white">
          {props.avatarUrl && (
            <span className="relative size-5 overflow-hidden rounded-full border border-amber-300/30">
              <Image
                src={props.avatarUrl}
                alt="@steipete GitHub avatar"
                fill
                sizes="20px"
                className="object-cover"
              />
            </span>
          )}
          {props.label}
        </span>
        <span className="text-zinc-400">{props.value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full ${props.tone} shadow-[0_0_30px_rgba(251,191,36,0.35)]`}
          style={{ width: `${props.width}%` }}
        />
      </div>
    </div>
  );
}

function MiniMetric(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
        {props.label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{props.value}</p>
    </div>
  );
}

function MetricCard(props: {
  label: string;
  value: string;
  hint: string;
  accent: "amber" | "zinc" | "emerald" | "rose";
}) {
  const ring =
    props.accent === "amber"
      ? "shadow-[inset_0_0_0_1px_rgba(251,191,36,0.35)]"
      : props.accent === "emerald"
        ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]"
        : props.accent === "rose"
          ? "shadow-[inset_0_0_0_1px_rgba(251,113,133,0.35)]"
          : "shadow-[inset_0_0_0_1px_rgba(161,161,170,0.28)]";

  return (
    <div className={`rounded-2xl bg-black/30 px-4 py-4 backdrop-blur-sm ${ring}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium">{props.label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{props.value}</p>
      <p className="mt-1 text-xs text-zinc-500 leading-snug">{props.hint}</p>
    </div>
  );
}
