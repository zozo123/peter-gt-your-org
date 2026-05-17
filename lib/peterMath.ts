import type {
  RankedOrg,
  RankingMetric,
  Snapshot,
  SnapshotFixture,
  VisibilityConfidence,
} from "./types";

type Scores = Snapshot["scores"];

export function buildSnapshot(fixture: SnapshotFixture): Snapshot {
  return {
    ...fixture,
    scores: buildScores(fixture),
  };
}

export function buildScores(fixture: SnapshotFixture): Scores {
  const peterIndex = safeRatio(fixture.orgYtd.total, fixture.peterYtd.total);
  const gap = fixture.orgYtd.total - fixture.peterYtd.total;
  const peterDensity =
    fixture.orgMeta.activeContributors > 0
      ? peterIndex / fixture.orgMeta.activeContributors
      : 0;
  const projectedYearEndIndex = safeRatio(
    fixture.forecast.orgYearEndTotal,
    fixture.forecast.peterYearEndTotal,
  );
  const momentumPeters = projectedYearEndIndex;
  const catchUpGap = fixture.forecast.peterYearEndTotal - fixture.orgYtd.total;
  // Only surface a catch-up pace when the org is currently behind Peter.
  // Otherwise giants like Microsoft (already ahead today) get a misleading
  // "must add N/day" alert just because Peter's projected year-end exceeds
  // the org's *current* YTD total — that's apples-to-pears.
  const orgIsCurrentlyBehind = fixture.orgYtd.total < fixture.peterYtd.total;

  return {
    totalPeters: peterIndex,
    peterIndex,
    densityPeters: peterDensity,
    peterDensity,
    momentumPeters,
    gap,
    projectedYearEndIndex,
    requiredDailyPaceToCatchPeter:
      orgIsCurrentlyBehind && catchUpGap > 0 && fixture.forecast.remainingDays > 0
        ? Math.ceil(catchUpGap / fixture.forecast.remainingDays)
        : undefined,
  };
}

export function applyRanks(snapshots: Snapshot[]): Snapshot[] {
  const totalRanks = rankMap(snapshots, "totalPeters");
  const densityRanks = rankMap(snapshots, "densityPeters");
  const momentumRanks = rankMap(snapshots, "momentumPeters");

  return snapshots.map((snapshot) => {
    const cohortPeers = snapshots.filter(
      (candidate) => candidate.cohort.label === snapshot.cohort.label,
    );
    const cohortRanks = rankMap(cohortPeers, "totalPeters");

    return {
      ...snapshot,
      scores: {
        ...snapshot.scores,
        totalRank: totalRanks.get(snapshot.org),
        densityRank: densityRanks.get(snapshot.org),
        momentumRank: momentumRanks.get(snapshot.org),
        cohortRank: cohortRanks.get(snapshot.org),
      },
    };
  });
}

export function toRankedOrg(snapshot: Snapshot, metric: RankingMetric): RankedOrg {
  const selectedRank =
    metric === "densityPeters"
      ? snapshot.scores.densityRank
      : metric === "momentumPeters"
        ? snapshot.scores.momentumRank
        : snapshot.scores.totalRank;

  return {
    org: snapshot.org,
    orgDisplayName: snapshot.orgDisplayName,
    scope: snapshot.scope,
    cohort: snapshot.cohort,
    visibility: snapshot.visibility,
    totalPeters: snapshot.scores.totalPeters,
    densityPeters: snapshot.scores.densityPeters,
    momentumPeters: snapshot.scores.momentumPeters,
    activeContributors: snapshot.orgMeta.activeContributors,
    totalRank: snapshot.scores.totalRank ?? 0,
    densityRank: snapshot.scores.densityRank ?? 0,
    momentumRank: snapshot.scores.momentumRank ?? 0,
    selectedRank: selectedRank ?? 0,
  };
}

export function sortByMetric<T extends Snapshot | RankedOrg>(
  rows: T[],
  metric: RankingMetric,
): T[] {
  return [...rows].sort((a, b) => {
    const left = metricValue(a, metric);
    const right = metricValue(b, metric);
    return right - left;
  });
}

function rankMap(snapshots: Snapshot[], metric: RankingMetric): Map<string, number> {
  const map = new Map<string, number>();
  sortByMetric(snapshots, metric).forEach((snapshot, index) => {
    map.set(snapshot.org, index + 1);
  });
  return map;
}

function metricValue(row: Snapshot | RankedOrg, metric: RankingMetric): number {
  if ("scores" in row) {
    return row.scores[metric];
  }
  return row[metric];
}

export function confidenceLabel(confidence: VisibilityConfidence): string {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

function safeRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return numerator === 0 ? 1 : Infinity;
  return numerator / denominator;
}

export function computedPeterIndex(snapshot: Snapshot): number {
  return safeRatio(snapshot.orgYtd.total, snapshot.peterYtd.total);
}

export function computedGap(snapshot: Snapshot): number {
  return snapshot.orgYtd.total - snapshot.peterYtd.total;
}

export function categoryPeterIndex(
  orgVal: number,
  peterVal: number,
): number {
  return safeRatio(orgVal, peterVal);
}

export type OrgTier =
  | "GitHub Intern Energy"
  | "Warming Up"
  | "Dangerous"
  | "Peter-Class"
  | "More Than One Peter"
  | "Peter Factory"
  | "Industrialized Peter";

export function orgTierLabel(peterIndex: number): OrgTier {
  if (peterIndex < 0.1) return "GitHub Intern Energy";
  if (peterIndex < 0.5) return "Warming Up";
  if (peterIndex < 0.9) return "Dangerous";
  if (peterIndex < 1.1) return "Peter-Class";
  if (peterIndex < 2.0) return "More Than One Peter";
  if (peterIndex < 5.0) return "Peter Factory";
  return "Industrialized Peter";
}

export type DensityTier =
  | "Calendar-Driven Development"
  | "Normal Human Org"
  | "Very Serious Builders"
  | "Check For Automation";

export function densityTierLabel(peterDensity: number): DensityTier {
  // Anchored to 1 Peter = 203,976 contributions (verified full graph).
  // Peter himself is 1.0 P/engineer by definition. Real orgs land 4–6 orders
  // of magnitude below that. Thresholds chosen so hyperscalers fall in the
  // bottom two tiers and small-but-prolific shops earn the top label.
  if (peterDensity < 0.0001) return "Calendar-Driven Development";
  if (peterDensity < 0.0005) return "Normal Human Org";
  if (peterDensity < 0.005) return "Very Serious Builders";
  return "Check For Automation";
}

export type CategoryKey =
  | "commits"
  | "pullRequests"
  | "issues"
  | "reviews";

export type CategoryInsight = {
  key: CategoryKey;
  label: string;
  ratio: number;
};

export function categoryInsights(snapshot: Snapshot): CategoryInsight[] {
  const pairs: { key: CategoryKey; label: string }[] = [
    { key: "commits", label: "Commits" },
    { key: "pullRequests", label: "Pull requests" },
    { key: "issues", label: "Issues" },
    { key: "reviews", label: "Reviews" },
  ];
  return pairs.map(({ key, label }) => ({
    key,
    label,
    ratio: categoryPeterIndex(snapshot.orgYtd[key], snapshot.peterYtd[key]),
  }));
}

function strongestCategories(insights: CategoryInsight[]): {
  ahead: CategoryInsight[];
  behind: CategoryInsight[];
} {
  const sorted = [...insights].sort((a, b) => b.ratio - a.ratio);
  const ahead = sorted.filter((c) => c.ratio >= 1.05);
  const behind = sorted.filter((c) => c.ratio <= 0.95);
  return {
    ahead: ahead.slice(0, 2),
    behind: behind.slice(-2).reverse(),
  };
}

function formatCat(list: CategoryInsight[]): string {
  if (list.length === 0) return "";
  return list
    .map((c) => `${c.label.toLowerCase()} (${c.ratio.toFixed(2)}× Peter)`)
    .join(", ");
}

/** Narrative shaped like the product spec. */
export function buildDiagnosis(snapshot: Snapshot): string {
  const index = snapshot.scores.peterIndex;
  const density = snapshot.scores.peterDensity;
  const gap = snapshot.scores.gap;
  const insights = categoryInsights(snapshot);
  const pr = insights.find((c) => c.key === "pullRequests")!;
  const commits = insights.find((c) => c.key === "commits")!;
  const reviews = insights.find((c) => c.key === "reviews")!;
  const { ahead, behind } = strongestCategories(insights);

  const aheadLine =
    ahead.length > 0
      ? `Where you lap Peter: ${formatCat(ahead)}.`
      : "Nobody loves admitting ties—nothing clearly leads Peter yet.";

  const behindLine =
    behind.length > 0
      ? `Where Peter still collects rent: ${formatCat(behind)}.`
      : "Peter doesn’t dominate every lane here.";

  let shape = "";
  if (reviews.ratio > commits.ratio + 0.25 && pr.ratio >= commits.ratio) {
    shape =
      "Diagnosis: collaboration-heavy machine—you’re buying throughput with reviews and PR motion instead of solo-commit stamina.";
  } else if (commits.ratio > pr.ratio + 0.15 && commits.ratio > reviews.ratio) {
    shape =
      "Diagnosis: commit-forward vs Peter—either builders ship straight to branches or PR granularity is wider than “tiny solo PR” cadence.";
  } else if (pr.ratio > 1.2 && reviews.ratio < pr.ratio - 0.1) {
    shape =
      "Diagnosis: PR factory vibes—creation is loud; keep merge latency honest so reviews don’t bottleneck.";
  } else {
    shape =
      "Diagnosis: blended silhouette—not purely solo-builder, not purely staff-augmented review theater.";
  }

  let opener = "";
  if (gap >= 0 && reviews.ratio > commits.ratio) {
    opener =
      "You might not be out-committing Peter, but you’re sculpting a different engineering system.";
  } else if (gap >= 0) {
    opener = "Org-level GitHub motion clears Peter—now argue about whether that matters.";
  } else if (reviews.ratio > 1.15 || pr.ratio > 1.15) {
    opener =
      "Trailing overall, yet collaborative lanes pop—classic ‘enterprise throughput vs solo crank’ tension.";
  } else {
    opener = "Behind on totals—either pace picks up or Peter stays the meme benchmark.";
  }

  const overall =
    gap >= 0
      ? `Scoreboard: ${index.toFixed(2)} Peters · +${gap.toLocaleString()} contributions vs Peter since Jan 1, 2026.`
      : `Scoreboard: ${index.toFixed(2)} Peters · ${gap.toLocaleString()} contributions in the hole vs Peter since Jan 1, 2026.`;

  const densityRoast =
    index >= 1 && density < 0.02
      ? `Translation: org velocity clears Peter; Peter Density sits at ${density.toFixed(3)}—leadership gets bragging rights, ICs still fear steipete’s graph.`
      : index >= 1
        ? `Peter Density ${density.toFixed(3)} keeps it humble—orgs rarely mirror solo caffeine arcs per capita.`
        : density >= 0.02
          ? `Peter Density ${density.toFixed(3)} is suspiciously juicy—peek for bots/automation before tweeting victory laps.`
          : `Peter Density ${density.toFixed(3)} screams coordination overhead—the fairness metric earns its paycheck.`;

  return [opener, overall, aheadLine, behindLine, shape, densityRoast].join(" ");
}
