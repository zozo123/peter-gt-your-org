import type { Snapshot } from "@/lib/types";
import { categoryPeterIndex } from "@/lib/peterMath";

type Props = {
  snapshot: Snapshot;
};

const ROWS: { key: keyof Snapshot["orgYtd"]; label: string }[] = [
  { key: "commits", label: "Commits" },
  { key: "pullRequests", label: "Pull requests" },
  { key: "issues", label: "Issues" },
];

export function CategoryTable({ snapshot }: Props) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="px-5 py-5 sm:px-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 font-semibold">
            Public breakdown
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
            Where your shape differs from Peter
          </h3>
        </div>
        <p className="text-sm text-zinc-500">
          Public preview uses verified YTD commit, PR, and issue counts.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 border-b border-white/10">
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium tabular-nums">{snapshot.orgDisplayName}</th>
              <th className="px-5 py-3 font-medium tabular-nums">Peter</th>
              <th className="px-5 py-3 font-medium tabular-nums">Peter Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {ROWS.map(({ key, label }) => {
              const orgVal = snapshot.orgYtd[key] as number;
              const peterVal = snapshot.peterYtd[key] as number;
              const ratio = categoryPeterIndex(orgVal, peterVal);
              const tone =
                ratio >= 1.05 ? "text-emerald-300" : ratio <= 0.95 ? "text-rose-300" : "text-zinc-200";
              const barTone =
                ratio >= 1.05 ? "bg-emerald-300" : ratio <= 0.95 ? "bg-rose-300" : "bg-zinc-300";
              const barWidth = `${Math.min(100, Math.max(10, ratio * 48))}%`;

              return (
                <tr key={key} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-zinc-300">{label}</td>
                  <td className="px-5 py-3 tabular-nums text-white">{orgVal.toLocaleString()}</td>
                  <td className="px-5 py-3 tabular-nums text-zinc-400">{peterVal.toLocaleString()}</td>
                  <td className={`px-5 py-3 tabular-nums font-medium ${tone}`}>
                    <div className="flex min-w-28 items-center gap-3">
                      <span>{ratio.toFixed(2)}×</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                        <span
                          className={`block h-full rounded-full ${barTone}`}
                          style={{ width: barWidth }}
                        />
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
