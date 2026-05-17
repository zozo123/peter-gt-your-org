import Image from "next/image";
import { PETER_AVATAR_URL } from "@/lib/mockSnapshots";
import { categoryPeterIndex } from "@/lib/peterMath";
import type { Snapshot } from "@/lib/types";

type Props = {
  snapshots: Snapshot[];
};

const CATEGORY_ROWS: {
  key: "commits" | "pullRequests" | "issues" | "reviews";
  label: string;
}[] = [
  { key: "commits", label: "Commits" },
  { key: "pullRequests", label: "PRs" },
  { key: "issues", label: "Issues" },
  { key: "reviews", label: "Reviews" },
];

export function OrgComparison({ snapshots }: Props) {
  const incredibuild = snapshots.find((snapshot) => snapshot.org === "incredibuild");
  const islo = snapshots.find((snapshot) => snapshot.org === "islo-labs");

  if (!incredibuild || !islo) return null;

  const max = Math.max(incredibuild.scores.totalPeters, islo.scores.totalPeters, 1);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025))] p-5 sm:p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
      <div className="grid gap-7 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/75 font-semibold">
            GTM comparison
          </p>
          <h3 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.05em] text-white">
            Incredibuild vs Islo.dev vs Peter
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            This is the demo story: a known R&D org, a second comparison org, and the absurd solo
            benchmark. Later, any GitHub org drops into the same ranking model.
          </p>

          <div className="mt-6 space-y-3">
            <LadderRow rank={`#${incredibuild.scores.totalRank}`} name="Incredibuild" value={`${incredibuild.scores.totalPeters.toFixed(2)} Peters`} />
            <LadderRow rank={`#${islo.scores.totalRank}`} name="Islo.dev" value={`${islo.scores.totalPeters.toFixed(2)} Peters`} />
            <LadderRow
              rank="unit"
              name="Peter"
              value="1.00 Peter"
              muted
              avatarUrl={PETER_AVATAR_URL}
            />
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-white/10 bg-black/30 p-5">
          <div className="grid grid-cols-3 items-end gap-4">
            <VerticalBar
              label="Incredibuild"
              value={incredibuild.scores.totalPeters}
              max={max}
              tone="bg-amber-300"
            />
            <VerticalBar
              label="Islo.dev"
              value={islo.scores.totalPeters}
              max={max}
              tone="bg-sky-200"
            />
            <VerticalBar
              label="Peter"
              value={1}
              max={max}
              tone="bg-zinc-200"
              avatarUrl={PETER_AVATAR_URL}
            />
          </div>

          <div className="mt-7 grid gap-3">
            {CATEGORY_ROWS.map((category) => {
              const ibRatio = categoryPeterIndex(
                incredibuild.orgYtd[category.key],
                incredibuild.peterYtd[category.key],
              );
              const isloRatio = categoryPeterIndex(
                islo.orgYtd[category.key],
                islo.peterYtd[category.key],
              );

              return (
                <div
                  key={category.key}
                  className="grid grid-cols-[84px_1fr_1fr] items-center gap-3 text-xs"
                >
                  <span className="text-zinc-500">{category.label}</span>
                  <Heat label="IB" ratio={ibRatio} tone="bg-amber-300" />
                  <Heat label="Islo" ratio={isloRatio} tone="bg-sky-200" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LadderRow({
  rank,
  name,
  value,
  muted,
  avatarUrl,
}: {
  rank: string;
  name: string;
  value: string;
  muted?: boolean;
  avatarUrl?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`relative grid size-9 place-items-center overflow-hidden rounded-full text-xs font-semibold ${muted ? "bg-white/[0.04] text-zinc-500" : "bg-amber-300 text-black"}`}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="@steipete GitHub avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            rank
          )}
        </span>
        <span className="text-sm font-semibold text-white">{name}</span>
      </div>
      <span className="text-sm tabular-nums text-zinc-300">{value}</span>
    </div>
  );
}

function VerticalBar({
  label,
  value,
  max,
  tone,
  avatarUrl,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
  avatarUrl?: string;
}) {
  const height = `${Math.max(18, (value / max) * 100)}%`;

  return (
    <div className="flex h-72 flex-col items-center justify-end gap-3">
      <div className="flex h-full w-full items-end rounded-3xl border border-white/10 bg-white/[0.035] p-2">
        <div
          className={`w-full rounded-2xl ${tone} shadow-[0_0_42px_rgba(251,191,36,0.2)]`}
          style={{ height }}
        />
      </div>
      <div className="text-center">
        <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white">
          {avatarUrl && (
            <span className="relative size-5 overflow-hidden rounded-full border border-amber-300/30">
              <Image
                src={avatarUrl}
                alt="@steipete GitHub avatar"
                fill
                sizes="20px"
                className="object-cover"
              />
            </span>
          )}
          {label}
        </p>
        <p className="text-xs tabular-nums text-zinc-500">{value.toFixed(2)} Peters</p>
      </div>
    </div>
  );
}

function Heat({ label, ratio, tone }: { label: string; ratio: number; tone: string }) {
  const width = `${Math.min(100, Math.max(8, ratio * 48))}%`;

  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-zinc-500">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <span className={`block h-full rounded-full ${tone}`} style={{ width }} />
      </span>
      <span className="w-10 text-right tabular-nums text-zinc-300">{ratio.toFixed(2)}×</span>
    </div>
  );
}
