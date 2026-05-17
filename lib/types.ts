export type ContributionBreakdown = {
  total: number;
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  other?: number;
  restricted?: number;
};

export type ScorePeriod = "ytd";
export type VisibilityConfidence = "high" | "medium" | "low";
export type OrgScope = "org" | "team";
export type RankingMetric = "totalPeters" | "densityPeters" | "momentumPeters";

export type Cohort = {
  label: string;
  sizeBand: "startup" | "mid-size" | "large" | "enterprise";
  exposure: "oss-heavy" | "mixed" | "private-heavy";
};

export type VisibilityMeta = {
  mode: "public" | "private";
  confidence: VisibilityConfidence;
  completeness: number;
  note: string;
};

export type SnapshotFixture = {
  org: string;
  orgDisplayName: string;
  benchmarkUser: "steipete";
  date: string;
  scope: OrgScope;
  cohort: Cohort;
  visibility: VisibilityMeta;
  ytdStart: string;
  orgYtd: ContributionBreakdown;
  peterYtd: ContributionBreakdown;
  orgMeta: {
    activeContributors: number;
    repositories: number;
    privateReposIncluded: boolean;
  };
  forecast: {
    orgYearEndTotal: number;
    peterYearEndTotal: number;
    remainingDays: number;
  };
};

export type Snapshot = {
  org: string;
  orgDisplayName: string;
  benchmarkUser: "steipete";
  date: string;
  scope: OrgScope;
  cohort: Cohort;
  visibility: VisibilityMeta;
  ytdStart: string;
  orgYtd: ContributionBreakdown;
  peterYtd: ContributionBreakdown;
  orgMeta: {
    activeContributors: number;
    repositories: number;
    privateReposIncluded: boolean;
  };
  scores: {
    totalPeters: number;
    peterIndex: number;
    densityPeters: number;
    peterDensity: number;
    momentumPeters: number;
    gap: number;
    projectedYearEndIndex: number;
    totalRank?: number;
    densityRank?: number;
    momentumRank?: number;
    cohortRank?: number;
    /** Contributions per day needed for org to match Peter's projected year-end total */
    requiredDailyPaceToCatchPeter?: number;
  };
};

export type RankedOrg = {
  org: string;
  orgDisplayName: string;
  scope: OrgScope;
  cohort: Cohort;
  visibility: VisibilityMeta;
  totalPeters: number;
  densityPeters: number;
  momentumPeters: number;
  activeContributors: number;
  totalRank: number;
  densityRank: number;
  momentumRank: number;
  selectedRank: number;
};
