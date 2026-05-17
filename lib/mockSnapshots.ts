import {
  applyRanks,
  buildSnapshot,
  sortByMetric,
  toRankedOrg,
} from "./peterMath";
import type { RankedOrg, RankingMetric, Snapshot, SnapshotFixture } from "./types";

export const PETER_DAY = "2026-05-17";
export const YTD_START = "2026-01-01";
export const REMAINING_DAYS = 228;
const DAYS_ELAPSED = 137;

// Verified live via GitHub GraphQL for @steipete, 2026-01-01 → 2026-05-17.
// Reproduce with: gh api graphql -f query='{user(login:"steipete"){contributionsCollection(from:"2026-01-01T00:00:00Z",to:"2026-05-17T23:59:59Z"){contributionCalendar{totalContributions} restrictedContributionsCount totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions}}}'
export const VERIFIED_PETER_YTD_TOTAL = 203_976;
export const VERIFIED_PETER_RESTRICTED = 168_882;
export const PETER_AVATAR_URL = "https://avatars.githubusercontent.com/u/58493?v=4";

// 1 Peter = @steipete's full 2026 YTD contribution graph (203,976 events).
// 82.8% of his motion lives in restricted/private repos that GitHub's public
// Search API cannot count for an org. The Peter denominator deliberately uses
// his full graph total — orgs are measured public-only, so the comparison is
// asymmetric by design and biased toward Peter. The trust panel calls this out.
// Per-category counts below stay public-only (that's all we can break down),
// so CategoryTable ratios compare apples-to-apples within each category.
export const PETER_YTD_REFERENCE: SnapshotFixture["peterYtd"] = {
  total: VERIFIED_PETER_YTD_TOTAL,
  commits: 34_083,
  pullRequests: 778,
  issues: 35,
  reviews: 176,
  restricted: VERIFIED_PETER_RESTRICTED,
};

export function projectedYearEnd(total: number): number {
  return Math.round((total / DAYS_ELAPSED) * 365);
}

export const PETER_YEAR_END_REFERENCE = projectedYearEnd(VERIFIED_PETER_YTD_TOTAL);

function fixture(input: Omit<SnapshotFixture, "benchmarkUser" | "date" | "ytdStart">): SnapshotFixture {
  return {
    benchmarkUser: "steipete",
    date: PETER_DAY,
    ytdStart: YTD_START,
    ...input,
  };
}

export const MOCK_FIXTURES: Record<string, SnapshotFixture> = {
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 0,
      repositories: 0,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: 0,
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 28,
      repositories: 5,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(4_518),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 63,
      repositories: 412,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(11_661),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 8_400,
      repositories: 6_200,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(374_313),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 6_200,
      repositories: 4_300,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(133_767),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
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
    peterYtd: { ...PETER_YTD_REFERENCE },
    orgMeta: {
      activeContributors: 3_900,
      repositories: 2_100,
      privateReposIncluded: false,
    },
    forecast: {
      orgYearEndTotal: projectedYearEnd(65_491),
      peterYearEndTotal: PETER_YEAR_END_REFERENCE,
      remainingDays: REMAINING_DAYS,
    },
  }),
};

export function buildRankedSnapshots(
  fixtures: Record<string, SnapshotFixture> = MOCK_FIXTURES,
): Snapshot[] {
  return applyRanks(Object.values(fixtures).map((entry) => buildSnapshot(entry)));
}

const RANKED_SNAPSHOTS = buildRankedSnapshots();

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

export function resolveOrgSlug(slug: string): string {
  const key = slug.trim().toLowerCase().replace(/^@/, "");
  return ORG_ALIASES[key] ?? key;
}

export function getSnapshotBySlug(
  slug: string,
  snapshots: Snapshot[] = RANKED_SNAPSHOTS,
): Snapshot | undefined {
  const key = resolveOrgSlug(slug);
  return snapshots.find((snapshot) => snapshot.org === key);
}

export function getMockSnapshot(slug: string): Snapshot | undefined {
  return SNAPSHOTS_BY_SLUG[resolveOrgSlug(slug)];
}

export function getAllSnapshots(): Snapshot[] {
  return RANKED_SNAPSHOTS;
}

export function getLeaderboardRows(metric: RankingMetric): RankedOrg[] {
  return getLeaderboardRowsForSnapshots(RANKED_SNAPSHOTS, metric);
}

export function getLeaderboardRowsForSnapshots(
  snapshots: Snapshot[],
  metric: RankingMetric,
): RankedOrg[] {
  return sortByMetric(snapshots, metric).map((snapshot) =>
    toRankedOrg(snapshot, metric),
  );
}

export const PETER_BASELINE = {
  org: "steipete",
  orgDisplayName: "Peter",
  avatarUrl: PETER_AVATAR_URL,
  totalPeters: 1,
  densityPeters: 1,
  momentumPeters: 1,
  comparableYtdTotal: PETER_YTD_REFERENCE.total,
  verifiedYtdTotal: VERIFIED_PETER_YTD_TOTAL,
  restrictedYtdTotal: VERIFIED_PETER_RESTRICTED,
  ytdStart: YTD_START,
};
