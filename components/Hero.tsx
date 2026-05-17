import type { FormEvent } from "react";
import type { RankedOrg } from "@/lib/types";

type HeroOrg = {
  slug: string;
  label: string;
};

type HeroProps = {
  inputValue: string;
  selectedOrg: string;
  orgs: HeroOrg[];
  topRows: RankedOrg[];
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectOrg: (slug: string) => void;
};

export function Hero({
  inputValue,
  selectedOrg,
  orgs,
  topRows,
  onInputChange,
  onSubmit,
  onSelectOrg,
}: HeroProps) {
  return (
    <header className="grid lg:grid-cols-[1.04fr_0.96fr] gap-8 lg:gap-12 items-center">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <span className="size-1.5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
          R&D orgs, ranked in Peters
        </div>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.06em] text-white leading-[0.9]">
            How many Peters is your R&D?
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-zinc-300 leading-relaxed">
            Rank your GitHub org against{" "}
            <span className="text-white font-medium">@steipete</span> in one absurd,
            useful unit. Public preview counts verified 2026 YTD commits, PRs, and issues.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[1.7rem] border border-white/12 bg-black/35 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="github org slug (e.g. incredibuild, islo-labs, awslabs)"
              className="min-h-13 flex-1 rounded-2xl bg-white/[0.035] px-4 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:bg-white/[0.07]"
            />
            <button
              type="submit"
              className="group rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-[0_18px_70px_rgba(251,191,36,0.28)]"
            >
              Reveal Peter score
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
            Try
          </span>
          {orgs.map((org) => {
            const selected = selectedOrg === org.slug;
            return (
              <button
                key={org.slug}
                type="button"
                onClick={() => onSelectOrg(org.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                  selected
                    ? "border-amber-200 bg-amber-300 text-black"
                    : "border-white/10 bg-white/[0.035] text-zinc-300 hover:-translate-y-0.5 hover:border-white/25"
                }`}
              >
                {org.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <a
            href="#leaderboard"
            className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
          >
            View public ranking
          </a>
          <p className="text-xs text-zinc-500 sm:max-w-[270px] sm:text-left leading-snug">
            Current mode is public-data only. Read-only org installs later add private coverage
            and PR reviews without ranking individuals.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xl pt-3">
          <HeroStat label="Window" value="2026 YTD" hint="since Jan 1" />
          <HeroStat label="Unit" value="1 Peter" hint="@steipete baseline" />
          <HeroStat label="Rank" value="Org-level" hint="cohort-aware" />
        </div>
      </div>

      <div className="relative min-h-[430px]">
        <div className="absolute -inset-8 rounded-[3rem] bg-amber-300/10 blur-3xl [animation:pulse-glow_5s_ease-in-out_infinite]" />
        <div className="absolute right-4 top-2 h-28 w-28 rounded-full border border-amber-200/20 bg-amber-200/[0.04] blur-[1px] [animation:slow-drift_9s_ease-in-out_infinite]" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.035))] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="absolute inset-0 noise-mask opacity-70" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500 font-semibold">
                  Public ranking
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Top R&D orgs by 2026 YTD Peters
                </p>
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
                public
              </div>
            </div>

            <div className="space-y-2">
              {topRows.slice(0, 4).map((row) => (
                <div
                  key={row.org}
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${
                    row.org === selectedOrg
                      ? "border-amber-300/35 bg-amber-300/[0.09]"
                      : "border-white/10 bg-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-300">
                      #{row.totalRank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{row.orgDisplayName}</p>
                      <p className="text-xs text-zinc-500">{row.cohort.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-amber-300">
                      {row.totalPeters.toFixed(2)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                      Peters
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
              Verified public rows rank immediately. Incredibuild stays as a “connect the real
              org” example until its GitHub slug is known.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroStat(props: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-semibold">
        {props.label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{props.value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500 leading-tight">{props.hint}</p>
    </div>
  );
}
