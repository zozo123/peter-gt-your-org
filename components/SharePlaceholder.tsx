import type { Snapshot } from "@/lib/types";

type Props = {
  snapshot: Snapshot;
  onChallenge: () => void;
};

export function SharePlaceholder({ snapshot, onChallenge }: Props) {
  const needsConnection = snapshot.visibility.completeness === 0;
  const headline = needsConnection
    ? `${snapshot.orgDisplayName} needs a verified GitHub org.`
    : `${snapshot.orgDisplayName} R&D is ${snapshot.scores.peterIndex.toFixed(2)} Peters.`;
  const sub =
    snapshot.scores.gap >= 0
      ? `Ahead of @steipete by ${snapshot.scores.gap.toLocaleString()} GitHub-visible contributions since Jan 1, 2026.`
      : `Trailing @steipete by ${Math.abs(snapshot.scores.gap).toLocaleString()} contributions since Jan 1, 2026. Still time to meme harder.`;
  const challenge = needsConnection
    ? "Connect the real org to calculate the score."
    : snapshot.scores.peterIndex >= 1
      ? "More than one Peter. Terrifying."
      : "Peter still wins. For now.";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.13),rgba(255,255,255,0.045)_45%,rgba(125,211,252,0.06))] p-5 sm:p-6 shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/75 font-semibold">
              Brag card
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
              Make the score portable.
            </p>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {needsConnection
              ? `${headline} ${challenge}`
              : `${headline} #${snapshot.scores.totalRank ?? "?"} overall · #${snapshot.scores.cohortRank ?? "?"} in ${snapshot.cohort.label}. ${challenge}`}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onChallenge}
              className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Challenge another org
            </button>
            <p className="self-center text-xs text-zinc-500">
              Share links arrive with live org lookup.
            </p>
          </div>
        </div>

        <div className="w-full max-w-[560px] mx-auto lg:mx-0">
          <div className="aspect-[1200/630] rounded-[1.5rem] bg-[radial-gradient(circle_at_18%_22%,rgba(251,191,36,0.24),transparent_30%),linear-gradient(145deg,#161616,#050505_58%,#101010)] border border-white/12 shadow-[0_28px_95px_rgba(0,0,0,0.6)] flex flex-col justify-between p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.28em] text-amber-300 font-semibold">
                Peter Index
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-400">
                YTD
              </span>
            </div>

            <div>
              <p className="max-w-[760px] text-4xl sm:text-6xl font-semibold tracking-[-0.06em] text-white leading-[0.9]">
                {needsConnection ? (
                  <>{snapshot.orgDisplayName} needs verification.</>
                ) : (
                  <>
                    {snapshot.orgDisplayName} R&D is{" "}
                    <span className="text-amber-300">
                      {snapshot.scores.peterIndex.toFixed(2)}
                    </span>{" "}
                    Peters.
                  </>
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-zinc-400 leading-snug">
                {needsConnection
                  ? "Provide the GitHub org slug via GITHUB_ORG to calculate a live score."
                  : `#${snapshot.scores.totalRank ?? "?"} overall · ${snapshot.cohort.label} · ${sub} ${challenge}`}
              </p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="grid grid-cols-5 gap-1.5">
                {[34, 62, 47, 78, 55].map((height, index) => (
                  <span
                    key={index}
                    className="w-3 rounded-full bg-amber-300/70"
                    style={{ height }}
                  />
                ))}
              </div>
              <div className="text-right text-[11px] text-zinc-500 uppercase tracking-wide">
                <span className="block">{snapshot.org}</span>
                <span className="block">vs @steipete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
