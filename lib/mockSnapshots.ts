import {
  applyRanks,
  buildSnapshot,
  sortByMetric,
  toRankedOrg,
} from "./peterMath";
import type { RankedOrg, RankingMetric, Snapshot, SnapshotFixture } from "./types";

const PETER_DAY = "2026-05-17";
const YTD_START = "2026-01-01";
const REMAINING_DAYS = 228;

// Verified via GitHub GraphQL for @steipete, 2026-01-01 through 2026-05-17.
export const VERIFIED_PETER_YTD_TOTAL = 203_761;
export const VERIFIED_PETER_RESTRICTED = 168_882;

// Public org search can reliably count commits, PRs, and issues. Org-wide PR reviews
// need a deeper collector, so this public preview excludes reviews from the denominator.
const peterPublicComparable: SnapshotFixture["peterYtd"] = {
  total: 34_682,
  commits: 33_875,
  pullRequests: 772,
  issues: 35,
  reviews: 0,
  restricted: VERIFIED_PETER_RESTRICTED,
};

const peterYearEndComparable = 92_410;

function projectedYearEnd(total: number): number {
  return Math.round((total / 137) * 365);
}

function fixture(input: Omit<SnapshotFixture, "benchmarkUser" | "date" | "ytdStart">): SnapshotFixture {
  return {
    benchmarkUser: "steipete",
    date: PETER_DAY,
    ytdStart: YTD_START,
    ...input,
  };
}

const MOCK_FIXTURES: Record<string, SnapshotFixture> = {
  incredibuild: fixture({
    org: "incredibuild",
    orgDisplayName: "Incredibuild",
    scope: "org",
    cohort: {
      label: "DevTools",
      sizeBand: "mid-size",
      exposure: "private-heavy",
    },
    visibility: {
      mode: "public",
      confidence: "low",
      completeness: 0,
      note: "No verified public GitHub org found at @incredibuild. Connect the real org to calculate.",
    },
    orgYtd: {
      total: 0,
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 0,
      repositories: 0,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: 0,
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),

  "islo-labs": fixture({
    org: "islo-labs",
    orgDisplayName: "Islo.dev",
    scope: "org",
    cohort: {
      label: "Startup R&D",
      sizeBand: "startup",
      exposure: "mixed",
    },
    visibility: {
      mode: "public",
      confidence: "high",
      completeness: 0.82,
      note: "Verified public GitHub Search counts for @islo-labs.",
    },
    orgYtd: {
      total: 4_518,
      commits: 2_721,
      pullRequests: 1_639,
      issues: 158,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 28,
      repositories: 5,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(4_518),
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),

  supabase: fixture({
    org: "supabase",
    orgDisplayName: "Supabase",
    scope: "org",
    cohort: {
      label: "Cloud Platforms",
      sizeBand: "mid-size",
      exposure: "oss-heavy",
    },
    visibility: {
      mode: "public",
      confidence: "medium",
      completeness: 0.74,
      note: "Verified PR/issue counts; commit search returned incomplete_results=true.",
    },
    orgYtd: {
      total: 11_661,
      commits: 4_114,
      pullRequests: 6_664,
      issues: 883,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 63,
      repositories: 412,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(11_661),
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),

  microsoft: fixture({
    org: "microsoft",
    orgDisplayName: "Microsoft",
    scope: "org",
    cohort: {
      label: "Enterprise",
      sizeBand: "enterprise",
      exposure: "mixed",
    },
    visibility: {
      mode: "public",
      confidence: "medium",
      completeness: 0.58,
      note: "Verified public GitHub Search counts for @microsoft; private work is excluded.",
    },
    orgYtd: {
      total: 374_313,
      commits: 169_922,
      pullRequests: 145_406,
      issues: 58_985,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 8_400,
      repositories: 6_200,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(374_313),
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),

  google: fixture({
    org: "google",
    orgDisplayName: "Google",
    scope: "org",
    cohort: {
      label: "Enterprise",
      sizeBand: "enterprise",
      exposure: "oss-heavy",
    },
    visibility: {
      mode: "public",
      confidence: "medium",
      completeness: 0.58,
      note: "Verified public counts summed across @google and @GoogleCloudPlatform.",
    },
    orgYtd: {
      total: 133_767,
      commits: 72_575,
      pullRequests: 53_744,
      issues: 7_448,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 6_200,
      repositories: 4_300,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(133_767),
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),

  awslabs: fixture({
    org: "awslabs",
    orgDisplayName: "AWS",
    scope: "org",
    cohort: {
      label: "Enterprise",
      sizeBand: "enterprise",
      exposure: "oss-heavy",
    },
    visibility: {
      mode: "public",
      confidence: "medium",
      completeness: 0.56,
      note: "Verified public counts summed across @aws and @awslabs.",
    },
    orgYtd: {
      total: 65_491,
      commits: 32_574,
      pullRequests: 28_108,
      issues: 4_809,
      reviews: 0,
      other: 0,
    },
    peterYtd: { ...peterPublicComparable },
    orgMeta: {
      activeContributors: 3_900,
      repositories: 2_100,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(65_491),
      peterYearEndTotal: peterYearEndComparable,
      remainingDays: REMAINING_DAYS,
    },
  }),
};

const RANKED_SNAPSHOTS = applyRanks(
  Object.values(MOCK_FIXTURES).map((entry) => buildSnapshot(entry)),
);

const SNAPSHOTS_BY_SLUG = Object.fromEntries(
  RANKED_SNAPSHOTS.map((snapshot) => [snapshot.org, snapshot]),
) as Record<string, Snapshot>;

export const DEMO_ORG_ORDER = [
  "incredibuild",
  "islo-labs",
  "supabase",
  "microsoft",
  "google",
  "awslabs",
] as const;

const ORG_ALIASES: Record<string, string> = {
  islo: "islo-labs",
  "islo.dev": "islo-labs",
  aws: "awslabs",
  amazon: "awslabs",
  googlecloudplatform: "google",
  gcp: "google",
};

export function getMockSnapshot(slug: string): Snapshot | undefined {
  const key = slug.trim().toLowerCase().replace(/^@/, "");
  return SNAPSHOTS_BY_SLUG[ORG_ALIASES[key] ?? key];
}

export function getAllSnapshots(): Snapshot[] {
  return RANKED_SNAPSHOTS;
}

export function getLeaderboardRows(metric: RankingMetric): RankedOrg[] {
  return sortByMetric(RANKED_SNAPSHOTS, metric).map((snapshot) =>
    toRankedOrg(snapshot, metric),
  );
}

export const PETER_BASELINE = {
  org: "steipete",
  orgDisplayName: "Peter",
  totalPeters: 1,
  densityPeters: 1,
  momentumPeters: 1,
  comparableYtdTotal: peterPublicComparable.total,
  verifiedYtdTotal: VERIFIED_PETER_YTD_TOTAL,
  restrictedYtdTotal: VERIFIED_PETER_RESTRICTED,
  ytdStart: YTD_START,
};
