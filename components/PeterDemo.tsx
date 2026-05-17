"use client";

import { useMemo, useRef, useState } from "react";
import { CategoryTable } from "@/components/CategoryTable";
import { ComparisonStrip } from "@/components/ComparisonStrip";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { OrgComparison } from "@/components/OrgComparison";
import { SharePlaceholder } from "@/components/SharePlaceholder";
import { TrustPanel } from "@/components/TrustPanel";
import {
  DEMO_ORG_ORDER,
  getAllSnapshots,
  getLeaderboardRows,
  getMockSnapshot,
} from "@/lib/mockSnapshots";
import { buildDiagnosis } from "@/lib/peterMath";

const CHIP_META: Record<
  string,
  { label: string; hint?: string }
> = {
  incredibuild: { label: "Incredibuild", hint: "Ahead, but Peter Density keeps it funny" },
  "islo-labs": { label: "Islo.dev", hint: "Smaller org, dangerous density" },
  supabase: { label: "Supabase", hint: "Peter-class momentum" },
  microsoft: { label: "Microsoft", hint: "Industrialized Peter energy" },
  google: { label: "Google", hint: "Public Google org family" },
  awslabs: { label: "AWS", hint: "AWS public org family" },
  vercel: { label: "Vercel", hint: "Collaborative lanes pop" },
  linear: { label: "Linear", hint: "Private-heavy public preview" },
  demo: { label: "Acme Corp", hint: "Catch-up storyline" },
};

export function PeterDemo() {
  const demoAnchorRef = useRef<HTMLElement>(null);

  const [resolvedSlug, setResolvedSlug] = useState("supabase");
  const [inputValue, setInputValue] = useState("supabase");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const snapshot = useMemo(() => getMockSnapshot(resolvedSlug), [resolvedSlug]);
  const diagnosis = snapshot ? buildDiagnosis(snapshot) : "";
  const allSnapshots = useMemo(() => getAllSnapshots(), []);
  const totalRows = useMemo(() => getLeaderboardRows("totalPeters"), []);
  const cohortMedianPeters = useMemo(() => {
    if (!snapshot) return undefined;
    const peers = allSnapshots
      .filter((candidate) => candidate.cohort.label === snapshot.cohort.label)
      .map((candidate) => candidate.scores.totalPeters)
      .sort((a, b) => a - b);
    if (peers.length === 0) return undefined;
    return peers[Math.floor(peers.length / 2)];
  }, [allSnapshots, snapshot]);
  const heroOrgs = useMemo(
    () =>
      DEMO_ORG_ORDER.slice(0, 5).map((slug) => ({
        slug,
        label: CHIP_META[slug]?.label ?? slug,
      })),
    [],
  );

  function tryResolve(raw: string): boolean {
    const normalized = raw.trim().toLowerCase().replace(/^@/, "");
    const snap = getMockSnapshot(normalized);
    if (snap) {
      setResolvedSlug(normalized);
      setInputValue(normalized);
      setLookupError(null);
      return true;
    }
    setLookupError(normalized);
    return false;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    tryResolve(inputValue);
  }

  function focusChallenge() {
    setLookupError(null);
    setInputValue("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050506] text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(251,191,36,0.22),transparent_42%),radial-gradient(ellipse_at_85%_18%,rgba(125,211,252,0.11),transparent_36%),radial-gradient(ellipse_at_50%_100%,rgba(250,204,21,0.08),transparent_45%)]" />
        <div className="absolute inset-0 noise-mask opacity-75" />
        <div className="absolute left-1/2 top-0 h-px w-[80vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <a href="#" className="text-sm font-semibold tracking-tight text-white">
            How Many Peters?
          </a>
          <a
            href="#demo"
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/15"
          >
            Try the benchmark
          </a>
        </nav>

        <Hero
          inputValue={inputValue}
          selectedOrg={resolvedSlug}
          orgs={heroOrgs}
          topRows={totalRows}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          onSelectOrg={tryResolve}
        />

        <section ref={demoAnchorRef} id="demo" className="space-y-8 scroll-mt-24">
          {lookupError && (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              We do not have a preview for{" "}
              <span className="font-semibold text-white">{lookupError}</span>. Try a preset chip or
              connect GitHub when installs open.
            </p>
          )}

          {snapshot && (
            <div className="space-y-8">
              <ComparisonStrip
                snapshot={snapshot}
                cohortMedianPeters={cohortMedianPeters}
              />
              <Leaderboard activeOrg={resolvedSlug} />
              <OrgComparison snapshots={allSnapshots} />

              <blockquote className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/35 px-5 py-5 sm:px-6 text-sm sm:text-base leading-relaxed text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="absolute right-6 top-4 text-6xl font-semibold tracking-[-0.08em] text-white/[0.035]">
                  diagnosis
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold block mb-2">
                  Diagnosis
                </span>
                {diagnosis}
              </blockquote>

              <SharePlaceholder snapshot={snapshot} onChallenge={focusChallenge} />
              <CategoryTable snapshot={snapshot} />
              <TrustPanel />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
